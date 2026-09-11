import { MESSAGE_TYPES } from '../core/constants.js';

const WAIT_AFTER_LOAD_MS = 700;

/** A queue kept separate from the image-download workflow. */
export class ArticleCopyManager {
  constructor() {
    this.runId = 0;
    this.state = { runId: this.runId, status: 'idle', queue: [], currentIndex: -1, copiedText: '', error: '' };
    this.stopped = false;
    this.initPromise = this.loadState();
  }

  async loadState() {
    try {
      const data = await chrome.storage.local.get('articleCopyState');
      if (data.articleCopyState) {
        this.state = data.articleCopyState;
        this.runId = this.state.runId || 0;
        // If it was interrupted mid-run, mark it as stopped
        if (this.state.status === 'copying') {
          this.state.status = 'stopped';
        }
      }
    } catch (e) {
      console.warn('Failed to load article copy state:', e);
    }
  }

  async saveState() {
    try {
      await chrome.storage.local.set({ articleCopyState: this.state });
    } catch (e) {
      console.warn('Failed to save article copy state:', e);
    }
  }

  async reset() {
    this.state = { runId: this.runId, status: 'idle', queue: [], currentIndex: -1, copiedText: '', error: '' };
    this.stopped = false;
    await this.saveState();
  }

  async fullReset() {
    await this.initPromise;
    this.runId = 0;
    await this.reset();
  }

  async getState() {
    await this.initPromise;
    return this.state;
  }

  async start(links, tabId, options = {}) {
    await this.initPromise;
    if (this.state.status === 'copying') return;
    if (!tabId) throw new Error('No browser tab is available for opening the links.');
    this.runId += 1;
    this.stopped = false;
    this.tabId = tabId;
    this.state.runId = this.runId;

    const newItems = links.map((url) => ({ url, status: 'pending', title: '', content: '', words: 0, chars: 0, error: '' }));
    this.state.queue = (this.state.queue || []).concat(newItems);
    this.state.status = 'copying';
    this.saveState();

    // Run queue in background
    this._processQueue(options).catch(e => console.error('Queue error:', e));
  }

  async _processQueue(options) {
    for (let index = 0; index < this.state.queue.length && !this.stopped; index += 1) {
      const item = this.state.queue[index];
      if (item.status === 'copied' || item.status === 'failed') {
        continue;
      }
      this.state.currentIndex = index;
      item.status = 'loading';
      this.saveState();
      try {
        await this.navigateAndWait(item.url);
        if (this.stopped) break;
        item.status = 'extracting';
        this.saveState();
        const result = await chrome.tabs.sendMessage(this.tabId, { action: MESSAGE_TYPES.ARTICLE_CONTENT_EXTRACTED, options });
        if (!result?.text) throw new Error('No article text was found on this page.');
        item.title = result.title || 'Untitled article';
        item.content = result.text.trim();
        item.words = result.text.trim().split(/\s+/).filter(Boolean).length;
        item.chars = result.text.trim().length;
        item.status = 'copied';
        this.state.copiedText += `${this.state.copiedText ? '\n\n' : ''}${result.text.trim()}`;
      } catch (error) {
        item.status = 'failed';
        item.error = error.message || 'Could not read this link.';
      }
      this.saveState();
    }
    this.state.currentIndex = -1;
    this.state.status = this.stopped ? 'stopped' : 'completed';
    this.saveState();
  }

  async stop() {
    await this.initPromise;
    this.stopped = true;
    this.state.status = 'stopped';
    this.saveState();
  }

  async navigateAndWait(url) {
    // Chrome does not emit an onUpdated "complete" event when the requested
    // URL is already the fully loaded active page. In that case it is ready
    // to extract immediately rather than timing out after 30 seconds.
    const currentTab = await chrome.tabs.get(this.tabId);
    if (currentTab.url === url && currentTab.status === 'complete') {
      await new Promise((resolve) => setTimeout(resolve, WAIT_AFTER_LOAD_MS));
      return;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => finish(new Error('The page took too long to load.')), 30000);
      const onUpdated = (updatedTabId, info) => {
        if (updatedTabId === this.tabId && info.status === 'complete') {
          setTimeout(() => finish(), WAIT_AFTER_LOAD_MS);
        }
      };
      const finish = (error) => {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(onUpdated);
        error ? reject(error) : resolve();
      };
      chrome.tabs.onUpdated.addListener(onUpdated);
      chrome.tabs.update(this.tabId, { url }).then((tab) => {
        // A very fast navigation can complete before the update listener has
        // an opportunity to run, so use the returned tab as a second signal.
        if (tab.status === 'complete') setTimeout(() => finish(), WAIT_AFTER_LOAD_MS);
      }).catch(finish);
    });
  }
}
