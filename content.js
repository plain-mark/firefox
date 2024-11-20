const PLATFORM_SELECTORS = {
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
};

function detectPlatform(url) {
  const hostname = new URL(url).hostname;
  for (const platform in PLATFORM_SELECTORS) {
    if (hostname.includes(platform)) {
      return platform;
    }
  }
  return 'generic';
}

function extractCodeBlocks() {
  const platform = detectPlatform(window.location.href);
  const selectors = [
    ...PLATFORM_SELECTORS[platform],
    ...PLATFORM_SELECTORS.generic
  ];
  
  const codeBlocks = new Set(); // Używamy Set aby uniknąć duplikatów
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      const isInPre = element.closest('pre');
      if (!isInPre && !element.classList.contains('block')) return;
      
      const code = element.textContent.trim();
      if (!code || code.length < 2) return; // Pomijamy puste lub zbyt krótkie bloki
      
      let language = 'text';
      const classNames = [...element.classList];
      
      for (const className of classNames) {
        if (className.startsWith('language-')) {
          language = className.replace('language-', '');
          break;
        }
        if (className.startsWith('hljs-')) {
          language = className.replace('hljs-', '');
          break;
        }
        if (className.match(/^(js|python|java|cpp|ruby|php|html|css|sql|bash|shell|typescript)$/i)) {
          language = className.toLowerCase();
          break;
        }
      }

      const blockData = {
        code,
        language,
        platform,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        title: document.title,
        contextHtml: isInPre ? isInPre.parentElement.innerHTML : element.parentElement.innerHTML
      };

      codeBlocks.add(JSON.stringify(blockData));
    });
  });

  return Array.from(codeBlocks).map(block => JSON.parse(block));
}

function sendToLocalhost(codeBlocks) {
  if (!codeBlocks || codeBlocks.length === 0) return;

  fetch('http://localhost:5000/code-blocks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      blocks: codeBlocks,
      metadata: {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    })
  })
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(data => {
    console.log('Code blocks sent successfully:', data);
    showNotification(`Wysłano ${codeBlocks.length} bloków kodu`);
  })
  .catch(error => {
    console.error('Error sending code blocks:', error);
    showNotification('Błąd wysyłania bloków kodu', true);
  });
}

function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: ${isError ? '#ff4444' : '#44ff44'};
    color: white;
    border-radius: 5px;
    z-index: 10000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

let previousBlocks = new Set();
setInterval(() => {
  const blocks = extractCodeBlocks();
  const currentBlocksSet = new Set(blocks.map(b => b.code));
  
  const newBlocks = blocks.filter(block => !previousBlocks.has(block.code));
  if (newBlocks.length > 0) {
    sendToLocalhost(newBlocks);
  }
  
  previousBlocks = currentBlocksSet;
}, 5000);

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'E') {
    const blocks = extractCodeBlocks();
    if (blocks.length > 0) {
      sendToLocalhost(blocks);
    } else {
      showNotification('Nie znaleziono bloków kodu na tej stronie', true);
    }
  }
});
