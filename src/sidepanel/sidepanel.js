import {
  MESSAGE_TYPES,
  QUEUE_STATUS,
  DEFAULT_SETTINGS,
  DEFAULT_ARTICLE_SETTINGS,
  CHATBOT_TARGETS,
  DEFAULT_CHANNELS,
  DEFAULT_PROMPT_PRESETS,
  DEFAULT_PROMPT_SETTINGS
} from '../core/constants.js';

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
  timeRange: document.getElementById('timeRange'),
  customDateRow: document.getElementById('customDateRow'),
  customDateMin: document.getElementById('customDateMin'),
  customDateMax: document.getElementById('customDateMax'),
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
  promptTool: document.getElementById('promptTool'),
  tabs: document.querySelectorAll('.tool-tab'),
  articleLinks: document.getElementById('articleLinks'),
  articleLinkCount: document.getElementById('articleLinkCount'),
  btnPasteArticleLinks: document.getElementById('btnPasteArticleLinks'),
  btnStartArticleCopy: document.getElementById('btnStartArticleCopy'),
  btnStopArticleCopy: document.getElementById('btnStopArticleCopy'),
  btnCopyResults: document.getElementById('btnCopyResults'),
  btnCopyAllHeadingsMain: document.getElementById('btnCopyAllHeadingsMain'),
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
  articleSuccessChars: document.getElementById('articleSuccessChars'),
  btnCopyAllHeadings: document.getElementById('btnCopyAllHeadings'),
  btnCopySuccessResults: document.getElementById('btnCopySuccessResults'),
  btnArticleStartAgain: document.getElementById('btnArticleStartAgain'),
  btnClearArticleCopy: document.getElementById('btnClearArticleCopy'),
  btnClearArticleQueue: document.getElementById('btnClearArticleQueue'),
  btnResetCopyStatusSuccess: document.getElementById('btnResetCopyStatusSuccess'),
  btnResetCopyStatusQueue: document.getElementById('btnResetCopyStatusQueue'),
  articleQueueTotalChars: document.getElementById('articleQueueTotalChars'),
  autoDownloadImages: document.getElementById('autoDownloadImages'),
  autoRunChatbotPrompt: document.getElementById('autoRunChatbotPrompt'),
  pipelineChannelSelect: document.getElementById('pipelineChannelSelect'),
  pipelineChatbotSelect: document.getElementById('pipelineChatbotSelect'),
  pipelineSettingsRow: document.getElementById('pipelineSettingsRow'),
  btnStartMasterPipeline: document.getElementById('btnStartMasterPipeline'),
  articleControlsWrapper: document.getElementById('articleControlsWrapper'),
  testMode: document.getElementById('testMode'),
  testDelaySeconds: document.getElementById('testDelaySeconds'),
  testDelayRow: document.getElementById('testDelayRow'),

  // AI Prompt Tool elements
  selectedChatbotCards: document.querySelectorAll('.chatbot-card'),
  selectedChatbotInputs: document.querySelectorAll('input[name="selectedChatbot"]'),
  targetChatbotLabel: document.getElementById('targetChatbotLabel'),
  promptChannelSelect: document.getElementById('promptChannelSelect'),
  btnToggleAddChannel: document.getElementById('btnToggleAddChannel'),
  btnDeleteChannel: document.getElementById('btnDeleteChannel'),
  addChannelBox: document.getElementById('addChannelBox'),
  newChannelName: document.getElementById('newChannelName'),
  btnSaveNewChannel: document.getElementById('btnSaveNewChannel'),
  btnCancelNewChannel: document.getElementById('btnCancelNewChannel'),
  promptTitles: document.getElementById('promptTitles'),
  promptTitleCount: document.getElementById('promptTitleCount'),
  btnPastePromptTitles: document.getElementById('btnPastePromptTitles'),
  btnImportFromArticleQueue: document.getElementById('btnImportFromArticleQueue'),
  btnClearPromptTitles: document.getElementById('btnClearPromptTitles'),
  promptPresetSelect: document.getElementById('promptPresetSelect'),
  promptPresetDefaultBadge: document.getElementById('promptPresetDefaultBadge'),
  btnToggleNewPreset: document.getElementById('btnToggleNewPreset'),
  btnSaveCurrentPreset: document.getElementById('btnSaveCurrentPreset'),
  btnSetDefaultPreset: document.getElementById('btnSetDefaultPreset'),
  btnResetDefaultPresets: document.getElementById('btnResetDefaultPresets'),
  btnDeletePreset: document.getElementById('btnDeletePreset'),
  newPresetBox: document.getElementById('newPresetBox'),
  newPresetName: document.getElementById('newPresetName'),
  btnSaveNewPreset: document.getElementById('btnSaveNewPreset'),
  btnCancelNewPreset: document.getElementById('btnCancelNewPreset'),
  btnChipChannel: document.getElementById('btnChipChannel'),
  btnChipTitles: document.getElementById('btnChipTitles'),
  promptTemplate: document.getElementById('promptTemplate'),
  presetSaveNotice: document.getElementById('presetSaveNotice'),

  // Fullscreen & Preview modal elements
  promptPresetCard: document.getElementById('promptPresetCard'),
  promptHeadlinesCard: document.getElementById('promptHeadlinesCard'),
  btnOpenPromptPreviewModal: document.getElementById('btnOpenPromptPreviewModal'),
  btnTogglePromptFullscreen: document.getElementById('btnTogglePromptFullscreen'),
  btnToggleHeadlinesFullscreen: document.getElementById('btnToggleHeadlinesFullscreen'),
  promptPreviewModal: document.getElementById('promptPreviewModal'),
  promptPreviewBackdrop: document.getElementById('promptPreviewBackdrop'),
  promptPreviewContainer: document.getElementById('promptPreviewContainer'),
  btnTogglePreviewModalFullscreen: document.getElementById('btnTogglePreviewModalFullscreen'),
  btnClosePromptPreviewModal: document.getElementById('btnClosePromptPreviewModal'),
  btnClosePreviewModalBottom: document.getElementById('btnClosePreviewModalBottom'),
  promptPreviewStats: document.getElementById('promptPreviewStats'),
  promptPreviewContent: document.getElementById('promptPreviewContent'),
  btnCopyResolvedPrompt: document.getElementById('btnCopyResolvedPrompt'),

  promptAutoSubmit: document.getElementById('promptAutoSubmit'),
  btnRunChatbotPrompt: document.getElementById('btnRunChatbotPrompt'),
  promptRunNotice: document.getElementById('promptRunNotice')
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
let autoImageTriggeredRunId = null;
let autoPromptTriggeredRunId = null;
let articleRestoredWithData = false; // True when browser reloads with existing saved posts — skips success screen but keeps queue visible
let newBatchStartIndex = 0; // Queue index where the latest batch of new links starts
const copiedPostIndexes = new Set();
const copiedHeadingIndexes = new Set();

async function loadCopiedMarks() {
  try {
    const data = await chrome.storage.local.get(['copiedPostIndexes', 'copiedHeadingIndexes']);
    if (Array.isArray(data.copiedPostIndexes)) {
      data.copiedPostIndexes.forEach(i => copiedPostIndexes.add(i));
    }
    if (Array.isArray(data.copiedHeadingIndexes)) {
      data.copiedHeadingIndexes.forEach(i => copiedHeadingIndexes.add(i));
    }
  } catch (e) {
    console.warn('Failed to load copied marks:', e);
  }
}

async function saveCopiedMarks() {
  try {
    await chrome.storage.local.set({
      copiedPostIndexes: Array.from(copiedPostIndexes),
      copiedHeadingIndexes: Array.from(copiedHeadingIndexes)
    });
  } catch (e) {
    console.warn('Failed to save copied marks:', e);
  }
}

async function clearCopiedMarks() {
  copiedPostIndexes.clear();
  copiedHeadingIndexes.clear();
  try {
    await chrome.storage.local.remove(['copiedPostIndexes', 'copiedHeadingIndexes']);
  } catch (e) {
    console.warn('Failed to clear copied marks:', e);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadArticleSettings();
  await loadCopiedMarks();
  await loadPromptSettings();
  await refreshState();

  setupListeners();
  setupPromptListeners();
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
  const isAnyRatio = el.aspectRatio.value === 'any';
  el.minAspectRatio.disabled = isAnyRatio;
  el.minAspectRatio.closest('.compact-field')?.classList.toggle('is-disabled', isAnyRatio);
  el.timeRange.value = s.timeRange || 'any';
  el.customDateMin.value = s.customDateMin || '';
  el.customDateMax.value = s.customDateMax || '';
  el.rootFolder.value = s.rootFolder;
  el.saveToDownloadsRoot.checked = s.saveToDownloadsRoot !== false;
  el.searchDelay.value = s.delayBetweenSearchesMs || 3000;
  updateTimeRangeUI();
  updateDownloadLocationUI();
}

function updateTimeRangeUI() {
  const isCustom = el.timeRange.value === 'custom';
  el.customDateRow.style.display = isCustom ? '' : 'none';
}

function readSettings() {
  const parsedMinRatio = parseFloat(el.minAspectRatio.value);
  const minRatio = Number.isFinite(parsedMinRatio) ? parsedMinRatio : (el.aspectRatio.value === 'any' ? 0 : 1.4);

  const parsedMinWidth = parseInt(el.minWidth.value, 10);
  const minWidth = Number.isFinite(parsedMinWidth) ? parsedMinWidth : (el.aspectRatio.value === 'any' ? 0 : 1200);

  return {
    imagesPerTitle: parseInt(el.imagesPerTitle.value, 10) || 5,
    minimumWidth: minWidth,
    minimumAspectRatio: minRatio,
    preferredAspectRatio: el.aspectRatio.value,
    timeRange: el.timeRange.value || 'any',
    customDateMin: el.customDateMin.value || '',
    customDateMax: el.customDateMax.value || '',
    rootFolder: el.rootFolder.value.trim() || '',
    saveToDownloadsRoot: el.saveToDownloadsRoot.checked,
    delayBetweenSearchesMs: parseInt(el.searchDelay.value, 10) || 3000,
  };
}

function updatePipelineSettingsRowVisibility() {
  if (!el.pipelineSettingsRow) return;
  const isEnabled = el.autoRunChatbotPrompt ? el.autoRunChatbotPrompt.checked : true;
  el.pipelineSettingsRow.style.display = isEnabled ? 'grid' : 'none';
}

async function loadArticleSettings() {
  const data = await chrome.storage.local.get('articleCopySettings');
  const s = { ...DEFAULT_ARTICLE_SETTINGS, ...(data.articleCopySettings || {}) };
  el.articleExcludeWords.value = s.excludedWords;
  el.skipLinkHeavy.checked = s.skipLinkHeavy;
  el.testMode.checked = s.testMode || false;
  el.testDelaySeconds.value = s.testDelaySeconds || 2;
  el.testDelayRow.style.display = el.testMode.checked ? '' : 'none';
  if (el.autoDownloadImages) {
    el.autoDownloadImages.checked = s.autoDownloadImages !== undefined ? !!s.autoDownloadImages : true;
  }
  if (el.autoRunChatbotPrompt) {
    el.autoRunChatbotPrompt.checked = s.autoRunChatbotPrompt !== undefined ? !!s.autoRunChatbotPrompt : true;
  }
  updatePipelineSettingsRowVisibility();
}

function readArticleSettings() {
  return {
    excludedWords: el.articleExcludeWords.value,
    skipLinkHeavy: el.skipLinkHeavy.checked,
    testMode: el.testMode.checked,
    testDelaySeconds: parseInt(el.testDelaySeconds.value, 10) || 5,
    autoDownloadImages: el.autoDownloadImages ? el.autoDownloadImages.checked : true,
    autoRunChatbotPrompt: el.autoRunChatbotPrompt ? el.autoRunChatbotPrompt.checked : true
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
  el.timeRange.addEventListener('change', updateTimeRangeUI);
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
  el.testMode.addEventListener('change', () => {
    el.testDelayRow.style.display = el.testMode.checked ? '' : 'none';
  });

  el.articleLinks.addEventListener('input', updateArticleLinkCount);
  el.btnPasteArticleLinks.addEventListener('click', pasteArticleLinksFromClipboard);
  el.btnStartArticleCopy.addEventListener('click', startArticleCopy);
  el.btnStopArticleCopy.addEventListener('click', () => sendMessage(MESSAGE_TYPES.STOP_ARTICLE_COPY));
  el.btnCopyResults.addEventListener('click', copyArticleResults);
  el.btnCopyAllHeadingsMain.addEventListener('click', copyAllHeadings);
  el.articleQueueList.addEventListener('click', handleArticleResultClick);
  el.articleQueueList.addEventListener('scroll', (event) => {
    const textBox = event.target.closest?.('.article-result-text');
    const card = textBox?.closest('.article-result');
    if (card) articleResultScrollTops.set(Number(card.dataset.resultIndex), textBox.scrollTop);
  }, true);
  el.btnCopyAllHeadings.addEventListener('click', copyAllHeadings);
  el.btnCopySuccessResults.addEventListener('click', copyArticleResults);
  el.btnArticleStartAgain.addEventListener('click', resetArticleCopy);

  // Automation Pipeline Listeners
  el.autoDownloadImages?.addEventListener('change', () => {
    saveArticleSettings();
  });
  el.autoRunChatbotPrompt?.addEventListener('change', () => {
    updatePipelineSettingsRowVisibility();
    saveArticleSettings();
  });
  el.pipelineChannelSelect?.addEventListener('change', () => {
    promptSettings.selectedChannel = el.pipelineChannelSelect.value;
    if (el.promptChannelSelect) el.promptChannelSelect.value = promptSettings.selectedChannel;
    updatePromptPreview();
    savePromptSettings();
  });
  el.pipelineChatbotSelect?.addEventListener('change', () => {
    promptSettings.selectedChatbot = el.pipelineChatbotSelect.value;
    renderPromptChatbotUI();
    savePromptSettings();
  });
  el.btnStartMasterPipeline?.addEventListener('click', () => {
    if (el.autoDownloadImages) el.autoDownloadImages.checked = true;
    if (el.autoRunChatbotPrompt) el.autoRunChatbotPrompt.checked = true;
    updatePipelineSettingsRowVisibility();
    saveArticleSettings();
    startArticleCopy();
  });

  const handleClearArticleCopy = async () => {
    await sendMessage(MESSAGE_TYPES.CLEAR_ARTICLE_COPY);
    newBatchStartIndex = 0;
    activeArticleRunId = null;
    autoImageTriggeredRunId = null;
    autoPromptTriggeredRunId = null;
    articleSuccessDismissed = true;
    articleCopyWasRunning = false;
    articleRestoredWithData = false;
    expandedArticleIndexes.clear();
    articleResultScrollTops.clear();
    await clearCopiedMarks();

    // Immediately reflect cleared state in UI
    el.articleSuccessScreen.hidden = true;
    el.articleInputCard.hidden = false;
    el.articleSettingsSection.hidden = false;
    el.articleControlsWrapper.hidden = false;
    el.articleControls.classList.remove('is-copying');
    el.articleProgressBar.closest('.article-progress-card').hidden = true;
    el.articleQueueList.closest('.article-queue-card').hidden = true;
    el.articleQueueList.innerHTML = '';
    el.btnCopyResults.disabled = true;
    el.btnCopyAllHeadingsMain.disabled = true;
    el.articleStatus.textContent = 'Ready to copy';
    el.articleProgress.textContent = '0 / 0';
    el.articleProgressBar.style.width = '0%';
    el.articleCurrentUrl.textContent = 'The source page will scroll to the highlighted article area while it is being copied.';

    await refreshArticleCopyState();
  };
  el.btnClearArticleCopy.addEventListener('click', handleClearArticleCopy);
  el.btnClearArticleQueue.addEventListener('click', handleClearArticleCopy);

  const handleResetCopyStatus = async (event) => {
    const button = event?.currentTarget;
    const originalText = button?.innerHTML || '';

    await clearCopiedMarks();
    const state = await sendMessage(MESSAGE_TYPES.GET_ARTICLE_COPY_STATE);
    if (state) {
      renderArticleCopyState(state);
    }

    if (button) {
      button.textContent = 'Reset ✓';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 1200);
    }
  };
  el.btnResetCopyStatusSuccess?.addEventListener('click', handleResetCopyStatus);
  el.btnResetCopyStatusQueue?.addEventListener('click', handleResetCopyStatus);
  updateArticleLinkCount();
}

function updateDownloadLocationUI() {
  const isDirect = el.saveToDownloadsRoot.checked;
  el.rootFolder.disabled = isDirect;
  el.rootFolder.closest('.setting-row').classList.toggle('is-disabled', isDirect);
}

const RATIO_RECOMMENDATIONS = {
  'any': 0,
  '16:9': 1.4,
  '4:3': 1.2,
  '1:1': 0.9,
  '3:4': 0.65,
  '9:16': 0.5,
};

const WIDTH_RECOMMENDATIONS = {
  'any': 0,
  '16:9': 1200,
  '4:3': 1000,
  '1:1': 800,
  '3:4': 750,
  '9:16': 600,
};

function applyAspectRatioRecommendation() {
  const isAny = el.aspectRatio.value === 'any';
  el.minAspectRatio.value = RATIO_RECOMMENDATIONS[el.aspectRatio.value] ?? (isAny ? 0 : 1.4);
  el.minAspectRatio.disabled = isAny;
  el.minAspectRatio.closest('.compact-field')?.classList.toggle('is-disabled', isAny);

  const recommendedWidth = WIDTH_RECOMMENDATIONS[el.aspectRatio.value] ?? (isAny ? 0 : 1200);
  el.minWidth.value = recommendedWidth;

  el.saveStatus.textContent = isAny
    ? 'Any ratio applied (min width set to 0) — save to keep it.'
    : `Recommended applied (${recommendedWidth}px) — save to keep it.`;
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

async function handleStart(customItems = null) {
  let titles = Array.isArray(customItems) && customItems.length > 0 ? customItems : null;

  if (!titles) {
    const rawLines = el.titles.value.split('\n').map(t => t.trim()).filter(Boolean);
    if (rawLines.length === 0) {
      showAlert('Please enter at least one news title.');
      return;
    }

    // Check if titles match articles in the article queue to preserve folder serial numbering
    const articleState = await sendMessage(MESSAGE_TYPES.GET_ARTICLE_COPY_STATE);
    const articleQueue = articleState?.queue || [];

    titles = rawLines.map((line, lineIdx) => {
      const foundIdx = articleQueue.findIndex(a => a.title && a.title.trim() === line);
      if (foundIdx !== -1) {
        return { title: line, serialNumber: foundIdx + 1 };
      }
      return { title: line, serialNumber: lineIdx + 1 };
    });
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

    const serialPrefix = item.serialNumber != null ? `${String(item.serialNumber).padStart(2, '0')}. ` : '';
    return `<div class="queue-item ${cls}">
      <span class="qi-status">${statusIcon}</span>
      <div class="qi-body">
        <div class="qi-title" title="${escHtml(item.title)}">${escHtml(serialPrefix + item.title)}</div>
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
  el.imageTool.hidden = tool !== 'images';
  el.articleTool.hidden = tool !== 'articles';
  if (el.promptTool) el.promptTool.hidden = tool !== 'prompts';
  el.tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tool === tool));
  if (tool === 'articles') el.articleLinks.focus({ preventScroll: true });
  else if (tool === 'images') el.titles.focus({ preventScroll: true });
  else if (tool === 'prompts') el.promptTitles.focus({ preventScroll: true });
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

  // Remember the current queue size so auto-download only picks up new titles
  const currentState = await sendMessage(MESSAGE_TYPES.GET_ARTICLE_COPY_STATE);
  newBatchStartIndex = (currentState?.queue?.length) || 0;
  if (newBatchStartIndex === 0) {
    await clearCopiedMarks();
  }

  // Block stale completed-state polls from triggering auto-download for this new run
  activeArticleRunId = -1;

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
    autoPromptTriggeredRunId = null;
    el.articleSuccessScreen.hidden = true;
    el.articleInputCard.hidden = true;
  }
}

let initialArticleStateLoaded = false;
async function refreshArticleCopyState() {
  const state = await sendMessage(MESSAGE_TYPES.GET_ARTICLE_COPY_STATE);
  if (state) {
    if (!initialArticleStateLoaded) {
      initialArticleStateLoaded = true;
      if (state.status === 'completed') {
        autoImageTriggeredRunId = state.runId;
        autoPromptTriggeredRunId = state.runId;
        // On reopen: suppress success screen but keep queue visible so user
        // can copy or clear existing saved posts without seeing the popup.
        articleSuccessDismissed = true;
        articleRestoredWithData = state.queue?.length > 0;
        articleCopyWasRunning = true; // treat as a previous run so queue shows
      }
    }
    renderArticleCopyState(state);
  }
}

function renderArticleCopyState(state) {
  const queue = state.queue || [];

  // When queue is cleared or idle, clear activeArticleRunId so the cleared UI renders immediately
  if (queue.length === 0 || state.status === 'idle') {
    activeArticleRunId = null;
  }

  // A GET_STATE response can arrive after START_ARTICLE_COPY. Ignore that
  // stale completed batch rather than showing its success screen mid-run.
  if (activeArticleRunId !== null && state.runId !== activeArticleRunId) return;
  const active = queue[state.currentIndex];
  const completed = queue.filter((item) => item.status === 'copied' || item.status === 'failed').length;

  const isCopying = state.status === 'copying';
  if (isCopying) {
    articleCopyStarting = false;
    articleCopyWasRunning = true;
  }

  const isCompleted = state.status === 'completed' && !articleSuccessDismissed && !articleCopyStarting;
  const copied = queue.filter((item) => item.status === 'copied');
  const failed = queue.filter((item) => item.status === 'failed');
  el.articleStatus.textContent = isCopying ? (active?.status === 'loading' ? 'Opening page…' : 'Finding article…') : articleStatusText(state.status, queue);
  el.articleProgress.textContent = `${completed} / ${queue.length}`;
  el.articleProgressBar.style.width = `${queue.length ? Math.round((completed / queue.length) * 100) : 0}%`;
  el.articleCurrentUrl.textContent = active?.url || (queue.length ? 'Copying is finished. You can copy all extracted text now.' : 'The source page will scroll to the highlighted article area while it is being copied.');
  el.btnStartArticleCopy.disabled = isCopying;
  if (el.btnStartMasterPipeline) el.btnStartMasterPipeline.disabled = isCopying;
  el.btnStopArticleCopy.disabled = !isCopying;
  el.btnCopyResults.disabled = !state.copiedText;
  el.btnCopyAllHeadingsMain.disabled = !state.copiedText;
  el.articleSuccessScreen.hidden = !isCompleted;
  if (isCompleted) {
    el.articleInputCard.hidden = true;
    el.articleSettingsSection.hidden = true;
    el.articleControlsWrapper.hidden = true;
    el.articleProgressBar.closest('.article-progress-card').hidden = true;
    el.articleQueueList.closest('.article-queue-card').hidden = false;
    el.articleSuccessCopied.textContent = copied.length;
    el.articleSuccessFailed.textContent = failed.length;
    el.articleSuccessWords.textContent = copied.reduce((sum, item) => sum + (item.words || 0), 0).toLocaleString();
    el.articleSuccessChars.textContent = fmtChars(copied.reduce((sum, item) => sum + (item.chars || 0), 0));
    el.articleSuccessSummary.textContent = `${copied.length} article${copied.length === 1 ? '' : 's'} ready. Copy everything at once, or start another batch.`;

    // Only process newly added articles for this run
    const newlyCopied = [];
    queue.forEach((item, index) => {
      if (index >= newBatchStartIndex && item.status === 'copied' && item.title) {
        newlyCopied.push({
          title: item.title,
          serialNumber: index + 1
        });
      }
    });

    const newlyCopiedTitles = newlyCopied.map((item) => (item.title || '').trim()).filter(Boolean);

    // ── Pipeline Step 1: Auto Run AI Prompt in Chatbot ──
    const shouldAutoPrompt = el.autoRunChatbotPrompt && el.autoRunChatbotPrompt.checked;
    if (shouldAutoPrompt && autoPromptTriggeredRunId !== state.runId && newlyCopiedTitles.length > 0) {
      autoPromptTriggeredRunId = state.runId;

      // Sync channel & target bot from pipeline dropdowns
      if (el.pipelineChannelSelect && el.pipelineChannelSelect.value) {
        promptSettings.selectedChannel = el.pipelineChannelSelect.value;
        if (el.promptChannelSelect) el.promptChannelSelect.value = promptSettings.selectedChannel;
      }
      if (el.pipelineChatbotSelect && el.pipelineChatbotSelect.value) {
        promptSettings.selectedChatbot = el.pipelineChatbotSelect.value;
        renderPromptChatbotUI();
      }
      savePromptSettings();

      // Populate AI Prompt headlines textarea
      if (el.promptTitles) {
        el.promptTitles.value = newlyCopiedTitles.join('\n');
        updatePromptTitleCount();
        updatePromptPreview();
      }

      // Resolve prompt template
      const targetBot = el.pipelineChatbotSelect?.value || promptSettings.selectedChatbot || 'chatgpt';
      const resolvedPrompt = getResolvedPrompt();
      const autoSubmit = el.promptAutoSubmit ? el.promptAutoSubmit.checked !== false : true;

      sendMessage(MESSAGE_TYPES.RUN_CHATBOT_PROMPT, {
        target: targetBot,
        prompt: resolvedPrompt,
        autoSubmit
      }).then((res) => {
        if (res?.success) {
          showPromptNotice(`✓ 1-Click Pipeline: Prompt dispatched to ${CHATBOT_TARGETS[targetBot]?.name || targetBot}!`, 'success');
        } else {
          showPromptNotice(`1-Click Pipeline Error: ${res?.error || 'Could not launch chatbot'}`, 'error');
        }
      }).catch((err) => {
        showPromptNotice(`1-Click Pipeline Error: ${err.message}`, 'error');
      });
    }

    // ── Pipeline Step 2: Auto Download Images ──
    const shouldAutoDownload = el.autoDownloadImages && el.autoDownloadImages.checked;
    if (shouldAutoDownload && autoImageTriggeredRunId !== state.runId && newlyCopied.length > 0) {
      autoImageTriggeredRunId = state.runId;
      // Switch tab to image downloader
      switchTool('images');
      // Extract titles and fill input — only for the new batch
      const titlesText = newlyCopied.map((item) => item.title).join('\n');
      el.titles.value = titlesText;
      updateTitleCount();
      // Start download automatically with explicit serial numbers matching the article list
      setTimeout(() => handleStart(newlyCopied), 300);
    } else if (!shouldAutoDownload && shouldAutoPrompt && newlyCopiedTitles.length > 0) {
      // If image download is not requested, switch to AI Prompt tab to display resolved prompt
      switchTool('prompts');
    }
  } else if (isCopying) {
    el.articleInputCard.hidden = true;
    el.articleSettingsSection.hidden = true;
    el.articleControlsWrapper.hidden = false;
    el.articleControlsWrapper.classList.add('is-copying');
    el.articleControls.classList.add('is-copying');
    if (el.btnStartMasterPipeline) el.btnStartMasterPipeline.style.display = 'none';
    el.articleProgressBar.closest('.article-progress-card').hidden = false;
    el.articleQueueList.closest('.article-queue-card').hidden = false;
  } else {
    el.articleInputCard.hidden = false;
    el.articleSettingsSection.hidden = false;
    el.articleControlsWrapper.hidden = false;
    el.articleControlsWrapper.classList.remove('is-copying');
    el.articleControls.classList.remove('is-copying');
    if (el.btnStartMasterPipeline) el.btnStartMasterPipeline.style.display = '';
    // Show progress/queue cards if there is run data.
    // articleRestoredWithData = restored on reload (show queue).
    // articleSuccessDismissed without restore = user dismissed mid-session (hide queue for fresh feel).
    const isFresh = (articleSuccessDismissed && !articleRestoredWithData) || (!articleCopyWasRunning && queue.length === 0);
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
    const meta = item.status === 'copied' ? `${item.words} words · ${fmtChars(item.chars || 0)} chars` : (item.error || item.status);
    if (item.status !== 'copied') {
      return `<div class="article-queue-item ${cls}"><span class="article-queue-icon">${articleIcon(item.status)}</span><div><div class="article-queue-title">${escHtml(label)}</div><div class="article-queue-meta">${escHtml(meta)}</div></div></div>`;
    }
    const expanded = expandedArticleIndexes.has(index);
    const isHeadingCopied = copiedHeadingIndexes.has(index);
    const isPostCopied = copiedPostIndexes.has(index);

    let cardClasses = `article-result ${expanded ? 'is-expanded' : ''}`;
    if (isPostCopied) cardClasses += ' is-post-copied';
    if (isHeadingCopied) cardClasses += ' is-heading-copied';

    const titleBtnClass = isHeadingCopied ? 'result-action result-action-heading-copied' : 'result-action';
    const titleBtnText = isHeadingCopied ? '✓ Heading copied' : 'Copy heading';

    const postBtnClass = isPostCopied ? 'result-action result-action-post-copied' : 'result-action result-action-primary';
    const postBtnText = isPostCopied ? '✓ Post copied' : 'Copy post';

    return `<article class="${cardClasses}" data-result-index="${index}">
      <div class="article-result-head-row">
        <button type="button" class="article-result-head" data-result-toggle="${index}" aria-expanded="${expanded}">
          <span class="article-result-number">${index + 1}.</span><span class="article-result-title">${escHtml(label)}</span><span class="article-result-toggle">⌄</span>
        </button>
        <div class="article-result-inline-actions">
          <span class="article-char-badge">${item.words.toLocaleString()} words · ${fmtChars(item.chars || 0)} chars</span>
          ${isHeadingCopied ? '<span class="copied-pill copied-pill-heading">✓ Heading</span>' : ''}
          ${isPostCopied ? '<span class="copied-pill copied-pill-post">✓ Post</span>' : ''}
          <button class="${titleBtnClass}" type="button" data-copy-title="${index}">${titleBtnText}</button>
          <button class="${postBtnClass}" type="button" data-copy-post="${index}">${postBtnText}</button>
        </div>
      </div>
      <div class="article-result-body" ${expanded ? '' : 'hidden'}>
        <div class="article-result-text">${escHtml(item.content)}</div>
        <div class="article-result-footer"><span>${item.words} words</span><span class="article-result-chars">${fmtChars(item.chars || 0)} chars</span></div>
      </div>
    </article>`;
  }).join('');
  el.articleQueueList.querySelectorAll('.article-result').forEach((card) => {
    const textBox = card.querySelector('.article-result-text');
    const savedTop = articleResultScrollTops.get(Number(card.dataset.resultIndex));
    if (textBox && savedTop !== undefined) textBox.scrollTop = savedTop;
  });
  // Update total chars counter in queue header
  const totalChars = copied.reduce((sum, item) => sum + (item.chars || 0), 0);
  if (totalChars > 0) {
    el.articleQueueTotalChars.textContent = `Total: ${fmtChars(totalChars)} chars`;
    el.articleQueueTotalChars.hidden = false;
  } else {
    el.articleQueueTotalChars.hidden = true;
  }
}

function articleStatusText(status, queue) {
  if (status === 'completed') return `${queue.filter((item) => item.status === 'copied').length} articles copied`;
  if (status === 'stopped') return 'Copying stopped';
  return 'Ready to copy';
}

function articleIcon(status) {
  return ({ pending: '○', loading: '◌', extracting: '◌', copied: '✓', failed: '✕' })[status] || '○';
}

async function copyArticleResults(event) {
  const button = event ? event.currentTarget : el.btnCopyResults;
  const originalHTML = button ? button.innerHTML : '';

  const state = await sendMessage(MESSAGE_TYPES.GET_ARTICLE_COPY_STATE);
  if (!state?.copiedText) return;

  try {
    await navigator.clipboard.writeText(state.copiedText);

    // Automatically mark all copied posts
    (state.queue || []).forEach((item, index) => {
      if (item.status === 'copied') {
        copiedPostIndexes.add(index);
      }
    });
    await saveCopiedMarks();
    renderArticleCopyState(state);

    if (button) {
      button.textContent = 'All posts copied ✓';
      setTimeout(() => { button.innerHTML = originalHTML; }, 1800);
    }
  } catch (error) {
    console.error('Clipboard write failed:', error);
    alert('Clipboard access was blocked. Please try again.');
  }
}

async function copyAllHeadings(event) {
  const button = event.currentTarget;
  const originalHTML = button.innerHTML;
  const state = await sendMessage(MESSAGE_TYPES.GET_ARTICLE_COPY_STATE);
  const headings = (state?.queue || [])
    .filter((item) => item.status === 'copied' && item.title)
    .map((item) => item.title)
    .join('\n');
  if (!headings) return;
  try {
    await navigator.clipboard.writeText(headings);

    // Automatically mark all copied headings
    (state.queue || []).forEach((item, index) => {
      if (item.status === 'copied' && item.title) {
        copiedHeadingIndexes.add(index);
      }
    });
    await saveCopiedMarks();
    renderArticleCopyState(state);

    button.textContent = 'All headings copied ✓';
    setTimeout(() => { button.innerHTML = originalHTML; }, 1800);
  } catch (error) {
    console.error('Clipboard write failed:', error);
    alert('Clipboard access was blocked. Please try again.');
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
  const isHeading = button.dataset.copyTitle !== undefined;
  const index = Number(isHeading ? button.dataset.copyTitle : button.dataset.copyPost);
  const state = await sendMessage(MESSAGE_TYPES.GET_ARTICLE_COPY_STATE);
  const item = state?.queue?.[index];
  const text = isHeading ? item?.title : item?.content;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    if (isHeading) {
      copiedHeadingIndexes.add(index);
    } else {
      copiedPostIndexes.add(index);
    }
    await saveCopiedMarks();
    renderArticleCopyState(state);
  } catch {
    showArticleNotice('Clipboard access was blocked. Please try again.');
  }
}


function resetArticleCopy() {
  expandedArticleIndexes.clear();
  articleResultScrollTops.clear();
  articleSuccessDismissed = true;
  articleRestoredWithData = true;  // Keep existing saved data visible in the queue
  articleCopyStarting = false;
  articleCopyWasRunning = true;    // Keep queue visible since data is still saved
  activeArticleRunId = null;
  autoImageTriggeredRunId = null;  // Reset so auto-download can trigger again for next run
  el.articleSuccessScreen.hidden = true;
  el.articleInputCard.hidden = false;
  el.articleControls.hidden = false;
  el.articleControls.classList.remove('is-copying');
  el.articleLinks.value = '';
  updateArticleLinkCount();
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

/** Format character count compactly: 1234 → "1.2K", 12345 → "12K" */
function fmtChars(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return String(n);
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

// ==========================================================================
// AI Prompt Hub Feature (YouTube News Package)
// ==========================================================================
let promptSettings = {
  version: 4,
  selectedChatbot: 'chatgpt',
  selectedChannel: 'My News Channel',
  channels: ['My News Channel', 'BD News Express'],
  autoSubmit: true,
  activePresetId: 'preset-youtube-package',
  presets: JSON.parse(JSON.stringify(DEFAULT_PROMPT_PRESETS))
};

async function loadPromptSettings() {
  try {
    const data = await chrome.storage.local.get('promptAssistantSettings');
    if (data.promptAssistantSettings) {
      const s = data.promptAssistantSettings;
      promptSettings.version = s.version || 1;
      promptSettings.selectedChatbot = s.selectedChatbot || 'chatgpt';
      promptSettings.autoSubmit = s.autoSubmit !== false;

      // Channels: Respect user's saved channels (do not force re-add deleted defaults)
      if (Array.isArray(s.channels)) {
        promptSettings.channels = s.channels;
      } else if (Array.isArray(s.customChannels) && s.customChannels.length > 0) {
        promptSettings.channels = s.customChannels;
      } else {
        promptSettings.channels = [...DEFAULT_CHANNELS];
      }

      promptSettings.selectedChannel = promptSettings.channels.includes(s.selectedChannel)
        ? s.selectedChannel
        : (promptSettings.channels[0] || '');

      promptSettings.presets = Array.isArray(s.presets) && s.presets.length > 0
        ? s.presets
        : JSON.parse(JSON.stringify(DEFAULT_PROMPT_PRESETS));
      promptSettings.activePresetId = s.activePresetId || 'preset-youtube-package';
    }
  } catch (e) {
    console.warn('Failed to load prompt settings:', e);
  }

  // Ensure activePresetId exists in presets
  if (!promptSettings.presets.some(p => p.id === promptSettings.activePresetId)) {
    promptSettings.activePresetId = promptSettings.presets[0]?.id || 'preset-youtube-package';
  }

  renderPromptChatbotUI();
  renderPromptChannels();
  renderPromptPresets();
  updatePromptTitleCount();
  updatePromptPreview();
}

async function savePromptSettings() {
  try {
    await chrome.storage.local.set({ promptAssistantSettings: promptSettings });
  } catch (e) {
    console.warn('Failed to save prompt settings:', e);
  }
}

function renderPromptChatbotUI() {
  const bot = promptSettings.selectedChatbot || 'chatgpt';
  el.selectedChatbotCards.forEach((card) => {
    const isThis = card.dataset.bot === bot;
    card.classList.toggle('is-active', isThis);
    const radio = card.querySelector('input[type="radio"]');
    if (radio) radio.checked = isThis;
  });

  const botConfig = CHATBOT_TARGETS[bot] || CHATBOT_TARGETS.chatgpt;
  if (el.targetChatbotLabel) el.targetChatbotLabel.textContent = botConfig.name;
  if (el.btnRunChatbotPrompt) el.btnRunChatbotPrompt.dataset.bot = bot;
  if (el.pipelineChatbotSelect) el.pipelineChatbotSelect.value = bot;
}

function renderPromptChannels() {
  if (!Array.isArray(promptSettings.channels)) {
    promptSettings.channels = [];
  }

  const optionsHtml = promptSettings.channels.length > 0
    ? promptSettings.channels.map((ch) => {
        const isSelected = ch === promptSettings.selectedChannel;
        return `<option value="${escHtml(ch)}" ${isSelected ? 'selected' : ''}>${escHtml(ch)}</option>`;
      }).join('')
    : '<option value="">(No channel - Click ➕ to add)</option>';

  if (el.promptChannelSelect) {
    el.promptChannelSelect.innerHTML = optionsHtml;
    if (promptSettings.channels.length > 0 && !promptSettings.channels.includes(promptSettings.selectedChannel)) {
      promptSettings.selectedChannel = promptSettings.channels[0];
      el.promptChannelSelect.value = promptSettings.selectedChannel;
    }
  }

  if (el.pipelineChannelSelect) {
    el.pipelineChannelSelect.innerHTML = optionsHtml;
    if (promptSettings.selectedChannel) {
      el.pipelineChannelSelect.value = promptSettings.selectedChannel;
    }
  }

  if (el.btnDeleteChannel) {
    el.btnDeleteChannel.disabled = promptSettings.channels.length === 0;
    el.btnDeleteChannel.title = promptSettings.channels.length > 0 ? 'Delete this channel' : 'No channel to delete';
  }
}

function renderPromptPresets() {
  el.promptPresetSelect.innerHTML = promptSettings.presets.map((p) => {
    const isSelected = p.id === promptSettings.activePresetId;
    const defaultTag = p.isDefault ? ' ★' : '';
    return `<option value="${p.id}" ${isSelected ? 'selected' : ''}>${escHtml(p.name)}${defaultTag}</option>`;
  }).join('');

  const activePreset = getActivePreset();
  if (activePreset) {
    el.promptTemplate.value = activePreset.template;
    el.promptPresetDefaultBadge.style.display = activePreset.isDefault ? 'inline-block' : 'none';
    el.btnSetDefaultPreset.disabled = !!activePreset.isDefault;
    el.btnDeletePreset.disabled = promptSettings.presets.length <= 1;
  }
}

function getActivePreset() {
  return promptSettings.presets.find(p => p.id === promptSettings.activePresetId) || promptSettings.presets[0];
}

function updatePromptTitleCount() {
  const lines = el.promptTitles.value.split('\n').map(l => l.trim()).filter(Boolean);
  const count = lines.length;
  el.promptTitleCount.textContent = `${count} headline${count !== 1 ? 's' : ''}`;
}

function getResolvedPrompt() {
  const template = el.promptTemplate.value || '';
  const channel = promptSettings.selectedChannel || 'My News Channel';
  const titles = el.promptTitles.value.trim() || '— [Enter news headlines above] —';

  return template
    .replace(/\{channel\}/gi, channel)
    .replace(/\{\{channel\}\}/gi, channel)
    .replace(/\{channel_name\}/gi, channel)
    .replace(/\{channelName\}/gi, channel)
    .replace(/\{titles\}/gi, titles)
    .replace(/\{\{titles\}\}/gi, titles)
    .replace(/\{title\}/gi, titles)
    .replace(/\{\{title\}\}/gi, titles);
}

function updatePromptPreview() {
  const resolved = getResolvedPrompt();
  if (el.promptPreviewContent) {
    el.promptPreviewContent.textContent = resolved || '(Prompt preview will appear here once titles are entered)';
  }
  const chars = resolved.length;
  const words = resolved.split(/\s+/).filter(Boolean).length;
  if (el.promptPreviewStats) {
    el.promptPreviewStats.textContent = `${words} words · ${chars} chars`;
  }
}

function openPromptPreviewModal() {
  updatePromptPreview();
  if (el.promptPreviewModal) {
    el.promptPreviewModal.style.display = 'flex';
  }
}

function closePromptPreviewModal() {
  if (el.promptPreviewModal) {
    el.promptPreviewModal.style.display = 'none';
  }
}

function togglePreviewModalFullscreen() {
  if (el.promptPreviewContainer) {
    const isFull = el.promptPreviewContainer.classList.toggle('is-fullscreen');
    if (el.btnTogglePreviewModalFullscreen) {
      el.btnTogglePreviewModalFullscreen.textContent = isFull ? '🗗' : '⛶';
      el.btnTogglePreviewModalFullscreen.title = isFull ? 'Restore normal view' : 'Toggle Fullscreen View';
    }
  }
}

function togglePromptEditorFullscreen() {
  if (!el.promptPresetCard) return;
  const isFull = el.promptPresetCard.classList.toggle('is-fullscreen');
  if (el.btnTogglePromptFullscreen) {
    el.btnTogglePromptFullscreen.textContent = isFull ? '✕ Exit' : '⛶ Fullscreen';
    el.btnTogglePromptFullscreen.title = isFull ? 'Exit fullscreen editor' : 'Toggle Fullscreen prompt editor';
  }
}

function toggleHeadlinesEditorFullscreen() {
  if (!el.promptHeadlinesCard) return;
  const isFull = el.promptHeadlinesCard.classList.toggle('is-fullscreen');
  if (el.btnToggleHeadlinesFullscreen) {
    el.btnToggleHeadlinesFullscreen.textContent = isFull ? '✕ Exit' : '⛶ Fullscreen';
    el.btnToggleHeadlinesFullscreen.title = isFull ? 'Exit fullscreen headlines editor' : 'Toggle Fullscreen headlines editor';
  }
}

function insertPlaceholderAtCursor(placeholder) {
  const textarea = el.promptTemplate;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  textarea.value = text.substring(0, start) + placeholder + text.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
  textarea.focus();
  updatePromptPreview();
}

function showPromptNotice(msg, type = 'info') {
  el.promptRunNotice.textContent = msg;
  el.promptRunNotice.style.display = 'block';
  if (type === 'error') {
    el.promptRunNotice.style.background = 'rgba(239, 68, 68, 0.15)';
    el.promptRunNotice.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    el.promptRunNotice.style.color = '#f87171';
  } else if (type === 'success') {
    el.promptRunNotice.style.background = 'rgba(16, 185, 129, 0.15)';
    el.promptRunNotice.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    el.promptRunNotice.style.color = '#34d399';
  } else {
    el.promptRunNotice.style.background = 'rgba(79, 70, 229, 0.15)';
    el.promptRunNotice.style.borderColor = 'rgba(79, 70, 229, 0.4)';
    el.promptRunNotice.style.color = '#a5b4fc';
  }
}

async function handleRunChatbotPrompt() {
  const titles = el.promptTitles.value.trim();
  if (!titles) {
    showPromptNotice('Please enter at least one news headline before running.', 'error');
    el.promptTitles.focus();
    return;
  }

  const bot = promptSettings.selectedChatbot || 'chatgpt';
  const resolved = getResolvedPrompt();
  const autoSubmit = el.promptAutoSubmit.checked;
  const botName = CHATBOT_TARGETS[bot]?.name || 'Chatbot';

  showPromptNotice(`Opening ${botName} and preparing prompt...`, 'info');

  try {
    const res = await sendMessage(MESSAGE_TYPES.RUN_CHATBOT_PROMPT, {
      target: bot,
      prompt: resolved,
      autoSubmit
    });

    if (res?.success) {
      showPromptNotice(`✓ Sent to ${botName}! Opened in a new tab.`, 'success');
      setTimeout(() => {
        if (el.promptRunNotice.textContent.includes('Opened in a new tab')) {
          el.promptRunNotice.style.display = 'none';
        }
      }, 5000);
    } else {
      showPromptNotice(`Error: ${res?.error || 'Could not launch chatbot'}`, 'error');
    }
  } catch (err) {
    showPromptNotice(`Error: ${err.message}`, 'error');
  }
}

function setupPromptListeners() {
  // Chatbot Selection
  el.selectedChatbotCards.forEach((card) => {
    card.addEventListener('click', () => {
      const bot = card.dataset.bot;
      if (bot && CHATBOT_TARGETS[bot]) {
        promptSettings.selectedChatbot = bot;
        renderPromptChatbotUI();
        savePromptSettings();
      }
    });
  });

  // Channel Selection
  el.promptChannelSelect.addEventListener('change', () => {
    promptSettings.selectedChannel = el.promptChannelSelect.value;
    updatePromptPreview();
    savePromptSettings();
  });

  // Channel Add / Delete
  el.btnToggleAddChannel.addEventListener('click', () => {
    const isHidden = el.addChannelBox.style.display === 'none';
    el.addChannelBox.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      el.newChannelName.value = '';
      el.newChannelName.focus();
    }
  });

  el.btnCancelNewChannel.addEventListener('click', () => {
    el.addChannelBox.style.display = 'none';
    el.newChannelName.value = '';
  });

  el.btnSaveNewChannel.addEventListener('click', async () => {
    const name = el.newChannelName.value.trim();
    if (!name) return;
    if (!promptSettings.channels.includes(name)) {
      promptSettings.channels.push(name);
    }
    promptSettings.selectedChannel = name;
    el.addChannelBox.style.display = 'none';
    el.newChannelName.value = '';
    renderPromptChannels();
    updatePromptPreview();
    await savePromptSettings();
  });

  el.btnDeleteChannel.addEventListener('click', async () => {
    if (!promptSettings.channels || promptSettings.channels.length === 0) return;
    const current = promptSettings.selectedChannel;
    promptSettings.channels = promptSettings.channels.filter(c => c !== current);
    promptSettings.selectedChannel = promptSettings.channels.length > 0 ? promptSettings.channels[0] : '';
    renderPromptChannels();
    updatePromptPreview();
    await savePromptSettings();
    showPromptNotice(`Deleted channel "${current}".`, 'info');
    if (promptSettings.channels.length === 0) {
      el.addChannelBox.style.display = 'flex';
      el.newChannelName.focus();
    }
    setTimeout(() => {
      if (el.promptRunNotice.textContent.includes('Deleted channel')) {
        el.promptRunNotice.style.display = 'none';
      }
    }, 2500);
  });

  // Titles Input & Quick Actions
  el.promptTitles.addEventListener('input', () => {
    updatePromptTitleCount();
    updatePromptPreview();
  });

  el.btnPastePromptTitles.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        showPromptNotice('Clipboard is empty or does not contain text.', 'error');
        return;
      }
      el.promptTitles.value = text;
      updatePromptTitleCount();
      updatePromptPreview();
      el.promptTitles.focus();
    } catch {
      showPromptNotice('Clipboard read was blocked. Please paste manually.', 'error');
    }
  });

  el.btnImportFromArticleQueue.addEventListener('click', async () => {
    try {
      const state = await sendMessage(MESSAGE_TYPES.GET_ARTICLE_COPY_STATE);
      const queue = state?.queue || [];
      const titles = queue
        .map(item => (item.title || '').trim())
        .filter(Boolean);

      if (titles.length === 0) {
        showPromptNotice('No article titles found in Article Queue.', 'error');
        return;
      }

      el.promptTitles.value = titles.join('\n');
      updatePromptTitleCount();
      updatePromptPreview();

      const originalText = el.btnImportFromArticleQueue.textContent;
      el.btnImportFromArticleQueue.textContent = `✓ Imported ${titles.length}`;
      setTimeout(() => { el.btnImportFromArticleQueue.textContent = originalText; }, 2000);
    } catch (e) {
      console.warn('Failed to import titles from article queue:', e);
      showPromptNotice('Could not import from article queue.', 'error');
    }
  });

  el.btnClearPromptTitles.addEventListener('click', () => {
    el.promptTitles.value = '';
    updatePromptTitleCount();
    updatePromptPreview();
  });

  // Preset Selection & Management
  el.promptPresetSelect.addEventListener('change', () => {
    promptSettings.activePresetId = el.promptPresetSelect.value;
    renderPromptPresets();
    updatePromptPreview();
    savePromptSettings();
  });

  el.btnToggleNewPreset.addEventListener('click', () => {
    const isHidden = el.newPresetBox.style.display === 'none';
    el.newPresetBox.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      el.newPresetName.value = '';
      el.newPresetName.focus();
    }
  });

  el.btnCancelNewPreset.addEventListener('click', () => {
    el.newPresetBox.style.display = 'none';
    el.newPresetName.value = '';
  });

  el.btnSaveNewPreset.addEventListener('click', async () => {
    const name = el.newPresetName.value.trim();
    if (!name) return;

    const newPreset = {
      id: 'preset-' + Date.now(),
      name,
      isDefault: false,
      template: el.promptTemplate.value || `You are an editor for '{channel}'.\n\nNews titles:\n{titles}\n\nCreate a report script.`
    };

    promptSettings.presets.push(newPreset);
    promptSettings.activePresetId = newPreset.id;
    el.newPresetBox.style.display = 'none';
    el.newPresetName.value = '';
    renderPromptPresets();
    updatePromptPreview();
    await savePromptSettings();
  });

  el.btnSaveCurrentPreset.addEventListener('click', async () => {
    const activePreset = getActivePreset();
    if (activePreset) {
      activePreset.template = el.promptTemplate.value;
      await savePromptSettings();
      el.presetSaveNotice.textContent = 'Preset saved ✓';
      setTimeout(() => { el.presetSaveNotice.textContent = ''; }, 2000);
      updatePromptPreview();
    }
  });

  el.btnSetDefaultPreset.addEventListener('click', async () => {
    const activePreset = getActivePreset();
    if (activePreset) {
      promptSettings.presets.forEach(p => { p.isDefault = (p.id === activePreset.id); });
      renderPromptPresets();
      await savePromptSettings();
      el.presetSaveNotice.textContent = 'Set as default ✓';
      setTimeout(() => { el.presetSaveNotice.textContent = ''; }, 2000);
    }
  });

  el.btnResetDefaultPresets?.addEventListener('click', async () => {
    promptSettings.presets = JSON.parse(JSON.stringify(DEFAULT_PROMPT_PRESETS));
    promptSettings.activePresetId = 'preset-youtube-package';
    promptSettings.channels = [...DEFAULT_CHANNELS];
    promptSettings.selectedChannel = promptSettings.channels[0];
    renderPromptChannels();
    renderPromptPresets();
    updatePromptPreview();
    await savePromptSettings();
    el.presetSaveNotice.textContent = 'Reset to YouTube defaults ✓';
    setTimeout(() => { el.presetSaveNotice.textContent = ''; }, 2200);
  });

  el.btnDeletePreset.addEventListener('click', async () => {
    if (promptSettings.presets.length <= 1) return;
    const activeId = promptSettings.activePresetId;
    promptSettings.presets = promptSettings.presets.filter(p => p.id !== activeId);
    promptSettings.activePresetId = promptSettings.presets.find(p => p.isDefault)?.id || promptSettings.presets[0].id;
    renderPromptPresets();
    updatePromptPreview();
    await savePromptSettings();
  });

  // Placeholder Chips
  el.btnChipChannel.addEventListener('click', () => insertPlaceholderAtCursor('{channel}'));
  el.btnChipTitles.addEventListener('click', () => insertPlaceholderAtCursor('{titles}'));

  // Template changes
  el.promptTemplate.addEventListener('input', updatePromptPreview);

  // Preview Modal events
  el.btnOpenPromptPreviewModal?.addEventListener('click', openPromptPreviewModal);
  el.btnClosePromptPreviewModal?.addEventListener('click', closePromptPreviewModal);
  el.btnClosePreviewModalBottom?.addEventListener('click', closePromptPreviewModal);
  el.promptPreviewBackdrop?.addEventListener('click', closePromptPreviewModal);
  el.btnTogglePreviewModalFullscreen?.addEventListener('click', togglePreviewModalFullscreen);

  // Fullscreen Editor toggles
  el.btnTogglePromptFullscreen?.addEventListener('click', togglePromptEditorFullscreen);
  el.btnToggleHeadlinesFullscreen?.addEventListener('click', toggleHeadlinesEditorFullscreen);

  // Global Escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (el.promptPreviewModal && el.promptPreviewModal.style.display !== 'none') {
        closePromptPreviewModal();
      } else if (el.promptPresetCard?.classList.contains('is-fullscreen')) {
        togglePromptEditorFullscreen();
      } else if (el.promptHeadlinesCard?.classList.contains('is-fullscreen')) {
        toggleHeadlinesEditorFullscreen();
      }
    }
  });

  el.btnCopyResolvedPrompt?.addEventListener('click', async () => {
    const resolved = getResolvedPrompt();
    try {
      await navigator.clipboard.writeText(resolved);
      const originalText = el.btnCopyResolvedPrompt.textContent;
      el.btnCopyResolvedPrompt.textContent = 'Prompt copied ✓';
      setTimeout(() => { el.btnCopyResolvedPrompt.textContent = originalText; }, 1800);
    } catch {
      showPromptNotice('Clipboard access blocked. Please copy manually.', 'error');
    }
  });

  // Auto-submit checkbox
  el.promptAutoSubmit.addEventListener('change', () => {
    promptSettings.autoSubmit = el.promptAutoSubmit.checked;
    savePromptSettings();
  });

  // Run in Chatbot
  el.btnRunChatbotPrompt.addEventListener('click', handleRunChatbotPrompt);
}

