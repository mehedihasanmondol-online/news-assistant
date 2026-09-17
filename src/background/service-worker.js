import { StateManager } from './state-manager.js';
import { DownloadManager } from './download-manager.js';
import { QueueManager } from './queue-manager.js';
import { Logger } from '../utils/logger.js';
import { MESSAGE_TYPES, CHATBOT_TARGETS } from '../core/constants.js';
import { ArticleCopyManager } from './article-copy-manager.js';

const stateManager = new StateManager();
const downloadManager = new DownloadManager(stateManager);
const queueManager = new QueueManager(stateManager, downloadManager);
const articleCopyManager = new ArticleCopyManager();

// Initialize state from storage on startup
stateManager.loadState();
articleCopyManager.loadState();

// Open side panel when extension action button is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  Logger.info(`Background received message: ${request.action}`);

  (async () => {
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
        sendResponse(await articleCopyManager.getState());
        break;

      case MESSAGE_TYPES.START_ARTICLE_COPY:
        articleCopyManager.start(request.payload.links, request.payload.tabId, request.payload.options)
          .catch((error) => console.error('Article copy queue failed:', error));
        const state = await articleCopyManager.getState();
        sendResponse({ success: true, runId: state.runId });
        break;

      case MESSAGE_TYPES.STOP_ARTICLE_COPY:
        await articleCopyManager.stop();
        sendResponse({ success: true });
        break;

      case MESSAGE_TYPES.CLEAR_ARTICLE_COPY:
        await articleCopyManager.fullReset();
        sendResponse({ success: true });
        break;

      case MESSAGE_TYPES.RUN_CHATBOT_PROMPT: {
        const { target, prompt, autoSubmit, runId } = request.payload || {};
        const botConfig = CHATBOT_TARGETS[target] || CHATBOT_TARGETS.chatgpt;
        const targetUrl = botConfig.url;

        // Store pending prompt payload for content script to consume
        const payload = {
          target: botConfig.id,
          prompt,
          autoSubmit: autoSubmit !== false,
          runId: runId || ('prompt-run-' + Date.now()),
          timestamp: Date.now()
        };
        await chrome.storage.local.set({ pendingChatbotPrompt: payload });

        // Open target chatbot URL in new tab
        const tab = await chrome.tabs.create({ url: targetUrl, active: true });

        // Optional fallback: only send message if content script did not consume storage prompt
        if (tab?.id) {
          const tabUpdateListener = (updatedTabId, changeInfo) => {
            if (updatedTabId === tab.id && changeInfo.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(tabUpdateListener);
              setTimeout(async () => {
                try {
                  const stored = await chrome.storage.local.get('pendingChatbotPrompt');
                  if (stored?.pendingChatbotPrompt) {
                    await chrome.tabs.sendMessage(tab.id, {
                      action: 'INJECT_CHATBOT_PROMPT',
                      payload
                    });
                  }
                } catch {
                  // Harmless if tab closed or already consumed
                }
              }, 3000);
            }
          };
          chrome.tabs.onUpdated.addListener(tabUpdateListener);
          // Auto remove listener after 40 seconds to prevent leak
          setTimeout(() => chrome.tabs.onUpdated.removeListener(tabUpdateListener), 40000);
        }

        sendResponse({ success: true, tabId: tab?.id, runId: payload.runId });
        break;
      }

      case MESSAGE_TYPES.CHATBOT_PROMPT_STATUS: {
        sendResponse({ success: true, acknowledged: true });
        break;
      }

      default:
        sendResponse({ error: 'Unknown action' });
    }
  })();

  return true; // Keep channel open for async responses
});
