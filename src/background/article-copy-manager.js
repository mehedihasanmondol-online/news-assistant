import { MESSAGE_TYPES } from '../core/constants.js';

const WAIT_AFTER_LOAD_MS = 700;

/** A queue kept separate from the image-download workflow. */
export class ArticleCopyManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.state = { status: 'idle', queue: [], currentIndex: -1, copiedText: '', error: '' };
    this.stopped = false;
  }

  getState() {
    return this.state;
  }

  async start(links, tabId) {
    if (!tabId) throw new Error('No browser tab is available for opening the links.');
    this.reset();
    this.tabId = tabId;
    this.state.queue = links.map((url) => ({ url, status: 'pending', title: '', content: '', words: 0, error: '' }));
    this.state.status = 'copying';

    for (let index = 0; index < this.state.queue.length && !this.stopped; index += 1) {
      this.state.currentIndex = index;
      const item = this.state.queue[index];
      item.status = 'loading';
      try {
        await this.navigateAndWait(item.url);
        if (this.stopped) break;
        item.status = 'extracting';
        const result = await chrome.tabs.sendMessage(this.tabId, { action: MESSAGE_TYPES.ARTICLE_CONTENT_EXTRACTED });
        if (!result?.text) throw new Error('No article text was found on this page.');
        item.title = result.title || 'Untitled article';
        item.content = result.text.trim();
        item.words = result.text.trim().split(/\s+/).filter(Boolean).length;
        item.status = 'copied';
        this.state.copiedText += `${this.state.copiedText ? '\n\n' : ''}${result.text.trim()}`;
      } catch (error) {
        item.status = 'failed';
        item.error = error.message || 'Could not read this link.';
      }
    }
    this.state.currentIndex = -1;
    this.state.status = this.stopped ? 'stopped' : 'completed';
  }

  stop() {
    this.stopped = true;
    this.state.status = 'stopped';
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
