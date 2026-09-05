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
    ['article, [itemprop="articleBody"], .article-body, .post-content, .entry-content, .story-body', 1.5],
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
        const root = findArticleRoot();
        const { text, nodes } = collectContent(root, request.options);
        await showCopiedSequence(nodes);
        sendResponse({ title: getArticleTitle(root) || document.title, text });
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

  function findTrueContentRoot(root) {
    let current = root;
    while (true) {
      const children = Array.from(current.children).filter(c => !c.closest(EXCLUDED));
      if (children.length === 0) break;
      
      const totalText = textLength(current);
      if (totalText === 0) break;

      // Find if any single layout child holds > 85% of text
      const dominantChild = children.find(c => 
        ['DIV', 'SECTION', 'ARTICLE', 'MAIN'].includes(c.tagName) && 
        (textLength(c) / totalText) > 0.85
      );
      
      if (dominantChild) {
        current = dominantChild;
      } else {
        break;
      }
    }
    return current;
  }

  function isDirectContent(node, root, trueRoot) {
    // If it's an immediate child of the drilled-down true root or the original root
    if (node.parentElement === trueRoot || node.parentElement === root) return true;
    // Allow headings if they are inside a <header> which is a direct child of root
    if (/^H[1-6]$/.test(node.tagName) && node.parentElement.tagName === 'HEADER' && node.parentElement.parentElement === root) return true;
    return false;
  }

  function collectContent(root, options = {}) {
    const parts = [];
    const nodes = [];
    const seen = new Set();
    const excludedPrefixes = (options.excludedWords || '').split('\n').map(w => w.trim().toLowerCase()).filter(Boolean);
    const skipLinkHeavy = options.skipLinkHeavy !== false; // default true

    const trueRoot = findTrueContentRoot(root);

    for (const node of root.querySelectorAll('h1, h2, h3, h4, p')) {
      if (node.closest(EXCLUDED) || !isVisible(node)) continue;
      
      // Strict depth check: ignore deeply nested elements (like in sidebars, widgets)
      if (!isDirectContent(node, root, trueRoot)) continue;

      if (skipLinkHeavy && isLinkHeavy(node)) continue;
      const value = (node.innerText || '').replace(/\s+/g, ' ').trim();
      const isHeading = /^H[1-4]$/.test(node.tagName);
      if ((isHeading ? value.length < 5 : value.length < 25) || looksLikeNoise(value, excludedPrefixes) || seen.has(value)) continue;
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

  function looksLikeNoise(value, excludedPrefixes = []) {
    const lowerValue = value.toLowerCase().replace(/^[\W_]+/, '');
    
    // User-configured exclusions
    if (excludedPrefixes.some(prefix => lowerValue.startsWith(prefix))) return true;

    // Known noise labels
    if (/^(advertisement|advertise[sd]?|sponsored(?: content)?|promoted story|read more|related (stories?|articles?)|comments?|subscribe|sign up|sign in|log in|follow us|share this|click here|buy now|shop now|cookie|privacy policy|terms of use|newsletter|taboola|outbrain)$/i.test(value)) return true;
    // Very short — likely a label, tag, or button text
    if (value.split(/\s+/).length < 4 && value.length < 40) return true;
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

  async function showCopiedSequence(nodes) {
    for (const node of nodes) {
      document.querySelectorAll('[data-news-assistant-copying]').forEach((element) => {
        element.removeAttribute('data-news-assistant-copying');
        element.removeAttribute('data-news-assistant-copying-label');
      });
      node.setAttribute('data-news-assistant-copying', 'true');
      node.setAttribute('data-news-assistant-copying-label', `Copying ${node.tagName === 'P' ? 'paragraph' : 'heading'}`);
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
})();
