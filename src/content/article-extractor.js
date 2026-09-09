(() => {
  // Core layout / chrome to always skip
  const EXCLUDED_BASE = [
    'script', 'style', 'noscript', 'nav', 'aside', 'footer', 'form', 'button', 'iframe',
    '[role="complementary"]', '[role="navigation"]', '[role="banner"]',
  ].join(', ');

  // Advertising, sponsored & commercial blocks
  const EXCLUDED_ADS = [
    '.advertisement', '.advert', '.ad', '.ads', '.ad-slot', '.ad-unit', '.ad-container',
    '[class*="advert"]', '[class*="-ad-"]', '[id*="advert"]', '[id*="-ad-"]',
    '[data-testid*="advert"]', '[data-testid*="ad-slot"]',
    '.promo', '.sponsored', '.commercial', '.promoted',
    '[data-type="commercial"]', '[data-component="commercial"]',
    '[data-module*="commercial"]', '[data-module*="advert"]',
    '.taboola', '#taboola', '[id*="taboola"]', '[class*="taboola"]',
    '.outbrain', '.zemanta', '.mgid',
    // Mirror / Reach-specific
    '.element-commercial', '.commercial-content', '.commercial-box',
    '.regwall-box', '[class*="regwall"]',
    '.ps-page', '#ps-modal', '#pp-prompt',
    '[class*="subscription"]', '[class*="subscribe"]',
  ].join(', ');

  // Social, share, tag, author, newsletter noise
  const EXCLUDED_NOISE = [
    '.newsletter', '.newsletter-signup', '[class*="newsletter"]',
    '.share', '.share-bar', '.social-share', '[class*="share-bar"]',
    '.tags', '.tag-list', '.article-tags', '[class*="-tags"]',
    '.author-bio', '.author-box', '[class*="author-bio"]',
    '.byline', '.article-byline',
    '.comments', '#comments', '[class*="comment"]',
    '.related', '.related-articles', '[class*="related-article"]',
    '.read-more', '[class*="read-more"]',
    // Reach/Mirror in-article link blocks
    '.element-rich-link', '.rich-link',
    '[data-component="rich-link"]', '[data-component="newsletter-signup"]',
    '[data-component="story-package"]', '[data-component="onwards"]',
    '[data-component="links-list"]', '[data-component="atom"]',
    '[data-gu-name*="rich-link"]',
    // Viafoura comments widget
    '[class*="viafoura"]', '.vf-',
    // Cookies / consent banners
    '[id*="cmp"]', '[class*="consent"]', '.qc-cmp',
    // Generic UI noise
    '.piano-id', '.tp-modal', '.tp-backdrop',
    '[aria-label*="advertisement" i]', '[aria-label*="sponsored" i]',
    '[aria-label*="newsletter" i]',
  ].join(', ');

  const EXCLUDED = [EXCLUDED_BASE, EXCLUDED_ADS, EXCLUDED_NOISE].join(', ');

  const CANDIDATES = [
    ['article, [itemprop="articleBody"], .article-body, .post-content, .entry-content, .story-body, .main__article, .article__body, .article-content, .post-body', 1.5],
    ['[role="main"] article', 1.4],
    ['main, [role="main"]', 0.65]
  ];

  const style = document.createElement('style');
  style.textContent = `
    [data-news-assistant-copying="true"] {
      outline: 3px solid #16a34a !important;
      outline-offset: 5px !important;
      background: rgba(22, 163, 74, .06) !important;
      position: relative !important;
      scroll-margin-block: 28px !important;
    }
    [data-news-assistant-copying="true"]::before {
      content: attr(data-news-assistant-copying-label) !important;
      position: absolute !important; top: -28px !important; left: 0 !important;
      padding: 4px 8px !important; border-radius: 4px !important;
      background: #16a34a !important; color: #fff !important;
      font: 600 12px/1.2 system-ui, sans-serif !important; z-index: 2147483647 !important;
    }`;
  document.documentElement.append(style);

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action !== 'ARTICLE_CONTENT_EXTRACTED') return;
    (async () => {
      try {
        let text, nodes, title;
        let useDynamicPolicy = false;
        let root = null;
        let extraction = null;

        // Attempt 1: Legacy Rules
        try {
          root = findArticleRoot();
          extraction = collectContent(root, request.options);
        } catch (e) {
          // If legacy extraction fails to find a root or content, we flag it for fallback
          useDynamicPolicy = true;
        }

        // Check if the legacy output meets our criteria (e.g., actually found paragraphs)
        if (!useDynamicPolicy && extraction && extraction.nodes) {
          const hasParagraphs = extraction.nodes.some(n => n.tagName === 'P');
          if (!hasParagraphs) {
            useDynamicPolicy = true;
          }
        }

        if (useDynamicPolicy) {
          // Attempt 2: Dynamic Density Policy
          const dynamicRoot = findDynamicRoot();
          const dynamicExtraction = collectDynamicContent(dynamicRoot, request.options);
          
          text = dynamicExtraction.text;
          nodes = dynamicExtraction.nodes;
          // For dynamic root, the title might sit outside the root, so ensure a broader fallback
          title = getArticleTitle(dynamicRoot) || document.querySelector('h1')?.innerText || document.querySelector('h2.title, h2[class*="title"]')?.innerText || document.title;
          title = title.replace(/\s+/g, ' ').trim();
        } else {
          text = extraction.text;
          nodes = extraction.nodes;
          title = getArticleTitle(root) || document.title;
        }

        await showCopiedSequence(nodes, request.options);
        showSuccessUI(nodes.length);
        sendResponse({ title, text });
      } catch (error) {
        sendResponse({ error: error.message });
      }
    })();
    return true;
  });

  function findArticleRoot() {
    const candidates = CANDIDATES.flatMap(([selector, weight]) =>
      [...document.querySelectorAll(selector)].map((node) => ({ node, weight }))
    );
    const seen = new Set();
    const usable = candidates.filter(({ node }) => !seen.has(node) && (seen.add(node), !node.closest(EXCLUDED)));
    const root = usable.sort((a, b) => textLength(b.node) * b.weight - textLength(a.node) * a.weight)[0]?.node;
    if (!root || textLength(root) < 120) throw new Error('No readable article area was found.');
    return root;
  }

  function textLength(node) { return (node.innerText || '').trim().length; }

  /**
   * Returns how many wrapper elements sit between `node` and `root`.
   * e.g. node.parent === root → depth 1
   *      node.parent.parent === root → depth 2
   * Returns Infinity if `node` is not a descendant of `root`.
   */
  function getAncestorDepth(node, root) {
    let depth = 0;
    let current = node.parentElement;
    while (current && current !== root) {
      depth++;
      current = current.parentElement;
    }
    return current === root ? depth + 1 : Infinity;
  }

  /**
   * Detects the natural content depth of the article by sampling visible
   * content nodes and seeing which depth level holds the majority (≥50%).
   * Returns 1, 2, or 3 as the resolved policy depth.
   */
  function detectContentDepth(root) {
    const candidates = [...root.querySelectorAll('h2, h3, h4, p')]
      .filter(n => !n.closest(EXCLUDED) && isVisible(n))
      .filter(n => (n.innerText || '').trim().length >= 25);

    if (candidates.length === 0) return 3; // fallback — be permissive

    const depths = candidates.map(n => getAncestorDepth(n, root));
    const total = depths.length;

    // Policy 1: majority are direct children (depth 1)
    const atDepth1 = depths.filter(d => d === 1).length;
    if (atDepth1 / total >= 0.5) return 1;

    // Policy 2: majority are within 2 levels of nesting
    const atDepth2 = depths.filter(d => d <= 2).length;
    if (atDepth2 / total >= 0.5) return 2;

    // Policy 3: fall back to 3 levels
    return 3;
  }

  /**
   * Returns true if `node` is within `maxDepth` ancestor levels of `root`,
   * with no excluded elements in its ancestor chain.
   */
  function isWithinDepth(node, root, maxDepth) {
    let depth = 0;
    let current = node.parentElement;
    while (current && current !== root) {
      if (current.matches(EXCLUDED)) return false;
      depth++;
      if (depth >= maxDepth) return false;
      current = current.parentElement;
    }
    return current === root;
  }

  function collectContent(root, options = {}) {
    const parts = [];
    const nodes = [];
    const seen = new Set();
    const excludedPrefixes = (options.excludedWords || '').split('\n').map(w => w.trim().toLowerCase()).filter(Boolean);
    const skipLinkHeavy = options.skipLinkHeavy !== false; // default true

    // Adaptively detect content depth: prefer depth-1 (direct children), fall
    // back to depth-2, then depth-3, based on where the majority of content lives.
    const maxDepth = detectContentDepth(root);

    for (const node of root.querySelectorAll('h1, h2, h3, h4, p')) {
      if (node.closest(EXCLUDED) || !isVisible(node)) continue;

      // Depth-adaptive check: only accept nodes within the detected depth policy
      if (!isWithinDepth(node, root, maxDepth)) continue;

      if (skipLinkHeavy && isLinkHeavy(node)) continue;
      const value = (node.innerText || '').replace(/\s+/g, ' ').trim();
      const isHeading = /^H[1-4]$/.test(node.tagName);
      if ((isHeading ? value.length < 5 : value.length < 25) || looksLikeNoise(value, excludedPrefixes, isHeading) || seen.has(value)) continue;
      seen.add(value);
      parts.push(value);
      nodes.push(node);
    }
    if (!parts.length) throw new Error('No readable headings or paragraphs were found.');
    return { text: parts.join('\n\n'), nodes };
  }

  function findDynamicRoot() {
    // Find all valid paragraphs across the entire document
    const validParagraphs = [...document.querySelectorAll('p, h2, h3, h4')]
      .filter(n => !n.closest(EXCLUDED) && isVisible(n) && textLength(n) >= 25);

    if (validParagraphs.length === 0) {
      throw new Error('No readable article area was found.');
    }

    let currentRoot = document.body;
    let keepLooking = true;

    while (keepLooking) {
      keepLooking = false;
      const children = Array.from(currentRoot.children);
      
      for (const child of children) {
        // Count how many of our valid paragraphs are inside this specific child
        const containedParagraphs = validParagraphs.filter(p => child.contains(p)).length;
        
        // If this child contains at least 70% of all the valid paragraphs on the page,
        // it is safe to assume this child is still just a wrapper. Dive deeper!
        if (containedParagraphs >= (validParagraphs.length * 0.70)) {
          currentRoot = child;
          keepLooking = true;
          break; // restart the while loop from this new child
        }
      }
    }

    return currentRoot;
  }

  function collectDynamicContent(root, options = {}) {
    const parts = [];
    const nodes = [];
    const seen = new Set();
    const excludedPrefixes = (options.excludedWords || '').split('\n').map(w => w.trim().toLowerCase()).filter(Boolean);
    const skipLinkHeavy = options.skipLinkHeavy !== false;

    // No depth restrictions for dynamic policy
    for (const node of root.querySelectorAll('h1, h2, h3, h4, p')) {
      if (node.closest(EXCLUDED) || !isVisible(node)) continue;
      if (skipLinkHeavy && isLinkHeavy(node)) continue;
      
      const value = (node.innerText || '').replace(/\s+/g, ' ').trim();
      const isHeading = /^H[1-4]$/.test(node.tagName);
      if ((isHeading ? value.length < 5 : value.length < 25) || looksLikeNoise(value, excludedPrefixes, isHeading) || seen.has(value)) continue;
      
      seen.add(value);
      parts.push(value);
      nodes.push(node);
    }
    if (!parts.length) throw new Error('No readable headings or paragraphs were found.');
    return { text: parts.join('\n\n'), nodes };
  }

  function getArticleTitle(root) {
    return (root.querySelector('h1')?.innerText || document.querySelector('h1')?.innerText || '')
      .replace(/\s+/g, ' ').trim();
  }

  function isVisible(node) {
    const style = getComputedStyle(node);
    return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
  }

  function isLinkHeavy(node) {
    if (node.tagName !== 'P') return false;
    const links = node.querySelectorAll('a');
    if (!links.length) return false;
    const textLen = (node.innerText || '').trim().length;
    if (textLen === 0) return true;
    let linkLen = 0;
    for (const a of links) {
      linkLen += (a.innerText || '').trim().length;
    }
    // If more than 60% of the paragraph text is made of links
    return (linkLen / textLen) > 0.6;
  }

  function looksLikeNoise(value, excludedPrefixes = [], isHeading = false) {
    const lowerValue = value.toLowerCase().replace(/^[\W_]+/, '');
    
    // User-configured exclusions
    if (excludedPrefixes.some(prefix => lowerValue.startsWith(prefix))) return true;

    // Known noise labels
    if (/^(advertisement|advertise[sd]?|sponsored(?: content)?|promoted story|read more|related (stories?|articles?)|comments?|subscribe|sign up|sign in|log in|follow us|share this|click here|buy now|shop now|cookie|privacy policy|terms of use|newsletter|taboola|outbrain)$/i.test(value)) return true;
    // Very short — likely a label, tag, or button text (skip this check for headings as they are often short)
    if (!isHeading && value.split(/\s+/).length < 4 && value.length < 40) return true;
    // Looks like a URL
    if (/^https?:\/\//i.test(value)) return true;
    // Mostly punctuation or symbols
    if (/^[\W\d\s]+$/.test(value)) return true;
    // Price / CTA patterns: "£9.99/month", "Free trial", "Get 50% off"
    if (/^\s*(get|try|buy|shop|save|£|\$|€|free trial|subscribe|sign up)\b/i.test(value) && value.split(/\s+/).length < 8) return true;
    // Social media callouts
    if (/\b(follow|like|share|retweet|tweet|instagram|facebook|tiktok|youtube)\b.{0,30}$/i.test(value) && value.split(/\s+/).length < 8) return true;
    return false;
  }

  async function showCopiedSequence(nodes, options = {}) {
    const isTestMode = options.testMode === true;
    const testDelayMs = (options.testDelaySeconds || 5) * 1000;
    for (const node of nodes) {
      document.querySelectorAll('[data-news-assistant-copying]').forEach((element) => {
        element.removeAttribute('data-news-assistant-copying');
        element.removeAttribute('data-news-assistant-copying-label');
      });
      node.setAttribute('data-news-assistant-copying', 'true');
      const tag = node.tagName === 'P' ? 'paragraph' : 'heading';
      const label = isTestMode
        ? `🧪 Test: ${tag} — ${options.testDelaySeconds}s delay`
        : `Copying ${tag}`;
      node.setAttribute('data-news-assistant-copying-label', label);
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise((resolve) => setTimeout(resolve, isTestMode ? testDelayMs : 350));
    }
  }

  function showSuccessUI(nodesCount) {
    // Clean up any remaining highlights from the copying sequence
    document.querySelectorAll('[data-news-assistant-copying]').forEach((element) => {
      element.removeAttribute('data-news-assistant-copying');
      element.removeAttribute('data-news-assistant-copying-label');
    });

    const successUI = document.createElement('div');
    successUI.innerHTML = `
      <div style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #16a34a;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(22, 163, 74, 0.4);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 16px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 2147483647;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        Article successfully extracted! (${nodesCount} elements copied)
      </div>
    `;
    document.body.appendChild(successUI);

    // Animate in
    requestAnimationFrame(() => {
      successUI.firstElementChild.style.opacity = '1';
      successUI.firstElementChild.style.transform = 'translateY(0)';
    });

    // Remove after 3.5 seconds
    setTimeout(() => {
      if (successUI.firstElementChild) {
        successUI.firstElementChild.style.opacity = '0';
        successUI.firstElementChild.style.transform = 'translateY(20px)';
      }
      setTimeout(() => successUI.remove(), 400);
    }, 3500);
  }
})();
