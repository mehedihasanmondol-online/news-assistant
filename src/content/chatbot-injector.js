/**
 * News Assistant - Chatbot Prompt Injector Content Script
 * Automatically injects prompt and submits it on ChatGPT, Claude, and Gemini.
 */

(function () {
  'use strict';

  // Prevent multiple executions on the same page
  if (window.__NEWS_ASSISTANT_INJECTOR_LOADED__) return;
  window.__NEWS_ASSISTANT_INJECTOR_LOADED__ = true;

  const HOST = window.location.hostname;

  function detectChatbot() {
    if (HOST.includes('chatgpt.com') || HOST.includes('openai.com')) return 'chatgpt';
    if (HOST.includes('claude.ai')) return 'claude';
    if (HOST.includes('gemini.google.com')) return 'gemini';
    return null;
  }

  const currentBot = detectChatbot();
  if (!currentBot) return;

  console.log(`[News Assistant] Chatbot injector active for ${currentBot} on ${window.location.href}`);

  // Floating Status Toast
  function showToast(message, type = 'info', duration = 4000) {
    let toast = document.getElementById('na-chatbot-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'na-chatbot-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 10px;
        background: #111827;
        color: #f3f4f6;
        border: 1px solid #374151;
        padding: 12px 18px;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        transform: translateY(20px);
        opacity: 0;
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }

    const colors = {
      info: { border: '#4f46e5', dot: '#6366f1' },
      success: { border: '#10b981', dot: '#34d399' },
      error: { border: '#ef4444', dot: '#f87171' }
    };
    const c = colors[type] || colors.info;
    toast.style.borderColor = c.border;
    toast.innerHTML = `
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.dot};box-shadow:0 0 8px ${c.dot};"></span>
      <span>${message}</span>
    `;

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    if (toast.__timer) clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => {
      toast.style.transform = 'translateY(15px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  // Poll for target element with timeout
  function waitForElement(findFn, timeoutMs = 25000, intervalMs = 250) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const check = () => {
        const el = findFn();
        if (el) {
          resolve(el);
          return;
        }
        if (Date.now() - startTime >= timeoutMs) {
          resolve(null);
          return;
        }
        setTimeout(check, intervalMs);
      };
      check();
    });
  }

  // Find prompt input based on platform
  function findInputContainer() {
    if (currentBot === 'chatgpt') {
      return (
        document.getElementById('prompt-textarea') ||
        document.querySelector('div[contenteditable="true"]#prompt-textarea') ||
        document.querySelector('textarea#prompt-textarea') ||
        document.querySelector('div[contenteditable="true"][data-placeholder]') ||
        document.querySelector('textarea[data-id="root"]') ||
        document.querySelector('textarea[placeholder*="message" i]') ||
        document.querySelector('div[role="textbox"]')
      );
    }

    if (currentBot === 'claude') {
      return (
        document.querySelector('div[contenteditable="true"].ProseMirror') ||
        document.querySelector('fieldset div[contenteditable="true"]') ||
        document.querySelector('div[contenteditable="true"]') ||
        document.querySelector('div[role="textbox"]') ||
        document.querySelector('div[aria-label*="prompt" i]')
      );
    }

    if (currentBot === 'gemini') {
      return (
        document.querySelector('rich-textarea .ql-editor') ||
        document.querySelector('rich-textarea div[contenteditable="true"]') ||
        document.querySelector('.text-input-field [contenteditable="true"]') ||
        document.querySelector('div.input-area [contenteditable="true"]') ||
        document.querySelector('div[role="textbox"]') ||
        document.querySelector('textarea.textarea')
      );
    }

    return null;
  }

  let isExecuting = false;
  let hasInjected = false;

  // Find send button based on platform
  function findSendButton(inputEl) {
    if (currentBot === 'chatgpt') {
      const candidates = [
        document.querySelector('button[data-testid="send-button"]'),
        document.querySelector('button[data-testid="fruitjuice-send-button"]'),
        document.querySelector('button[aria-label="Send prompt"]'),
        document.querySelector('button[aria-label*="Send" i]'),
        inputEl?.closest('form')?.querySelector('button[type="submit"]')
      ];

      for (const btn of candidates) {
        if (!btn) continue;
        const testId = (btn.getAttribute('data-testid') || '').toLowerCase();
        const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
        // NEVER click a stop button!
        if (testId.includes('stop') || ariaLabel.includes('stop')) {
          console.log('[News Assistant] Found stop button, will NOT click it.');
          return null;
        }
        return btn;
      }
      return null;
    }

    if (currentBot === 'claude') {
      const candidates = [
        document.querySelector('button[aria-label="Send Message"]'),
        document.querySelector('button[aria-label*="Send" i]'),
        document.querySelector('fieldset button[aria-label*="Send" i]'),
        document.querySelector('button[type="submit"]')
      ];
      for (const btn of candidates) {
        if (!btn) continue;
        const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
        if (ariaLabel.includes('stop')) return null;
        return btn;
      }
      return null;
    }

    if (currentBot === 'gemini') {
      const candidates = [
        document.querySelector('button[aria-label*="Send message" i]'),
        document.querySelector('button.send-button'),
        document.querySelector('button[mattooltip*="Send" i]'),
        document.querySelector('button[mattooltip*="Submit" i]'),
        document.querySelector('.send-button-container button')
      ];
      for (const btn of candidates) {
        if (!btn) continue;
        const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
        if (ariaLabel.includes('stop')) return null;
        return btn;
      }
      return null;
    }

    return null;
  }

  // Set input text safely for React/Lexical/ProseMirror
  function setInputText(el, text) {
    el.focus();

    // Strategy 1: document.execCommand('insertText')
    // This is the most compatible with rich text editors (Draft.js, Lexical, ProseMirror)
    try {
      if (el.isContentEditable) {
        document.execCommand('selectAll', false, null);
        const success = document.execCommand('insertText', false, text);
        if (success && (el.textContent || '').trim().length > 0) {
          el.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
      }
    } catch (e) {
      console.warn('[News Assistant] execCommand failed, falling back:', e);
    }

    // Strategy 2: Textarea / Input with native value setter
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      try {
        const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(el, text);
        } else {
          el.value = text;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } catch (e) {
        console.warn('[News Assistant] Native value setter failed:', e);
      }
    }

    // Strategy 3: Direct contenteditable innerHTML + synthetic input event
    if (el.isContentEditable) {
      try {
        const lines = text.split('\n');
        el.innerHTML = lines.map(line => `<p>${line || '<br>'}</p>`).join('');
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } catch (e) {
        console.warn('[News Assistant] innerHTML fallback failed:', e);
      }
    }

    return false;
  }

  // Submit the prompt safely
  async function submitPrompt(inputEl) {
    // Check if response/thinking already started
    if (
      document.querySelector('button[data-testid="stop-button"]') ||
      document.querySelector('button[aria-label*="Stop" i]')
    ) {
      console.log('[News Assistant] Bot is already generating/thinking, skipping submit.');
      return true;
    }

    // Wait for send button to be enabled (up to 3.5 seconds)
    const startTime = Date.now();
    let sendBtn = null;
    while (Date.now() - startTime < 3500) {
      sendBtn = findSendButton(inputEl);
      if (sendBtn && !sendBtn.disabled && sendBtn.getAttribute('aria-disabled') !== 'true') {
        break;
      }
      await new Promise(r => setTimeout(r, 200));
    }

    if (sendBtn && !sendBtn.disabled && sendBtn.getAttribute('aria-disabled') !== 'true') {
      sendBtn.click();
      console.log('[News Assistant] Clicked send button successfully');
      return true;
    }

    // Fallback: Dispatch Enter key only if generation hasn't started
    if (
      document.querySelector('button[data-testid="stop-button"]') ||
      document.querySelector('button[aria-label*="Stop" i]')
    ) {
      console.log('[News Assistant] Generation already active, skipping fallback Enter');
      return true;
    }

    console.log('[News Assistant] Send button not ready or not found, dispatching Enter key');
    inputEl.focus();
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true
    });
    inputEl.dispatchEvent(enterEvent);
    inputEl.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true
    }));
    return true;
  }

  // Main injection runner
  async function runInjection(promptData) {
    if (!promptData || !promptData.prompt) return;

    if (hasInjected || isExecuting) {
      console.log('[News Assistant] Injection already executed or running for this tab, skipping duplicate.');
      return;
    }
    isExecuting = true;

    try {
      showToast(`📰 News Assistant: Preparing prompt for ${currentBot.toUpperCase()}...`, 'info', 6000);

      const inputEl = await waitForElement(findInputContainer, 25000, 300);
      if (!inputEl) {
        showToast('⚠️ Could not find prompt input field. Please paste manually.', 'error', 6000);
        return;
      }

      showToast('📝 Pasting prompt...', 'info', 4000);
      const pasted = setInputText(inputEl, promptData.prompt);

      if (!pasted) {
        showToast('⚠️ Failed to inject text into input field.', 'error', 5000);
        return;
      }

      hasInjected = true;

      if (promptData.autoSubmit !== false) {
        showToast('🚀 Running prompt...', 'info', 4000);
        await submitPrompt(inputEl);
        showToast(`✓ Prompt submitted to ${currentBot.toUpperCase()}!`, 'success', 5000);
      } else {
        showToast(`✓ Prompt ready in ${currentBot.toUpperCase()}!`, 'success', 5000);
      }
    } finally {
      isExecuting = false;
    }
  }

  // Check for pending prompt on page load
  async function checkPendingPrompt() {
    try {
      const data = await chrome.storage.local.get('pendingChatbotPrompt');
      const item = data.pendingChatbotPrompt;
      if (!item) return;

      const isRecent = Date.now() - (item.timestamp || 0) < 90000; // 90 seconds window
      const targetMatches = !item.target || item.target === currentBot;

      if (isRecent && targetMatches) {
        // Claim the prompt immediately so reload doesn't trigger again
        await chrome.storage.local.remove('pendingChatbotPrompt');
        await runInjection(item);
      }
    } catch (e) {
      console.warn('[News Assistant] Error checking pending prompt:', e);
    }
  }

  // Also listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'INJECT_CHATBOT_PROMPT') {
      if (hasInjected || isExecuting) {
        console.log('[News Assistant] Prompt already injected, ignoring duplicate background message.');
        sendResponse({ success: true, alreadyHandled: true });
        return false;
      }
      runInjection(request.payload)
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;
    }
  });

  // Execute check on page load / DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(checkPendingPrompt, 1000));
  } else {
    setTimeout(checkPendingPrompt, 1000);
  }
})();
