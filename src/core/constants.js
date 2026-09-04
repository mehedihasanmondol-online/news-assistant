export const DEFAULT_SETTINGS = {
  imagesPerTitle: 5,
  minimumWidth: 1200,
  minimumAspectRatio: 1.4,
  preferredAspectRatio: '16:9',
  rootFolder: 'News Images',
  saveToDownloadsRoot: true,
  maxRetries: 2,
  delayBetweenSearchesMs: 3000
};

export const QUEUE_STATUS = {
  PENDING: 'pending',
  SEARCHING: 'searching',
  EXTRACTING: 'extracting',
  DOWNLOADING: 'downloading',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  PAUSED: 'paused'
};

export const MESSAGE_TYPES = {
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  GET_STATE: 'GET_STATE',
  START_QUEUE: 'START_QUEUE',
  PAUSE_QUEUE: 'PAUSE_QUEUE',
  RESUME_QUEUE: 'RESUME_QUEUE',
  STOP_QUEUE: 'STOP_QUEUE',
  STATE_UPDATED: 'STATE_UPDATED',
  CANDIDATES_EXTRACTED: 'CANDIDATES_EXTRACTED',
  PARSER_ERROR: 'PARSER_ERROR',
  START_ARTICLE_COPY: 'START_ARTICLE_COPY',
  STOP_ARTICLE_COPY: 'STOP_ARTICLE_COPY',
  GET_ARTICLE_COPY_STATE: 'GET_ARTICLE_COPY_STATE',
  ARTICLE_CONTENT_EXTRACTED: 'ARTICLE_CONTENT_EXTRACTED'
};
