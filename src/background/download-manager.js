import { sanitizeFilename, getExtensionFromUrl } from '../core/filename-utils.js';
import { Logger } from '../utils/logger.js';

export class DownloadManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Downloads an image using the Chrome Downloads API.
   * @param {Object} candidate - The image candidate.
   * @param {string} title - The news title.
   * @param {number} index - The sequential index for the filename.
   * @returns {Promise<boolean>} - True if successful.
   */
  async downloadImage(candidate, title, index) {
    const url = candidate.originalUrl || candidate.thumbnailUrl;
    if (!url) return false;

    const settings = this.stateManager.getState().settings;
    const rootFolder = sanitizeFilename(settings.rootFolder);
    const sanitizedTitle = sanitizeFilename(title);
    const extension = getExtensionFromUrl(url);
    
    // Format: 01.jpg, 02.png
    const filename = `${index.toString().padStart(2, '0')}.${extension}`;
    // No root prefix lets Chrome use the browser's configured Downloads
    // location while still organizing files inside one folder per news title.
    const path = settings.saveToDownloadsRoot !== false
      ? `${sanitizedTitle}/${filename}`
      : `${rootFolder}/${sanitizedTitle}/${filename}`;

    return new Promise((resolve) => {
      chrome.downloads.download({
        url: url,
        filename: path,
        conflictAction: 'uniquify',
        saveAs: false
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          Logger.error(`Download failed for ${url}:`, chrome.runtime.lastError);
          resolve(false);
        } else {
          Logger.info(`Started download ${downloadId} to ${path}`);
          // Monitor download completion
          this.monitorDownload(downloadId, resolve);
        }
      });
    });
  }

  monitorDownload(downloadId, resolve) {
    const listener = (delta) => {
      if (delta.id === downloadId && delta.state) {
        if (delta.state.current === 'complete') {
          chrome.downloads.onChanged.removeListener(listener);
          resolve(true);
        } else if (delta.state.current === 'interrupted') {
          chrome.downloads.onChanged.removeListener(listener);
          Logger.warn(`Download ${downloadId} interrupted.`);
          resolve(false);
        }
      }
    };
    chrome.downloads.onChanged.addListener(listener);
  }
}
