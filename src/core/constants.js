export const DEFAULT_SETTINGS = {
  imagesPerTitle: 5,
  minimumWidth: 1200,
  minimumAspectRatio: 1.4,
  preferredAspectRatio: '16:9',
  timeRange: 'any',
  customDateMin: '',
  customDateMax: '',
  rootFolder: 'News Images',
  saveToDownloadsRoot: true,
  maxRetries: 2,
  delayBetweenSearchesMs: 3000
};

export const DEFAULT_ARTICLE_SETTINGS = {
  excludedWords: 'READ MORE\nRead more\nAlso read\nFollow us\nSign up\nSubscribe\nPhoto:\nCredit:\nImage:\nSponsored\nAdvertisement\nAffiliate\nClick here\nWatch:\nJoin our ',
  skipLinkHeavy: true,
  testMode: false,
  testDelaySeconds: 5,
  autoDownloadImages: true,
  autoRunChatbotPrompt: true
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

export const CHATBOT_TARGETS = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '🤖',
    logo: 'icons/chatgpt.png',
    url: 'https://chatgpt.com/',
    hostMatch: 'chatgpt.com'
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    icon: '🧠',
    logo: 'icons/claude.png',
    url: 'https://claude.ai/new',
    hostMatch: 'claude.ai'
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    icon: '✨',
    logo: 'icons/gemini.png',
    url: 'https://gemini.google.com/app',
    hostMatch: 'gemini.google.com'
  }
};

export const DEFAULT_CHANNELS = [
  'My News Channel',
  'BD News Express'
];

export const DEFAULT_PROMPT_PRESETS = [
  {
    id: 'preset-youtube-package',
    name: 'YouTube Full Package (Title, Desc, Tags)',
    isDefault: true,
    template: `You are an expert YouTube news content creator and YouTube SEO specialist for the channel '{channel}'.

Based on these news headlines:
{titles}

Please generate a complete, high-performing YouTube Video Package:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🎯 CATCHY YOUTUBE TITLES (Provide 5 options)
   - High CTR, engaging, and curiosity-driven (under 70 characters).
   - Optimized for search and recommendation algorithms.

2. 📝 YOUTUBE VIDEO DESCRIPTION
   - Catchy opening hook summarizing the main stories (first 2-3 lines).
   - News highlights breakdown with timestamp placeholders:
     00:00 - Intro & Headlines
     00:30 - [Story 1 Highlight]
     01:30 - [Story 2 Highlight]
     02:30 - [Story 3 Highlight]
     03:30 - Outro & Summary
   - Call to action: "Subscribe to {channel} for daily updates! Like and share if you find this informative."
   - Disclaimer and credits notice.

3. #️⃣ TRENDING HASHTAGS (#tags)
   - 8 to 10 high-reach hashtags (e.g. #{channel} #News #TopNews #BangladeshNews #BreakingNews).

4. 🏷️ YOUTUBE STUDIO TAGS (SEO Keywords)
   - 25 to 30 comma-separated tags ready to copy and paste directly into the YouTube Studio tag box.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  },
  {
    id: 'preset-youtube-titles-tags',
    name: 'YouTube Viral Titles & SEO Tags',
    isDefault: false,
    template: `For the YouTube news channel '{channel}', analyze the following headlines:

{titles}

Generate:
1. 10 Viral, High-CTR YouTube Video Titles (Mix of breaking news, question, and curiosity angles).
2. 5 Trending Hashtags including #{channel}.
3. 30 Comma-separated YouTube Studio SEO Tags ready for copy-paste.`
  },
  {
    id: 'preset-youtube-script',
    name: 'YouTube Video Script / Voiceover',
    isDefault: false,
    template: `You are a professional YouTube news anchor for '{channel}'.

Write an engaging, fast-paced voiceover script based on these news headlines:

{titles}

Structure:
- Hook Intro: "Welcome back to {channel}! Here are the top news headlines making waves today..."
- Headline Breakdown: Present each story with background context, key facts, and natural conversational transitions.
- Outro: "What do you think about today's stories? Let us know in the comments below! Don't forget to like, subscribe to {channel}, and hit the notification bell for the latest updates."`
  },
  {
    id: 'preset-youtube-shorts',
    name: 'YouTube Shorts & Reels Pack',
    isDefault: false,
    template: `Create a 60-second YouTube Shorts / Reels package for '{channel}' based on:

{titles}

Deliver:
1. Short Title (catchy with #Shorts).
2. 60-second rapid-fire Voiceover Script.
3. Shorts Description (under 200 words) with CTA.
4. Top 6 Shorts Hashtags (e.g. #Shorts #{channel} #ViralNews #NewsShorts).`
  }
];

export const DEFAULT_PROMPT_SETTINGS = {
  version: 4,
  selectedChatbot: 'chatgpt',
  selectedChannel: 'My News Channel',
  channels: ['My News Channel', 'BD News Express'],
  autoSubmit: true,
  activePresetId: 'preset-youtube-package'
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
  CLEAR_ARTICLE_COPY: 'CLEAR_ARTICLE_COPY',
  ARTICLE_CONTENT_EXTRACTED: 'ARTICLE_CONTENT_EXTRACTED',
  RUN_CHATBOT_PROMPT: 'RUN_CHATBOT_PROMPT',
  GET_PROMPT_SETTINGS: 'GET_PROMPT_SETTINGS',
  SAVE_PROMPT_SETTINGS: 'SAVE_PROMPT_SETTINGS'
};

