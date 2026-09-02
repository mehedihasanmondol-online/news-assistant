import { MESSAGE_TYPES, QUEUE_STATUS } from '../core/constants.js';

document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    titles: document.getElementById('titles'),
    imagesPerTitle: document.getElementById('imagesPerTitle'),
    minWidth: document.getElementById('minWidth'),
    minAspectRatio: document.getElementById('minAspectRatio'),
    rootFolder: document.getElementById('rootFolder'),
    btnStart: document.getElementById('btnStart'),
    btnPause: document.getElementById('btnPause'),
    btnResume: document.getElementById('btnResume'),
    btnStop: document.getElementById('btnStop'),
    overallStatus: document.getElementById('overallStatus'),
    currentTask: document.getElementById('currentTask'),
    statCompleted: document.getElementById('statCompleted'),
    statFailed: document.getElementById('statFailed'),
    statImages: document.getElementById('statImages'),
    queueList: document.getElementById('queueList')
  };

  // Load initial state
  await updateStateFromBackground();
  
  // Start polling state
  setInterval(updateStateFromBackground, 1000);

  // Event Listeners
  elements.btnStart.addEventListener('click', async () => {
    const titlesText = elements.titles.value;
    const titles = titlesText.split('\n').filter(t => t.trim().length > 0);
    
    if (titles.length === 0) {
      alert('Please enter at least one news title.');
      return;
    }

    // Save settings
    await chrome.runtime.sendMessage({
      action: MESSAGE_TYPES.UPDATE_SETTINGS,
      payload: {
        imagesPerTitle: parseInt(elements.imagesPerTitle.value, 10),
        minimumWidth: parseInt(elements.minWidth.value, 10),
        minimumAspectRatio: parseFloat(elements.minAspectRatio.value),
        rootFolder: elements.rootFolder.value
      }
    });

    // Start Queue
    await chrome.runtime.sendMessage({
      action: MESSAGE_TYPES.START_QUEUE,
      payload: { titles }
    });

    updateStateFromBackground();
  });

  elements.btnPause.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: MESSAGE_TYPES.PAUSE_QUEUE });
  });

  elements.btnResume.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: MESSAGE_TYPES.RESUME_QUEUE });
  });

  elements.btnStop.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: MESSAGE_TYPES.STOP_QUEUE });
  });

  async function updateStateFromBackground() {
    try {
      const state = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: MESSAGE_TYPES.GET_STATE }, resolve);
      });

      if (!state) return;

      renderState(state);
    } catch (error) {
      console.error("Error communicating with background", error);
    }
  }

  function renderState(state) {
    // Update settings if not focused (to prevent overwriting user input)
    if (document.activeElement.tagName !== 'INPUT') {
      elements.imagesPerTitle.value = state.settings.imagesPerTitle;
      elements.minWidth.value = state.settings.minimumWidth;
      elements.minAspectRatio.value = state.settings.minimumAspectRatio;
      elements.rootFolder.value = state.settings.rootFolder;
    }

    // Update buttons
    const isRunning = state.overallStatus === QUEUE_STATUS.SEARCHING || state.overallStatus === QUEUE_STATUS.EXTRACTING || state.overallStatus === QUEUE_STATUS.DOWNLOADING;
    const isPaused = state.overallStatus === QUEUE_STATUS.PAUSED;
    const isIdle = state.overallStatus === QUEUE_STATUS.COMPLETED || state.overallStatus === 'pending';

    elements.btnStart.disabled = isRunning || isPaused;
    elements.btnPause.disabled = !isRunning;
    elements.btnResume.disabled = !isPaused;
    elements.btnStop.disabled = isIdle;

    // Update progress
    elements.overallStatus.textContent = `Status: ${state.overallStatus.toUpperCase()}`;
    
    if (state.currentTitleIndex >= 0 && state.queue[state.currentTitleIndex]) {
      elements.currentTask.textContent = state.queue[state.currentTitleIndex].title;
    } else {
      elements.currentTask.textContent = '';
    }

    elements.statCompleted.textContent = state.stats.completed;
    elements.statFailed.textContent = state.stats.failed;
    elements.statImages.textContent = state.stats.downloadedImages;

    // Update queue list
    elements.queueList.innerHTML = '';
    state.queue.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = `queue-item ${index === state.currentTitleIndex ? 'active' : ''}`;
      
      const titleSpan = document.createElement('span');
      titleSpan.className = 'queue-title';
      titleSpan.textContent = item.title;
      
      const statusSpan = document.createElement('span');
      statusSpan.textContent = `${item.status} (${item.downloaded}/${state.settings.imagesPerTitle})`;
      
      div.appendChild(titleSpan);
      div.appendChild(statusSpan);
      elements.queueList.appendChild(div);
    });
  }
});
