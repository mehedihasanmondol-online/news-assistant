import { MESSAGE_TYPES, QUEUE_STATUS, DEFAULT_SETTINGS, DEFAULT_ARTICLE_SETTINGS } from '../core/constants.js';

// ===========================
// DOM Element References
// ===========================
const el = {
  titles: document.getElementById('titles'),
  inputSection: document.getElementById('inputSection'),
  titleCount: document.getElementById('titleCount'),
  btnPasteTitles: document.getElementById('btnPasteTitles'),
  imagesPerTitle: document.getElementById('imagesPerTitle'),
  minWidth: document.getElementById('minWidth'),
  minAspectRatio: document.getElementById('minAspectRatio'),
  aspectRatio: document.getElementById('aspectRatio'),
  rootFolder: document.getElementById('rootFolder'),
  saveToDownloadsRoot: document.getElementById('saveToDownloadsRoot'),
  searchDelay: document.getElementById('searchDelay'),
  settingsSection: document.getElementById('settingsSection'),
  btnSaveSettings: document.getElementById('btnSaveSettings'),
  saveStatus: document.getElementById('saveStatus'),
  btnStart: document.getElementById('btnStart'),
  btnPause: document.getElementById('btnPause'),
  btnResume: document.getElementById('btnResume'),
  btnStop: document.getElementById('btnStop'),
  statusBadge: document.getElementById('statusBadge'),
  progressSection: document.getElementById('progressSection'),
  queueSection: document.getElementById('queueSection'),
  currentTask: document.getElementById('currentTask'),
  currentSub: document.getElementById('currentSub'),
  progressLabel: document.getElementById('progressLabel'),
  progressPct: document.getElementById('progressPct'),
  progressBarFill: document.getElementById('progressBarFill'),
  statCompleted: document.getElementById('statCompleted'),
  statProcessing: document.getElementById('statProcessing'),
  statFailed: document.getElementById('statFailed'),
  statImages: document.getElementById('statImages'),
  queueList: document.getElementById('queueList'),
  settingsToggle: document.getElementById('settingsToggle'),
  settingsBody: document.getElementById('settingsBody'),
  settingsArrow: document.getElementById('settingsArrow'),
  // View containers
  inputView: document.getElementById('inputView'),
  successScreen: document.getElementById('successScreen'),
  // Success screen elements
  ssTitles: document.getElementById('ssTitles'),
  ssCompleted: document.getElementById('ssCompleted'),
  ssFailed: document.getElementById('ssFailed'),
  ssImages: document.getElementById('ssImages'),
  folderPath: document.getElementById('folderPath'),
  btnStartAgain: document.getElementById('btnStartAgain'),
  imageTool: document.getElementById('imageTool'),
  articleTool: document.getElementById('articleTool'),
  tabs: document.querySelectorAll('.tool-tab'),
  articleLinks: document.getElementById('articleLinks'),
  articleLinkCount: document.getElementById('articleLinkCount'),
  btnPasteArticleLinks: document.getElementById('btnPasteArticleLinks'),
  btnStartArticleCopy: document.getElementById('btnStartArticleCopy'),
  btnStopArticleCopy: document.getElementById('btnStopArticleCopy'),
  btnCopyResults: document.getElementById('btnCopyResults'),
  articleStatus: document.getElementById('articleStatus'),
  articleProgress: document.getElementById('articleProgress'),
  articleProgressBar: document.getElementById('articleProgressBar'),
  articleCurrentUrl: document.getElementById('articleCurrentUrl'),
  articleQueueList: document.getElementById('articleQueueList'),
  articleInputCard: document.getElementById('articleInputCard'),
  articleSettingsSection: document.getElementById('articleSettingsSection'),
  articleSettingsToggle: document.getElementById('articleSettingsToggle'),
  articleSettingsArrow: document.getElementById('articleSettingsArrow'),
  articleSettingsBody: document.getElementById('articleSettingsBody'),
  articleExcludeWords: document.getElementById('articleExcludeWords'),
  skipLinkHeavy: document.getElementById('skipLinkHeavy'),
  btnSaveArticleSettings: document.getElementById('btnSaveArticleSettings'),
  articleSaveStatus: document.getElementById('articleSaveStatus'),
  articleControls: document.getElementById('articleControls'),
  articleSuccessScreen: document.getElementById('articleSuccessScreen'),
  articleSuccessSummary: document.getElementById('articleSuccessSummary'),
  articleSuccessCopied: document.getElementById('articleSuccessCopied'),
  articleSuccessFailed: document.getElementById('articleSuccessFailed'),
  articleSuccessWords: document.getElementById('articleSuccessWords'),
  btnCopySuccessResults: document.getElementById('btnCopySuccessResults'),
  btnArticleStartAgain: document.getElementById('btnArticleStartAgain'),
};

// ===========================
// Init
// ===========================
let pollingInterval = null;
let wasCompleted = false;      // Triggers the success screen when queue finishes
let suppressSuccess = false;   // Blocks re-showing success screen after Start Again, until a new run begins
const expandedArticleIndexes = new Set();
const articleResultScrollTops = new Map();
let articleSuccessDismissed = false;
let articleCopyStarting = false;
let articleCopyWasRunning = false;
let activeArticleRunId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadArticleSettings();
  await refreshState();

  setupListeners();
  startPolling();
  focusTitlesInput();
  refreshArticleCopyState();
});

// ===========================
// Polling
// ===========================
function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    refreshState();
    refreshArticleCopyState();
  }, 1000);
}

async function refreshState() {
  try {
    const state = await sendMessage(MESSAGE_TYPES.GET_STATE);
    if (state) renderState(state);
  } catch (e) {
    console.warn('State refresh error:', e);
  }
}

// ===========================
// Settings
// ===========================
async function loadSettings() {
  const data = await chrome.storage.local.get('newsDownloaderSettings');
  const s = { ...DEFAULT_SETTINGS, ...(data.newsDownloaderSettings || {}) };
  el.imagesPerTitle.value = s.imagesPerTitle;
  el.minWidth.value = s.minimumWidth;
  el.minAspectRatio.value = s.minimumAspectRatio;
  el.aspectRatio.value = s.preferredAspectRatio || '16:9';
  el.rootFolder.value = s.rootFolder;
  el.saveToDownloadsRoot.checked = s.saveToDownloadsRoot !== false;
  el.searchDelay.value = s.delayBetweenSearchesMs || 3000;
  updateDownloadLocationUI();
}

function readSettings() {
  return {
    imagesPerTitle: parseInt(el.imagesPerTitle.value, 10) || 5,
    minimumWidth: parseInt(el.minWidth.value, 10) || 1200,
    minimumAspectRatio: parseFloat(el.minAspectRatio.value) || 1.78,
    preferredAspectRatio: el.aspectRatio.value,
    rootFolder: el.rootFolder.value.trim() || '',
    saveToDownloadsRoot: el.saveToDownloadsRoot.checked,
    delayBetweenSearchesMs: parseInt(el.searchDelay.value, 10) || 3000,
  };
}

async function loadArticleSettings() {
  const data = await chrome.storage.local.get('articleCopySettings');
  const s = { ...DEFAULT_ARTICLE_SETTINGS, ...(data.articleCopySettings || {}) };
  el.articleExcludeWords.value = s.excludedWords;
  el.skipLinkHeavy.checked = s.skipLinkHeavy;
}

function readArticleSettings() {
  return {
    excludedWords: el.articleExcludeWords.value,
    skipLinkHeavy: el.skipLinkHeavy.checked
  };
}

// ===========================
// Event Listeners
// ===========================
function setupListeners() {
  el.tabs.forEach((tab) => tab.addEventListener('click', () => switchTool(tab.dataset.tool)));

  // Title count feedback
  el.titles.addEventListener('input', updateTitleCount);
  el.btnPasteTitles.addEventListener('click', pasteTitlesFromClipboard);
  updateTitleCount();

  // Settings collapsible
  el.settingsToggle.addEventListener('click', () => {
    const hidden = el.settingsBody.classList.toggle('hidden');
    el.settingsArrow.classList.toggle('open', !hidden);
  });

  // Controls
  el.btnSaveSettings.addEventListener('click', saveSettings);
  el.aspectRatio.addEventListener('change', applyAspectRatioRecommendation);
  el.saveToDownloadsRoot.addEventListener('change', updateDownloadLocationUI);
  el.btnStart.addEventListener('click', handleStart);
  el.btnPause.addEventListener('click', () => sendMessage(MESSAGE_TYPES.PAUSE_QUEUE));
  el.btnResume.addEventListener('click', () => sendMessage(MESSAGE_TYPES.RESUME_QUEUE));
  el.btnStop.addEventListener('click', async () => {
    await sendMessage(MESSAGE_TYPES.STOP_QUEUE);
    showInputCards();
  });

  // Start Again — reset to fresh state
  el.btnStartAgain.addEventListener('click', resetToStart);

  // Article copy events
  el.articleSettingsToggle.addEventListener('click', () => {
    const hidden = el.articleSettingsBody.classList.toggle('hidden');
    el.articleSettingsArrow.classList.toggle('open', !hidden);
  });
  el.btnSaveArticleSettings.addEventListener('click', saveArticleSettings);

  el.articleLinks.addEventListener('input', updateArticleLinkCount);
  el.btnPasteArticleLinks.addEventListener('click', pasteArticleLinksFromClipboard);
  el.btnStartArticleCopy.addEventListener('click', startArticleCopy);
  el.btnStopArticleCopy.addEventListener('click', () => sendMessage(MESSAGE_TYPES.STOP_ARTICLE_COPY));
  el.btnCopyResults.addEventListener('click', copyArticleResults);
  el.articleQueueList.addEventListener('click', handleArticleResultClick);
  el.articleQueueList.addEventListener('scroll', (event) => {
    const textBox = event.target.closest?.('.article-result-text');
    const card = textBox?.closest('.article-result');
    if (card) articleResultScrollTops.set(Number(card.dataset.resultIndex), textBox.scrollTop);
  }, true);
  el.btnCopySuccessResults.addEventListener('click', copyArticleResults);
  el.btnArticleStartAgain.addEventListener('click', resetArticleCopy);
  updateArticleLinkCount();
}

function updateDownloadLocationUI() {
  const isDirect = el.saveToDownloadsRoot.checked;
  el.rootFolder.disabled = isDirect;
  el.rootFolder.closest('.setting-row').classList.toggle('is-disabled', isDirect);
}

const RATIO_RECOMMENDATIONS = {
  '16:9': 1.4,
  '4:3': 1.2,
  '1:1': 0.9,
  '3:4': 0.65,
  '9:16': 0.5,
};

function applyAspectRatioRecommendation() {
  el.minAspectRatio.value = RATIO_RECOMMENDATIONS[el.aspectRatio.value];
  el.saveStatus.textContent = 'Recommendation applied — save to keep it.';
}

async function saveSettings() {
  const settings = readSettings();
  const result = await sendMessage(MESSAGE_TYPES.UPDATE_SETTINGS, settings);
  el.saveStatus.textContent = result?.success ? 'Settings saved.' : 'Could not save settings.';
  if (result?.success) {
    setTimeout(() => { el.saveStatus.textContent = ''; }, 2500);
  }
}

async function saveArticleSettings() {
  const settings = readArticleSettings();
  await chrome.storage.local.set({ articleCopySettings: settings });
  el.articleSaveStatus.textContent = 'Settings saved.';
  setTimeout(() => { el.articleSaveStatus.textContent = ''; }, 2500);
}

function updateTitleCount() {
  const count = el.titles.value.split('\n').filter(t => t.trim().length > 0).length;
  el.titleCount.textContent = `${count} title${count !== 1 ? 's' : ''}`;
}

function focusTitlesInput() {
  // Chrome can leave the omnibox focused after opening a side panel. Retry
  // once after the panel has painted so a following Ctrl+V reaches this field.
  requestAnimationFrame(() => el.titles.focus({ preventScroll: true }));
  setTimeout(() => {
    if (document.activeElement === document.body) {
      el.titles.focus({ preventScroll: true });
    }
  }, 250);
}

async function pasteTitlesFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (!text.trim()) {
      showAlert('Your clipboard does not contain any titles.');
      return;
    }
    el.titles.value = text;
    updateTitleCount();
    el.titles.focus({ preventScroll: true });
  } catch (error) {
    console.warn('Clipboard read error:', error);
    showAlert('Clipboard access was blocked. Copy the titles, then click this button again.');
  }
}

function hideInputCards() {
  el.inputSection.style.display = 'none';
  el.settingsSection.style.display = 'none';
}

function showInputCards() {
  el.inputSection.style.display = '';
  el.settingsSection.style.display = '';
}

async function handleStart() {
  const titles = el.titles.value.split('\n').filter(t => t.trim().length > 0);

  if (titles.length === 0) {
    showAlert('Please enter at least one news title.');
    return;
  }

  // Save settings first
  await saveSettings();

  // Get the current active tab ID so the background can navigate it
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = activeTab ? activeTab.id : null;

  // Allow success screen for this new run
  suppressSuccess = false;
  wasCompleted = false;

  // Start the queue
  await sendMessage(MESSAGE_TYPES.START_QUEUE, { titles, tabId });

  // Show progress sections
  hideInputCards();
  el.progressSection.style.display = '';
  el.queueSection.style.display = '';
}

// ===========================
// Render State
// ===========================
function renderState(state) {
  const { queue, settings, overallStatus, currentTitleIndex, stats } = state;
  const total = queue.length;
  const done = stats.completed + stats.failed;

  // ── Detect queue completion — show success screen once ──────────────────
  const isCompleted = overallStatus === QUEUE_STATUS.COMPLETED && total > 0 && done === total;
  if (isCompleted && !wasCompleted && !suppressSuccess) {
    wasCompleted = true;
    showSuccessScreen(state);
    return; // No need to update normal UI — success screen is showing
  }
  // If success screen is actively suppressed (after Start Again), keep it hidden
  if (suppressSuccess || !wasCompleted) {
    el.successScreen.style.display = 'none';
  }

  // Status badge
  updateBadge(overallStatus);

  // Button states
  const isRunning = [QUEUE_STATUS.SEARCHING, QUEUE_STATUS.EXTRACTING, QUEUE_STATUS.DOWNLOADING].includes(overallStatus);
  const isPaused = overallStatus === QUEUE_STATUS.PAUSED;
  const isIdle = !isRunning && !isPaused;

  el.btnStart.disabled = isRunning || isPaused;
  el.btnPause.disabled = !isRunning;
  el.btnResume.disabled = !isPaused;
  el.btnStop.disabled = isIdle;

  // Show sections if queue exists
  if (total > 0) {
    el.progressSection.style.display = '';
    el.queueSection.style.display = '';
  }

  // Current item
  const current = currentTitleIndex >= 0 ? queue[currentTitleIndex] : null;
  if (current) {
    el.currentTask.textContent = current.title;
    el.currentSub.textContent = formatStatus(current.status, current.downloaded, settings.imagesPerTitle);
  } else if (isIdle && total > 0) {
    el.currentTask.textContent = overallStatus === QUEUE_STATUS.COMPLETED ? 'All done!' : '—';
    el.currentSub.textContent = '';
  }

  // Progress bar
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  el.progressBarFill.style.width = `${pct}%`;
  el.progressLabel.textContent = `${done} / ${total} titles`;
  el.progressPct.textContent = `${pct}%`;

  // Stats chips
  el.statCompleted.textContent = stats.completed;
  el.statProcessing.textContent = currentTitleIndex >= 0 && isRunning ? 1 : 0;
  el.statFailed.textContent = stats.failed;
  el.statImages.textContent = stats.downloadedImages;

  // Queue items
  renderQueue(queue, currentTitleIndex, settings.imagesPerTitle);
}

function renderQueue(queue, currentIndex, perTitle) {
  // Only re-render if content changed (avoid flicker)
  const html = queue.map((item, i) => {
    const isActive = i === currentIndex;
    const statusIcon = getStatusIcon(item.status);
    const cls = isActive ? 'is-active' : `is-${item.status}`;
    const meta = item.error ? `⚠ ${item.error}` : (item.status === QUEUE_STATUS.DOWNLOADING ? 'Downloading...' : '');

    return `<div class="queue-item ${cls}">
      <span class="qi-status">${statusIcon}</span>
      <div class="qi-body">
        <div class="qi-title" title="${escHtml(item.title)}">${escHtml(item.title)}</div>
        ${meta ? `<div class="qi-meta">${escHtml(meta)}</div>` : ''}
      </div>
      <span class="qi-count">${item.downloaded || 0}/${perTitle}</span>
    </div>`;
  }).join('');

  if (el.queueList.innerHTML !== html) {
    el.queueList.innerHTML = html;
  }
}

function updateBadge(status) {
  const map = {
    [QUEUE_STATUS.SEARCHING]: { text: 'Searching', cls: 'running' },
    [QUEUE_STATUS.EXTRACTING]: { text: 'Extracting', cls: 'running' },
    [QUEUE_STATUS.DOWNLOADING]: { text: 'Downloading', cls: 'running' },
    [QUEUE_STATUS.PAUSED]: { text: 'Paused', cls: 'paused' },
    [QUEUE_STATUS.COMPLETED]: { text: 'Done', cls: 'done' },
    [QUEUE_STATUS.FAILED]: { text: 'Failed', cls: 'failed' },
    [QUEUE_STATUS.PENDING]: { text: 'Pending', cls: '' },
  };
  const info = map[status] || { text: 'Idle', cls: '' };
  el.statusBadge.textContent = info.text;
  el.statusBadge.className = `header-badge ${info.cls}`;
}

// ===========================
// Success Screen
// ===========================
function showSuccessScreen(state) {
  const { queue, stats, settings } = state;

  // Populate stats
  el.ssTitles.textContent = queue.length;
  el.ssCompleted.textContent = stats.completed;
  el.ssFailed.textContent = stats.failed;
  el.ssImages.textContent = stats.downloadedImages;
  el.folderPath.textContent = (settings.rootFolder || '') + '/';

  // Update badge to Done
  updateBadge(QUEUE_STATUS.COMPLETED);

  // Hide input, progress and queue sections
  el.inputView.classList.add('hidden');
  el.progressSection.style.display = 'none';
  el.queueSection.style.display = 'none';

  // Force re-trigger CSS animations by removing and re-adding the element's display
  el.successScreen.style.display = 'none';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.successScreen.style.display = 'flex';
    });
  });
}

function resetToStart() {
  // Suppress success screen until a brand new run is started
  wasCompleted = false;
  suppressSuccess = true;

  // Hide success screen
  el.successScreen.style.display = 'none';

  // Show input view again
  el.inputView.classList.remove('hidden');
  showInputCards();

  // Clear textarea and progress areas
  el.titles.value = '';
  el.titleCount.textContent = '0 titles';
  el.progressSection.style.display = 'none';
  el.queueSection.style.display = 'none';
  el.progressBarFill.style.width = '0%';
  el.progressLabel.textContent = '0 / 0 titles';
  el.progressPct.textContent = '0%';
  el.statCompleted.textContent = '0';
  el.statProcessing.textContent = '0';
  el.statFailed.textContent = '0';
  el.statImages.textContent = '0';
  el.queueList.innerHTML = '';

  // Reset badge
  el.statusBadge.textContent = 'Idle';
  el.statusBadge.className = 'header-badge';

  // Buttons back to initial state
  el.btnStart.disabled = false;
  el.btnPause.disabled = true;
  el.btnResume.disabled = true;
  el.btnStop.disabled = true;
}

// ===========================
// Article copy tool (independent from the image queue)
// ===========================
function switchTool(tool) {
  const isArticles = tool === 'articles';
  el.imageTool.hidden = isArticles;
  el.articleTool.hidden = !isArticles;
  el.tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tool === tool));
  if (isArticles) el.articleLinks.focus({ preventScroll: true });
}

function updateArticleLinkCount() {
  const count = el.articleLinks.value.split('\n').map((value) => value.trim()).filter(Boolean).length;
  el.articleLinkCount.textContent = `${count} link${count === 1 ? '' : 's'}`;
}

async function pasteArticleLinksFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (!text.trim()) return showArticleNotice('Your clipboard does not contain any links.');
    el.articleLinks.value = text;
    updateArticleLinkCount();
  } catch {
    showArticleNotice('Clipboard access was blocked. Copy the links, then try again.');
  }
}

async function startArticleCopy() {
  const rawLinks = el.articleLinks.value.split('\n').map((value) => value.trim()).filter(Boolean);
  const links = rawLinks.filter((value) => {
    try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
  });
  if (!links.length) return showArticleNotice('Enter at least one valid http or https link.');
  if (links.length !== rawLinks.length) return showArticleNotice('Remove invalid links before starting.');

  const options = readArticleSettings();
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const result = await sendMessage(MESSAGE_TYPES.START_ARTICLE_COPY, { links, tabId: activeTab?.id, options });
  if (!result?.success) showArticleNotice(result?.error || 'Could not start copying.');
  else {
    expandedArticleIndexes.clear();
    articleSuccessDismissed = false;
    // The background worker changes its state to "copying" before replying
    // to START_ARTICLE_COPY, so this identifies a real new run (not an old
    // completed queue being rendered during the click).
    articleCopyStarting = false;
    articleCopyWasRunning = true;
    activeArticleRunId = result.runId;
    el.articleSuccessScreen.hidden = true;
    el.articleInputCard.hidden = true;
    el.articleControls.classList.add('is-copying');
  }
}

async function refreshArticleCopyState() {
  const state = await sendMessage(MESSAGE_TYPES.GET_ARTICLE_COPY_STATE);
  if (state) renderArticleCopyState(state);
}

function renderArticleCopyState(state) {
  // A GET_STATE response can arrive after START_ARTICLE_COPY. Ignore that
  // stale completed batch rather than showing its success screen mid-run.
  if (activeArticleRunId !== null && state.runId !== activeArticleRunId) return;
  const queue = state.queue || [];
  const active = state.currentIndex >= 0 ? queue[state.currentIndex] : null;
  const completed = queue.filter((item) => item.status === 'copied' || item.status === 'failed').length;
  const isCopying = state.status === 'copying';
  if (isCopying) {
    articleCopyStarting = false;
    articleCopyWasRunning = true;
  }
  // Do not show a previous batch's completion screen while a new run is
  // waiting for the background worker to transition into "copying".
  const isCompleted = state.status === 'completed' && !articleSuccessDismissed && !articleCopyStarting && articleCopyWasRunning;
  const copied = queue.filter((item) => item.status === 'copied');
  const failed = queue.filter((item) => item.status === 'failed');
  el.articleStatus.textContent = isCopying ? (active?.status === 'loading' ? 'Opening page…' : 'Finding article…') : articleStatusText(state.status, queue);
  el.articleProgress.textContent = `${completed} / ${queue.length}`;
  el.articleProgressBar.style.width = `${queue.length ? Math.round((completed / queue.length) * 100) : 0}%`;
  el.articleCurrentUrl.textContent = active?.url || (queue.length ? 'Copying is finished. You can copy all extracted text now.' : 'The source page will scroll to the highlighted article area while it is being copied.');
  el.btnStartArticleCopy.disabled = isCopying;
  el.btnStopArticleCopy.disabled = !isCopying;
  el.btnCopyResults.disabled = !state.copiedText;
  el.articleSuccessScreen.hidden = !isCompleted;
  if (isCompleted) {
    el.articleInputCard.hidden = true;
    el.articleSettingsSection.hidden = true;
    el.articleControls.hidden = true;
    el.articleProgressBar.closest('.article-progress-card').hidden = true;
    el.articleQueueList.closest('.article-queue-card').hidden = true;
    el.articleSuccessCopied.textContent = copied.length;
    el.articleSuccessFailed.textContent = failed.length;
    el.articleSuccessWords.textContent = copied.reduce((sum, item) => sum + (item.words || 0), 0);
    el.articleSuccessSummary.textContent = `${copied.length} article${copied.length === 1 ? '' : 's'} ready. Copy everything at once, or start another batch.`;
  } else if (isCopying) {
    el.articleInputCard.hidden = true;
    el.articleSettingsSection.hidden = true;
    el.articleControls.hidden = false;
    el.articleControls.classList.add('is-copying');
    el.articleProgressBar.closest('.article-progress-card').hidden = false;
    el.articleQueueList.closest('.article-queue-card').hidden = false;
  } else {
    el.articleInputCard.hidden = false;
    el.articleSettingsSection.hidden = false;
    el.articleControls.hidden = false;
    el.articleControls.classList.remove('is-copying');
    // Show progress/queue cards only when there's run data from the current
    // session. After "Copy more articles" (articleSuccessDismissed=true and
    // articleCopyWasRunning=false), hide them so the UI starts fresh.
    const isFresh = articleSuccessDismissed || !articleCopyWasRunning;
    const hasRunData = queue.length > 0 && !isFresh;
    el.articleProgressBar.closest('.article-progress-card').hidden = !hasRunData;
    el.articleQueueList.closest('.article-queue-card').hidden = !hasRunData;
  }
  el.articleQueueList.querySelectorAll('.article-result').forEach((card) => {
    const textBox = card.querySelector('.article-result-text');
    if (textBox) articleResultScrollTops.set(Number(card.dataset.resultIndex), textBox.scrollTop);
  });
  el.articleQueueList.innerHTML = queue.map((item, index) => {
    const cls = index === state.currentIndex ? 'is-active' : `is-${item.status}`;
    const label = item.title || item.url;
    const meta = item.status === 'copied' ? `${item.words} words copied` : (item.error || item.status);
    if (item.status !== 'copied') {
      return `<div class="article-queue-item ${cls}"><span class="article-queue-icon">${articleIcon(item.status)}</span><div><div class="article-queue-title">${escHtml(label)}</div><div class="article-queue-meta">${escHtml(meta)}</div></div></div>`;
    }
    const expanded = expandedArticleIndexes.has(index);
    return `<article class="article-result ${expanded ? 'is-expanded' : ''}" data-result-index="${index}">
      <button type="button" class="article-result-head" data-result-toggle="${index}" aria-expanded="${expanded}">
        <span class="article-result-number">${index + 1}.</span><span class="article-result-title">${escHtml(label)}</span><span class="article-result-toggle">⌄</span>
      </button>
      <div class="article-result-body" ${expanded ? '' : 'hidden'}>
        <div class="article-result-text">${escHtml(item.content)}</div>
        <div class="article-result-footer"><span>${item.words} words</span><div class="article-result-actions">
          <button class="result-action" type="button" data-copy-title="${index}">Copy title</button>
          <button class="result-action result-action-primary" type="button" data-copy-post="${index}">Copy post</button>
        </div></div>
      </div>
    </article>`;
  }).join('');
  el.articleQueueList.querySelectorAll('.article-result').forEach((card) => {
    const textBox = card.querySelector('.article-result-text');
    const savedTop = articleResultScrollTops.get(Number(card.dataset.resultIndex));
    if (textBox && savedTop !== undefined) textBox.scrollTop = savedTop;
  });
}

function articleStatusText(status, queue) {
  if (status === 'completed') return `${queue.filter((item) => item.status === 'copied').length} articles copied`;
  if (status === 'stopped') return 'Copying stopped';
  return 'Ready to copy';
}

function articleIcon(status) {
  return ({ pending: '○', loading: '◌', extracting: '◌', copied: '✓', failed: '✕' })[status] || '○';
}

async function copyArticleResults() {
  const state = await sendMessage(MESSAGE_TYPES.GET_ARTICLE_COPY_STATE);
  if (!state?.copiedText) return;
  try {
    await navigator.clipboard.writeText(state.copiedText);
    el.btnCopyResults.textContent = 'Copied to clipboard ✓';
    setTimeout(() => { el.btnCopyResults.textContent = 'Copy all results'; }, 1800);
  } catch {
    showArticleNotice('Clipboard access was blocked. Please try again.');
  }
}

async function handleArticleResultClick(event) {
  const toggle = event.target.closest('[data-result-toggle]');
  if (toggle) {
    const card = toggle.closest('.article-result');
    const body = card.querySelector('.article-result-body');
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    body.hidden = expanded;
    card.classList.toggle('is-expanded', !expanded);
    const index = Number(toggle.dataset.resultToggle);
    if (expanded) expandedArticleIndexes.delete(index);
    else expandedArticleIndexes.add(index);
    return;
  }

  const button = event.target.closest('[data-copy-title], [data-copy-post]');
  if (!button) return;
  const index = Number(button.dataset.copyTitle ?? button.dataset.copyPost);
  const state = await sendMessage(MESSAGE_TYPES.GET_ARTICLE_COPY_STATE);
  const item = state?.queue?.[index];
  const text = button.dataset.copyTitle !== undefined ? item?.title : item?.content;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    const original = button.textContent;
    button.textContent = 'Copied ✓';
    setTimeout(() => { button.textContent = original; }, 1400);
  } catch {
    showArticleNotice('Clipboard access was blocked. Please try again.');
  }
}

function resetArticleCopy() {
  expandedArticleIndexes.clear();
  articleResultScrollTops.clear();
  articleSuccessDismissed = true;
  articleCopyStarting = false;
  articleCopyWasRunning = false;
  activeArticleRunId = null;
  el.articleSuccessScreen.hidden = true;
  el.articleInputCard.hidden = false;
  el.articleControls.hidden = false;
  el.articleControls.classList.remove('is-copying');
  el.articleProgressBar.closest('.article-progress-card').hidden = false;
  el.articleQueueList.closest('.article-queue-card').hidden = false;
  el.articleLinks.value = '';
  updateArticleLinkCount();
  el.articleQueueList.innerHTML = '';
  el.articleStatus.textContent = 'Ready to copy';
  el.articleProgress.textContent = '0 / 0';
  el.articleProgressBar.style.width = '0%';
  el.articleCurrentUrl.textContent = 'The source page will scroll to the highlighted article area while it is being copied.';
}

function showArticleNotice(message) {
  el.articleStatus.textContent = message;
}

// ===========================
// Helpers
// ===========================
function getStatusIcon(status) {
  const icons = {
    [QUEUE_STATUS.PENDING]: '○',
    [QUEUE_STATUS.SEARCHING]: '🔍',
    [QUEUE_STATUS.EXTRACTING]: '⚡',
    [QUEUE_STATUS.DOWNLOADING]: '⬇',
    [QUEUE_STATUS.COMPLETED]: '✓',
    [QUEUE_STATUS.FAILED]: '✕',
    [QUEUE_STATUS.PAUSED]: '⏸',
  };
  return icons[status] || '○';
}

function formatStatus(status, downloaded, perTitle) {
  if (status === QUEUE_STATUS.SEARCHING) return 'Searching Google Images...';
  if (status === QUEUE_STATUS.EXTRACTING) return 'Extracting image candidates...';
  if (status === QUEUE_STATUS.DOWNLOADING) return `Downloading image ${downloaded || 0} / ${perTitle}`;
  return status;
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showAlert(msg) {
  // Simple non-blocking inline feedback
  const old = document.querySelector('.inline-alert');
  if (old) old.remove();

  const div = document.createElement('div');
  div.className = 'inline-alert';
  div.style.cssText = 'background:#ef444420;border:1px solid #ef4444;color:#ef4444;padding:8px 14px;border-radius:8px;font-size:12px;margin-bottom:8px;';
  div.textContent = msg;
  el.btnStart.closest('.controls-section').before(div);
  setTimeout(() => div.remove(), 4000);
}

function sendMessage(action, payload = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action, payload }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('sendMessage error:', chrome.runtime.lastError.message);
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}
