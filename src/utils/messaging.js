/**
 * Utility for sending messages between extension components.
 */
export class Messenger {
  /**
   * Send a message to the background script.
   */
  static async sendToBackground(action, payload = {}) {
    try {
      const response = await chrome.runtime.sendMessage({ action, payload });
      return response;
    } catch (error) {
      console.error('Error sending message to background:', error);
      return null;
    }
  }

  /**
   * Send a message to a specific tab.
   */
  static async sendToTab(tabId, action, payload = {}) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { action, payload });
      return response;
    } catch (error) {
      console.error(`Error sending message to tab ${tabId}:`, error);
      return null;
    }
  }
}
