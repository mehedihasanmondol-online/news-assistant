import { DEFAULT_SETTINGS, QUEUE_STATUS } from '../core/constants.js';

/**
 * Manages the global state of the extension.
 */
export class StateManager {
  constructor() {
    this.state = {
      queue: [],
      settings: { ...DEFAULT_SETTINGS },
      overallStatus: QUEUE_STATUS.COMPLETED, // e.g. running, paused, stopped
      currentTitleIndex: -1,
      stats: {
        completed: 0,
        failed: 0,
        downloadedImages: 0,
        skippedImages: 0
      }
    };
  }

  async loadState() {
    const data = await chrome.storage.local.get(['newsDownloaderState', 'newsDownloaderSettings']);
    if (data.newsDownloaderSettings) {
      this.state.settings = { ...this.state.settings, ...data.newsDownloaderSettings };
    }
    // We only load settings persistently. Queue state could be complex to resume exactly if tab closed, 
    // but we can try to recover basic queue if needed. For now, queue is session based.
  }

  async saveSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    await chrome.storage.local.set({ newsDownloaderSettings: this.state.settings });
  }

  initQueue(titles) {
    this.state.queue = titles.map((item, index) => {
      const isObj = typeof item === 'object' && item !== null;
      const title = (isObj ? item.title : item) || '';
      const serialNumber = isObj && item.serialNumber != null ? item.serialNumber : (index + 1);
      return {
        title: title.trim(),
        serialNumber,
        status: QUEUE_STATUS.PENDING,
        downloaded: 0,
        failed: 0,
        candidates: []
      };
    }).filter(item => item.title.length > 0);
    
    // Deduplicate
    const uniqueTitles = new Set();
    this.state.queue = this.state.queue.filter(item => {
      if (uniqueTitles.has(item.title)) {
        return false; // Skip duplicate
      }
      uniqueTitles.add(item.title);
      return true;
    });

    this.state.overallStatus = QUEUE_STATUS.PENDING;
    this.state.currentTitleIndex = -1;
    this.state.stats = { completed: 0, failed: 0, downloadedImages: 0, skippedImages: 0 };
  }

  updateItemStatus(index, status) {
    if (this.state.queue[index]) {
      this.state.queue[index].status = status;
    }
  }

  getState() {
    return this.state;
  }
}
