/**
 * Google Images Content Script - Injected into Google Search (Images tab)
 * Parses the live DOM to extract original high-res image URLs + metadata.
 *
 * Strategy:
 *   1. Find all image result containers using multiple robust selectors.
 *   2. For each container, extract the encoded metadata JSON that Google
 *      bakes into data-* attributes and inline script blocks.
 *   3. Fall back to thumbnail + data-src approaches if step 2 fails.
 *   4. Return structured candidate objects to the background service worker.
 */

(function () {
  'use strict';

  // ─── Avoid duplicate injection ────────────────────────────────────────────
  if (window.__newsImgParserReady) return;
  window.__newsImgParserReady = true;

  // ─── Selectors (keep centralised for easy updates) ────────────────────────
  const SELECTORS = {
    // Top-level image result blocks
    resultBlocks: [
      'div[data-ri]',          // Standard result containers with result index
      '.isv-r',                // Classic Google Images result class
      'div[jsmodel]',          // Dynamic model-bound containers
    ],
    // Anchor tags leading to image result details
    imageLink: [
      'a[jsname]',
      'a[href*="imgres"]',
      'a[href*="tbs="]',
    ],
    // Thumbnail img tags inside a result block
    thumbnail: 'img[src],img[data-src]',
  };

  // ─── URL Normalizer ───────────────────────────────────────────────────────
  function normalizeUrl(url) {
    if (!url) return null;
    if (url.startsWith('data:')) return null;   // Skip inline data URIs as originals
    try {
      const u = new URL(url, location.href);
      return u.href;
    } catch {
      return null;
    }
  }

  // ─── Extract imgurl from Google's ?imgres links ───────────────────────────
  function extractFromImgresHref(href) {
    try {
      const qs = new URL(href, location.href).searchParams;
      const imgUrl = qs.get('imgurl');
      const refUrl = qs.get('imgrefurl');
      const w = parseInt(qs.get('w') || qs.get('ow'), 10);
      const h = parseInt(qs.get('h') || qs.get('oh'), 10);
      return { originalUrl: imgUrl || null, sourceUrl: refUrl || null, width: w || 0, height: h || 0 };
    } catch {
      return {};
    }
  }

  // ─── Attempt to decode Google's encoded image metadata from page script tags ──
  function extractFromGlobalScripts() {
    const candidates = [];

    // Google sometimes serialises image data in an _setImagesSWMData / AF_initDataCallback
    // structure. We do a best-effort regex scan — never eval().
    const scripts = document.querySelectorAll('script:not([src])');
    const urlPattern = /https?:\/\/[^\s"'<>]{15,}\.(?:jpg|jpeg|png|webp|gif)/gi;

    scripts.forEach(script => {
      const text = script.textContent || '';
      if (!text.includes('http')) return;

      const matches = text.match(urlPattern);
      if (!matches) return;

      matches.forEach(rawUrl => {
        // Decode escaped Unicode like \u003d → =
        let url;
        try {
          url = JSON.parse(`"${rawUrl.replace(/\\/g, '\\\\')}"`) || rawUrl;
        } catch {
          url = rawUrl;
        }
        if (url && !url.includes('google.com') && !url.includes('gstatic.com/images/branding')) {
          candidates.push({ originalUrl: url, sourceUrl: null, width: 0, height: 0, thumbnailUrl: null, title: '' });
        }
      });
    });

    // Deduplicate by URL
    const seen = new Set();
    return candidates.filter(c => {
      if (seen.has(c.originalUrl)) return false;
      seen.add(c.originalUrl);
      return true;
    });
  }

  // ─── Main extraction logic ────────────────────────────────────────────────
  function extractCandidates() {
    const candidates = [];
    const seenUrls = new Set();

    // ── Method 1: Walk DOM result blocks ────────────────────────────────────
    let blocks = [];
    for (const selector of SELECTORS.resultBlocks) {
      const found = Array.from(document.querySelectorAll(selector));
      if (found.length > 0) {
        blocks = found;
        break; // use first selector that gives results
      }
    }

    blocks.forEach(block => {
      try {
        const candidate = { thumbnailUrl: null, originalUrl: null, sourceUrl: null, width: 0, height: 0, title: '' };

        // ── Thumbnail ────────────────────────────────────────────────────────
        const imgEl = block.querySelector(SELECTORS.thumbnail);
        if (imgEl) {
          const thumbSrc = imgEl.getAttribute('data-src') || imgEl.src;
          if (thumbSrc && !thumbSrc.startsWith('data:')) {
            candidate.thumbnailUrl = normalizeUrl(thumbSrc);
          }
          candidate.title = imgEl.alt || imgEl.title || '';
          // Natural dimensions (available if image already loaded)
          if (imgEl.naturalWidth > 0) candidate.width = imgEl.naturalWidth;
          if (imgEl.naturalHeight > 0) candidate.height = imgEl.naturalHeight;
        }

        // ── Original URL via data attributes ─────────────────────────────────
        // Google stores high-res info in data-tbnid, data-ou (original url), data-ow/oh
        const ou = block.getAttribute('data-ou') || block.querySelector('[data-ou]')?.getAttribute('data-ou');
        if (ou) {
          candidate.originalUrl = normalizeUrl(ou);
          const ow = parseInt(block.getAttribute('data-ow') || block.querySelector('[data-ow]')?.getAttribute('data-ow'), 10);
          const oh = parseInt(block.getAttribute('data-oh') || block.querySelector('[data-oh]')?.getAttribute('data-oh'), 10);
          if (ow) candidate.width = ow;
          if (oh) candidate.height = oh;
        }

        // ── Via anchor href (imgres links) ───────────────────────────────────
        if (!candidate.originalUrl) {
          for (const sel of SELECTORS.imageLink) {
            const link = block.querySelector(sel);
            if (!link) continue;
            const href = link.getAttribute('href') || '';
            if (href.includes('imgres') || href.includes('imgurl')) {
              const extracted = extractFromImgresHref(href);
              if (extracted.originalUrl) {
                candidate.originalUrl = normalizeUrl(extracted.originalUrl);
                candidate.sourceUrl = extracted.sourceUrl;
                if (!candidate.width) candidate.width = extracted.width;
                if (!candidate.height) candidate.height = extracted.height;
                break;
              }
            }
          }
        }

        // ── Reject if nothing useful ─────────────────────────────────────────
        const primary = candidate.originalUrl || candidate.thumbnailUrl;
        if (!primary) return;
        if (seenUrls.has(primary)) return;
        seenUrls.add(primary);

        candidates.push(candidate);
      } catch (e) {
        // Continue with next block
      }
    });

    // ── Method 2: Scan script tags for raw image URLs as fallback ───────────
    if (candidates.length < 5) {
      const scriptCandidates = extractFromGlobalScripts();
      scriptCandidates.forEach(c => {
        if (!seenUrls.has(c.originalUrl)) {
          seenUrls.add(c.originalUrl);
          candidates.push(c);
        }
      });
    }

    return candidates;
  }

  // Google increasingly exposes only thumbnail dimensions in its result DOM.
  // Loading the original URL in the page gives us its real natural dimensions
  // without reading pixels or needing cross-origin canvas access.
  function getImageDimensions(url) {
    return new Promise(resolve => {
      const image = new Image();
      const timeout = setTimeout(() => {
        image.onload = image.onerror = null;
        resolve(null);
      }, 3000);

      image.onload = () => {
        clearTimeout(timeout);
        resolve(image.naturalWidth > 0 && image.naturalHeight > 0
          ? { width: image.naturalWidth, height: image.naturalHeight }
          : null);
      };
      image.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };
      image.referrerPolicy = 'no-referrer-when-downgrade';
      image.src = url;
    });
  }

  async function verifyCandidateDimensions(candidates, minimumWidth) {
    const verified = [];
    // Keep this bounded so the background worker's image-search timeout is
    // never held up by a large page full of slow hosts.
    const queue = candidates.slice(0, 24);
    const workerCount = Math.min(8, queue.length);
    let nextIndex = 0;

    async function worker() {
      while (nextIndex < queue.length) {
        const candidate = queue[nextIndex++];
        const dimensions = await getImageDimensions(candidate.originalUrl || candidate.thumbnailUrl);
        if (dimensions) {
          candidate.width = dimensions.width;
          candidate.height = dimensions.height;
          if (dimensions.width >= minimumWidth) verified.push(candidate);
        }
      }
    }

    await Promise.all(Array.from({ length: workerCount }, worker));
    return verified;
  }

  // ─── Message listener ─────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_IMAGES') {
      (async () => {
        try {
          const minimumWidth = Number(request.payload?.minimumWidth) || 0;
          const candidates = await verifyCandidateDimensions(extractCandidates(), minimumWidth);
          sendResponse({ success: true, candidates });
        } catch (error) {
          sendResponse({ success: false, error: error.message, candidates: [] });
        }
      })();
      return true;
    }
  });

  console.log('[NewsImgParser] Content script ready on', location.href);
})();
