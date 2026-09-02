# News Image Downloader

A Chrome/Chromium Manifest V3 extension that takes a list of news titles and automatically searches Google Images to download high-quality, relevant images for each title into organized folders.

## Features
- **Bulk Processing**: Paste multiple news titles and let the extension queue and process them sequentially.
- **Original High-Quality Images**: Extracts the original image URLs instead of relying purely on thumbnails.
- **Smart Filtering**: Configurable settings to prioritize large images, with 16:9, 4:3, 1:1, 3:4, and 9:16 aspect-ratio recommendations.
- **Saved Settings**: Save download preferences independently, so they are ready for the next batch.
- **Background Operations**: Uses a background service worker to manage the download queue, ensuring it runs reliably even if the popup is closed.
- **Organized Downloads**: Uses the Chrome Downloads API to save images into `Root Folder/Sanitized News Title/`.
- **Robust Error Handling**: Skips failed images/titles gracefully without stopping the entire queue.

## Architecture
- **Popup**: Manages UI state, sends settings and start/stop signals.
- **Background Worker**: Contains the queue state, scoring logic, download API usage, and tab management.
- **Content Script**: Injected into Google Images to parse the DOM safely.

## Installation
1. Clone this repository or download the source code.
2. Open Chrome/Chromium and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** (toggle in the top right corner).
4. Click **Load unpacked** and select the directory containing the `manifest.json`.

## Usage
1. Click the extension icon in the toolbar.
2. Paste your news titles (one per line) in the text area.
3. Configure settings (images per title, minimum width, etc.).
4. Click **Start**.
5. The extension will open a background tab and begin processing.

## Limitations
- **Google DOM Changes**: Google Images frequently changes its HTML structure. The content script uses robust selectors, but might need updates if Google fundamentally alters its layout.
- **Rate Limiting**: To prevent being blocked, the extension implements delays between searches. Do not use extremely large batches.
- **CAPTCHA**: If Google presents a CAPTCHA due to automated requests, the process may pause or fail. It is not designed to bypass security challenges.
