import { QUEUE_STATUS } from '../core/constants.js';
import { Logger } from '../utils/logger.js';
import { scoreImage } from '../core/image-scorer.js';
import { filterCandidates } from '../core/image-filter.js';

export class QueueManager {
  constructor(stateManager, downloadManager) {
    this.stateManager = stateManager;
    this.downloadManager = downloadManager;
    this.activeTabId = null;    // The current (foreground) tab to use
    this.isPaused = false;
    this.isStopped = false;
  }

  /**
   * Starts queue processing.
   * @param {number} tabId - The active tab ID passed from the sidepanel.
   */
  async start(tabId) {
    this.isPaused = false;
    this.isStopped = false;
    this.activeTabId = tabId || null;
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
    this.activeTabId = null;
  }

  async processQueue() {
    const state = this.stateManager.getState();
    const queue = state.queue;
    const startIdx = state.currentTitleIndex === -1 ? 0 : state.currentTitleIndex;

    for (let i = startIdx; i < queue.length; i++) {
      if (this.isStopped) break;

      // Pause loop — wait until resumed or stopped
      while (this.isPaused) {
        await this._sleep(1000);
        if (this.isStopped) return;
      }

      state.currentTitleIndex = i;
      const item = queue[i];

      if (item.status === QUEUE_STATUS.COMPLETED || item.status === QUEUE_STATUS.FAILED) {
        continue;
      }

      await this.processItem(i, item);

      // Polite delay between searches
      if (i < queue.length - 1 && !this.isStopped) {
        const delay = state.settings.delayBetweenSearchesMs || 3000;
        await this._sleep(delay);
      }
    }

    if (!this.isStopped && !this.isPaused) {
      state.overallStatus = QUEUE_STATUS.COMPLETED;
    }
  }

  async processItem(index, item) {
    const state = this.stateManager.getState();
    this.stateManager.updateItemStatus(index, QUEUE_STATUS.SEARCHING);
    Logger.info(`Processing: ${item.title}`);

    try {
      const candidates = await this.searchGoogleImages(item.title);

      if (this.isStopped) return;

      this.stateManager.updateItemStatus(index, QUEUE_STATUS.EXTRACTING);

      const filtered = filterCandidates(candidates, state.settings);
      // Sort by score descending — best images first
      filtered.sort((a, b) => scoreImage(b, state.settings) - scoreImage(a, state.settings));

      item.candidates = filtered;
      Logger.info(`${item.title}: ${candidates.length} candidates found, ${filtered.length} passed filter.`);

      this.stateManager.updateItemStatus(index, QUEUE_STATUS.DOWNLOADING);

      let downloadedCount = 0;
      let candidateIndex = 0;

      while (downloadedCount < state.settings.imagesPerTitle && candidateIndex < filtered.length) {
        if (this.isStopped) return;

        while (this.isPaused) {
          await this._sleep(1000);
          if (this.isStopped) return;
        }

        const candidate = filtered[candidateIndex];
        const success = await this.downloadManager.downloadImage(candidate, item.title, downloadedCount + 1);

        if (success) {
          downloadedCount++;
          state.stats.downloadedImages++;
          item.downloaded = downloadedCount;
          Logger.info(`Downloaded image ${downloadedCount}/${state.settings.imagesPerTitle} for "${item.title}"`);
        } else {
          item.failed = (item.failed || 0) + 1;
          state.stats.skippedImages++;
          Logger.warn(`Skipped a candidate for "${item.title}".`);
        }

        candidateIndex++;
        await this._sleep(500); // Small delay between downloads
      }

      if (downloadedCount > 0) {
        this.stateManager.updateItemStatus(index, QUEUE_STATUS.COMPLETED);
        state.stats.completed++;
      } else {
        this.stateManager.updateItemStatus(index, QUEUE_STATUS.FAILED);
        state.stats.failed++;
        item.error = 'No valid images could be downloaded.';
      }

    } catch (error) {
      Logger.error(`Error processing "${item.title}":`, error);
      this.stateManager.updateItemStatus(index, QUEUE_STATUS.FAILED);
      state.stats.failed++;
      item.error = error.message;
    }
  }

  /**
   * Navigates the active (foreground) tab to Google Images and retrieves candidates.
   * The user can watch this happen live in their browser.
   */
  async searchGoogleImages(title) {
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(title)}&hl=en`;

    return new Promise(async (resolve, reject) => {
      try {
        let tabId = this.activeTabId;

        // If we don't have a stored tab, get the current active tab
        if (!tabId) {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!activeTab) {
            return reject(new Error('No active tab found.'));
          }
          tabId = activeTab.id;
          this.activeTabId = tabId;
        }

        // Navigate the active tab to Google Images
        await chrome.tabs.update(tabId, { url });

        const onUpdated = (updatedTabId, info) => {
          if (updatedTabId !== tabId) return;
          if (info.status !== 'complete') return;

          chrome.tabs.onUpdated.removeListener(onUpdated);

          // Wait a brief moment for dynamic content to settle
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action: 'EXTRACT_IMAGES' }, (response) => {
              if (chrome.runtime.lastError) {
                Logger.warn('Content script not ready, retrying in 2s...');
                setTimeout(() => {
                  chrome.tabs.sendMessage(tabId, { action: 'EXTRACT_IMAGES' }, (retryResponse) => {
                    if (chrome.runtime.lastError || !retryResponse) {
                      reject(new Error(`Content script communication failed: ${chrome.runtime.lastError?.message}`));
                    } else {
                      resolve(retryResponse.candidates || []);
                    }
                  });
                }, 2000);
              } else if (response && response.success) {
                resolve(response.candidates || []);
              } else {
                resolve([]);
              }
            });
          }, 1500);
        };

        chrome.tabs.onUpdated.addListener(onUpdated);

        // Safety timeout — reject after 30s to avoid hanging
        setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(onUpdated);
          reject(new Error(`Timeout waiting for Google Images to load for "${title}"`));
        }, 30000);

      } catch (err) {
        reject(err);
      }
    });
  }

  _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}
