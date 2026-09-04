import { StateManager } from './state-manager.js';
import { DownloadManager } from './download-manager.js';
import { QueueManager } from './queue-manager.js';
import { Logger } from '../utils/logger.js';
import { MESSAGE_TYPES } from '../core/constants.js';
import { ArticleCopyManager } from './article-copy-manager.js';

const stateManager = new StateManager();
const downloadManager = new DownloadManager(stateManager);
const queueManager = new QueueManager(stateManager, downloadManager);
const articleCopyManager = new ArticleCopyManager();

// Initialize state from storage on startup
stateManager.loadState();

// Open side panel when extension action button is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  Logger.info(`Background received message: ${request.action}`);

  switch (request.action) {
    case MESSAGE_TYPES.GET_STATE:
      sendResponse(stateManager.getState());
      break;

    case MESSAGE_TYPES.START_QUEUE:
      stateManager.initQueue(request.payload.titles);
      queueManager.start(request.payload.tabId);
      sendResponse({ success: true });
      break;

    case MESSAGE_TYPES.PAUSE_QUEUE:
      queueManager.pause();
      sendResponse({ success: true });
      break;

    case MESSAGE_TYPES.RESUME_QUEUE:
      queueManager.resume();
      sendResponse({ success: true });
      break;

    case MESSAGE_TYPES.STOP_QUEUE:
      queueManager.stop();
      sendResponse({ success: true });
      break;

    case MESSAGE_TYPES.UPDATE_SETTINGS:
      stateManager.saveSettings(request.payload);
      sendResponse({ success: true });
      break;

    case MESSAGE_TYPES.GET_ARTICLE_COPY_STATE:
      sendResponse(articleCopyManager.getState());
      break;

    case MESSAGE_TYPES.START_ARTICLE_COPY:
      articleCopyManager.start(request.payload.links, request.payload.tabId)
        .catch((error) => console.error('Article copy queue failed:', error));
      sendResponse({ success: true, runId: articleCopyManager.getState().runId });
      break;

    case MESSAGE_TYPES.STOP_ARTICLE_COPY:
      articleCopyManager.stop();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }

  return true; // Keep channel open for async responses
});
