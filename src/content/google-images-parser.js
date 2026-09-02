/**
 * This script runs in the context of the Google Images search results page.
 * It parses the DOM to extract image candidates and sends them back to the background worker.
 */

(function () {
  const extractCandidates = () => {
    const candidates = [];
    // A robust parser checks multiple potential locations. Google frequently changes its DOM.

    // Method 1: Look for standard image blocks containing data attributes
    const imageBlocks = document.querySelectorAll('div[data-ved]');
    
    imageBlocks.forEach(block => {
      try {
        const candidate = {};
        
        // Find the thumbnail image element
        const imgEl = block.querySelector('img');
        if (imgEl) {
          candidate.thumbnailUrl = imgEl.src || imgEl.dataset.src;
          candidate.title = imgEl.alt || '';
        }

        // Look for original URL in anchor tags within the block
        const linkEl = block.querySelector('a[href*="imgres"]');
        if (linkEl) {
          const href = linkEl.getAttribute('href');
          // Parse imgurl from the imgres link
          const urlParams = new URLSearchParams(href.split('?')[1]);
          const imgUrl = urlParams.get('imgurl');
          if (imgUrl) {
             candidate.originalUrl = decodeURIComponent(imgUrl);
          }
          const sourceUrl = urlParams.get('imgrefurl');
          if (sourceUrl) {
             candidate.sourceUrl = decodeURIComponent(sourceUrl);
          }
        }

        // Sometimes original URLs are stored in nested divs with specific action attributes
        // Alternatively, look for script tags that contain the data if DOM extraction fails (complex).

        if (!candidate.originalUrl) {
          // Fallback: If we can't find original URL, look for any anchor containing an image
          const fallbackLink = block.querySelector('a');
          if (fallbackLink) {
             candidate.sourceUrl = fallbackLink.href;
          }
        }
        
        // Try to get dimensions from attributes or style
        if (imgEl) {
          candidate.width = imgEl.naturalWidth || imgEl.getAttribute('width') || 0;
          candidate.height = imgEl.naturalHeight || imgEl.getAttribute('height') || 0;
        }

        // If we found at least a thumbnail, add it
        if (candidate.thumbnailUrl || candidate.originalUrl) {
          candidates.push(candidate);
        }

      } catch (e) {
         // Silently ignore individual block parsing errors to continue with others
         console.warn('Error parsing a block', e);
      }
    });

    return candidates;
  };

  // Listen for requests from the background worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_IMAGES') {
      try {
        const candidates = extractCandidates();
        sendResponse({ success: true, candidates });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }
    return true; // Keep the message channel open for async response
  });

})();
