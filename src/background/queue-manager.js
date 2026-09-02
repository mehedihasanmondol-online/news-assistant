import { QUEUE_STATUS } from '../core/constants.js';
import { Logger } from '../utils/logger.js';
import { scoreImage } from '../core/image-scorer.js';
import { filterCandidates } from '../core/image-filter.js';

export class QueueManager {
  constructor(stateManager, downloadManager) {
    this.stateManager = stateManager;
    this.downloadManager = downloadManager;
    this.activeTabId = null;
    this.isPaused = false;
    this.isStopped = false;
  }

  async start() {
    this.isPaused = false;
    this.isStopped = false;
    this.stateManager.state.overallStatus = QUEUE_STATUS.SEARCHING;
    await this.processQueue();
  }

  pause() {
    this.isPaused = true;
    this.stateManager.state.overallStatus = QUEUE_STATUS.PAUSED;
  }

  resume() {
    this.isPaused = false;
    this.stateManager.state.overallStatus = QUEUE_STATUS.SEARCHING;
    this.processQueue();
  }

  stop() {
    this.isStopped = true;
    this.stateManager.state.overallStatus = QUEUE_STATUS.COMPLETED;
    if (this.activeTabId) {
      chrome.tabs.remove(this.activeTabId);
      this.activeTabId = null;
    }
  }

  async processQueue() {
    const state = this.stateManager.getState();
    const queue = state.queue;

    for (let i = state.currentTitleIndex === -1 ? 0 : state.currentTitleIndex; i < queue.length; i++) {
      if (this.isStopped) break;
      while (this.isPaused) {
        await new Promise(r => setTimeout(r, 1000)); // wait while paused
        if (this.isStopped) return;
      }

      state.currentTitleIndex = i;
      const item = queue[i];

      if (item.status === QUEUE_STATUS.COMPLETED || item.status === QUEUE_STATUS.FAILED) {
        continue;
      }

      await this.processItem(i, item);
      
      // Delay between searches
      await new Promise(r => setTimeout(r, state.settings.delayBetweenSearchesMs));
    }

    if (!this.isStopped && !this.isPaused) {
      state.overallStatus = QUEUE_STATUS.COMPLETED;
      if (this.activeTabId) {
        chrome.tabs.remove(this.activeTabId);
        this.activeTabId = null;
      }
    }
  }

  async processItem(index, item) {
    const state = this.stateManager.getState();
    this.stateManager.updateItemStatus(index, QUEUE_STATUS.SEARCHING);
    Logger.info(`Processing: ${item.title}`);

    try {
      const candidates = await this.searchGoogleImages(item.title);
      this.stateManager.updateItemStatus(index, QUEUE_STATUS.EXTRACTING);
      
      const filtered = filterCandidates(candidates, state.settings);
      // Sort by score descending
      filtered.sort((a, b) => scoreImage(b) - scoreImage(a));
      
      item.candidates = filtered;
      
      this.stateManager.updateItemStatus(index, QUEUE_STATUS.DOWNLOADING);
      
      let downloadedCount = 0;
      let candidateIndex = 0;
      
      while (downloadedCount < state.settings.imagesPerTitle && candidateIndex < filtered.length) {
        if (this.isStopped) return;
        while (this.isPaused) {
          await new Promise(r => setTimeout(r, 1000));
        }

        const candidate = filtered[candidateIndex];
        const success = await this.downloadManager.downloadImage(candidate, item.title, downloadedCount + 1);
        
        if (success) {
          downloadedCount++;
          state.stats.downloadedImages++;
          item.downloaded = downloadedCount;
        } else {
          item.failed++;
          state.stats.skippedImages++;
        }
        
        candidateIndex++;
        // Small delay between downloads
        await new Promise(r => setTimeout(r, 500));
      }

      if (downloadedCount > 0) {
        this.stateManager.updateItemStatus(index, QUEUE_STATUS.COMPLETED);
        state.stats.completed++;
      } else {
         this.stateManager.updateItemStatus(index, QUEUE_STATUS.FAILED);
         state.stats.failed++;
      }

    } catch (error) {
      Logger.error(`Error processing item ${item.title}:`, error);
      this.stateManager.updateItemStatus(index, QUEUE_STATUS.FAILED);
      state.stats.failed++;
    }
  }

  async searchGoogleImages(title) {
    return new Promise((resolve, reject) => {
      const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(title)}`;
      
      const onUpdate = (tabId, info) => {
         if (tabId === this.activeTabId && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(onUpdate);
            // Execute content script if not already injected by manifest
            chrome.tabs.sendMessage(this.activeTabId, { action: 'EXTRACT_IMAGES' }, (response) => {
                if (chrome.runtime.lastError) {
                   // Content script might not be ready, wait a bit and retry
                   setTimeout(() => {
                      chrome.tabs.sendMessage(this.activeTabId, { action: 'EXTRACT_IMAGES' }, (retryResponse) => {
                         if (chrome.runtime.lastError || !retryResponse) {
                            reject(new Error("Failed to communicate with content script"));
                         } else {
                            resolve(retryResponse.candidates || []);
                         }
                      });
                   }, 2000);
                } else if (response) {
                   resolve(response.candidates || []);
                } else {
                   resolve([]);
                }
            });
         }
      };

      if (!this.activeTabId) {
        chrome.tabs.create({ url, active: false }, (tab) => {
          this.activeTabId = tab.id;
          chrome.tabs.onUpdated.addListener(onUpdate);
        });
      } else {
        chrome.tabs.onUpdated.addListener(onUpdate);
        chrome.tabs.update(this.activeTabId, { url });
      }
    });
  }
}
