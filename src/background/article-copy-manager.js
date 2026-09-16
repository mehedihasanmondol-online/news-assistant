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
    const currentTab = await chrome.tabs.get(this.tabId);
    const isSameUrl = currentTab.url.replace(/\/+$/, '') === url.replace(/\/+$/, '');

    return new Promise((resolve, reject) => {
      let isDone = false;
      let pingInterval = null;

      const finish = (error) => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timeout);
        clearInterval(pingInterval);
        chrome.tabs.onUpdated.removeListener(onUpdated);
        error ? reject(error) : resolve();
      };

      const timeout = setTimeout(() => finish(new Error('The page took too long to load.')), 25000);

      const isUrlMatch = (current, target) => {
        if (!current || !target) return false;
        try {
          const u1 = new URL(current);
          const u2 = new URL(target);
          return u1.origin === u2.origin && u1.pathname.replace(/\/+$/, '') === u2.pathname.replace(/\/+$/, '');
        } catch (e) {
          return current.replace(/\/+$/, '') === target.replace(/\/+$/, '');
        }
      };

      let navigationStarted = !isSameUrl;
      const onUpdated = (updatedTabId, info) => {
        if (updatedTabId !== this.tabId) return;
        if (info.status === 'loading') {
          navigationStarted = true;
        }
        if (info.status === 'complete') {
          setTimeout(() => finish(), WAIT_AFTER_LOAD_MS);
        }
      };
      chrome.tabs.onUpdated.addListener(onUpdated);

      // Fast polling: check if content script is active and DOM is ready.
      // Once ready, content script calls window.stop() to halt video/heavy resource loading.
      let pingAttempts = 0;
      pingInterval = setInterval(async () => {
        if (isDone) return;
        if (!navigationStarted) return;
        pingAttempts++;
        try {
          const res = await chrome.tabs.sendMessage(this.tabId, { action: 'PING_READY' });
          if (isUrlMatch(res?.url, url)) {
            if (res.ready) {
              setTimeout(() => finish(), 300);
            } else if (pingAttempts >= 20) {
              // Grace period for SPAs: after ~7s of waiting for client rendering, proceed anyway
              setTimeout(() => finish(), 300);
            }
          }
        } catch (e) {
          // Page is still transitioning/loading, keep waiting
        }
      }, 350);

      if (isSameUrl) {
        chrome.tabs.reload(this.tabId).catch(finish);
      } else {
        chrome.tabs.update(this.tabId, { url }).then((tab) => {
          if (tab.status === 'complete') setTimeout(() => finish(), WAIT_AFTER_LOAD_MS);
        }).catch(finish);
      }
    });
  }
}
