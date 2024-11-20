// Platform specific selectors for code extraction
const CONFIG = {
  PLATFORM_SELECTORS: {
    discord: ['.markup-2BOw-j pre code', '.markup-2BOw-j code'],
    claude: ['.prose pre code', '.prose code'],
    chatgpt: ['.markdown-renderer pre code', '.markdown-renderer code'],
    
    github: ['.highlight pre code', '.markdown-body pre code'],
    stackoverflow: ['.post-text pre code', '.answercell pre code'],
    stackexchange: ['.post-text pre code', '.answer pre code'],
    gitlab: ['.code.highlight pre code', '.markdown-body pre code'],
    bitbucket: ['.code pre code', '.markup pre code'],
    
    slack: ['.c-mrkdwn__pre code', '.c-mrkdwn code'],
    teams: ['.message-content pre code', '.markdown pre code'],
    gitter: ['.chat-item pre code', '.markdown-body pre code'],
    
    notion: ['.notion-code-block pre code', '.notion-markdown pre code'],
    obsidian: ['.markdown-preview-view pre code', '.cm-line pre code'],
    
    jupyter: ['.cell_output pre code', '.input_area pre code'],
    kaggle: ['.code-block pre code', '.markdown-cell-code pre code'],
    colab: ['.code pre code', '.outputtext pre code'],
    codepen: ['.code-wrap pre code', '.preview-wrap pre code'],
    jsfiddle: ['.CodeMirror pre code', '.result pre code'],
    replit: ['.monaco-editor pre code', '.markdown pre code'],
    
    hashnode: ['.article pre code', '.markdown pre code'],
    devto: ['.article-body pre code', '.crayons-article pre code'],
    medium: ['.graf pre code', '.markup--pre code'],
    
    generic: [
      'pre code',
      'code[class*="language-"]',
      'code[class*="hljs"]',
      '.markdown pre code',
      '.markdown-body pre code'
    ]
  },

  // Notification styles
  NOTIFICATION_STYLES: {
    base: `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      color: white;
    `,
    success: '#44ff44',
    error: '#ff4444'
  },

  // API endpoints
  API_ENDPOINTS: {
    convert: 'http://localhost:5000/convert'
  },

  // Scanning interval in milliseconds
  SCAN_INTERVAL: 5000,

  // Minimum code block length
  MIN_CODE_LENGTH: 2,

  // Supported programming languages
  SUPPORTED_LANGUAGES: [
    'js', 'python', 'java', 'cpp', 'ruby', 
    'php', 'html', 'css', 'sql', 'bash', 
    'shell', 'typescript'
  ]
};

// Make config available globally
window.CONFIG = CONFIG;
