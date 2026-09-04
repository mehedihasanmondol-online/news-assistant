(() => {
  const EXCLUDED = 'script, style, noscript, nav, aside, footer, form, button, iframe, [role="complementary"], .advertisement, .advert, .ad, .ads, .promo, .newsletter, .comments, #comments, .related, .share';
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
        const { text, nodes } = collectContent(root);
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

  function collectContent(root) {
    const parts = [];
    const nodes = [];
    const seen = new Set();
    for (const node of root.querySelectorAll('h1, h2, h3, h4, p')) {
      if (node.closest(EXCLUDED) || !isVisible(node)) continue;
      const value = (node.innerText || '').replace(/\s+/g, ' ').trim();
      const isHeading = /^H[1-4]$/.test(node.tagName);
      if ((isHeading ? value.length < 5 : value.length < 25) || looksLikeNoise(value) || seen.has(value)) continue;
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

  function looksLikeNoise(value) {
    return /^(advertisement|advertise|sponsored|read more|related|comments?)$/i.test(value) || value.split(/\s+/).length < 5;
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
