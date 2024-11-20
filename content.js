import {
  PLATFORM_SELECTORS,
  NOTIFICATION_STYLES,
  API_ENDPOINTS,
  SCAN_INTERVAL,
  MIN_CODE_LENGTH,
  SUPPORTED_LANGUAGES
} from './config.js';

export function detectPlatform(url) {
  console.log('Detecting platform for URL:', url);
  const hostname = new URL(url).hostname;
  for (const platform in PLATFORM_SELECTORS) {
    if (hostname.includes(platform)) {
      console.log('Platform detected:', platform);
      return platform;
    }
  }
  console.log('Using generic platform selectors');
  return 'generic';
}

export function extractCodeBlocks(doc = document) {
  console.log('Starting code block extraction...');
  const platform = detectPlatform(doc.location?.href || window.location.href);
  const selectors = [
    ...PLATFORM_SELECTORS[platform],
    ...PLATFORM_SELECTORS.generic
  ];
  
  console.log('Using selectors:', selectors);
  const codeBlocks = new Set();
  let blockCount = 0;
  
  selectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    console.log(`Found ${elements.length} elements matching selector: ${selector}`);
    
    elements.forEach(element => {
      const isInPre = element.closest('pre');
      if (!isInPre && !element.classList.contains('block')) {
        console.log('Skipping element - not in pre tag or missing block class');
        return;
      }
      
      const code = element.textContent.trim();
      if (!code || code.length < MIN_CODE_LENGTH) {
        console.log('Skipping element - empty or too short code block');
        return;
      }
      
      let language = 'text';
      const classNames = [...element.classList];
      console.log('Analyzing element classes:', classNames);
      
      for (const className of classNames) {
        if (className.startsWith('language-')) {
          language = className.replace('language-', '');
          console.log('Language detected from language- prefix:', language);
          break;
        }
        if (className.startsWith('hljs-')) {
          language = className.replace('hljs-', '');
          console.log('Language detected from hljs- prefix:', language);
          break;
        }
        if (SUPPORTED_LANGUAGES.includes(className.toLowerCase())) {
          language = className.toLowerCase();
          console.log('Language detected from supported languages:', language);
          break;
        }
      }

      const blockData = {
        code,
        language,
        platform,
        url: doc.location?.href || window.location.href,
        timestamp: new Date().toISOString(),
        title: doc.title || document.title,
        contextHtml: isInPre ? isInPre.parentElement.innerHTML : element.parentElement.innerHTML
      };

      codeBlocks.add(JSON.stringify(blockData));
      blockCount++;
      console.log(`Added code block #${blockCount} with language: ${language}`);
    });
  });

  console.log(`Extraction complete. Found ${blockCount} unique code blocks`);
  return Array.from(codeBlocks).map(block => JSON.parse(block));
}

export function sendToLocalhost(codeBlocks) {
  if (!codeBlocks || codeBlocks.length === 0) {
    console.log('No code blocks to send');
    return;
  }

  console.log(`Preparing to send ${codeBlocks.length} code blocks`);
  const formData = new FormData();
  const payload = {
    blocks: codeBlocks,
    metadata: {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
  };
  
  console.log('Request payload:', payload);
  formData.append('blocks', JSON.stringify(payload));

  console.log('Sending request to:', API_ENDPOINTS.convert);
  return fetch(API_ENDPOINTS.convert, {
    method: 'POST',
    body: formData
  })
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Received response data:', data);
    if (data.error) {
      console.error('Server reported error:', data.error);
      showError(data.error);
    } else {
      console.log('Processing successful response');
      const errorDiv = document.getElementById('error-message');
      if (errorDiv) errorDiv.style.display = 'none';
      const resultDiv = document.getElementById('result');
      if (resultDiv) {
        resultDiv.style.display = 'block';
        const resultContent = resultDiv.querySelector('.content');
        if (resultContent) {
          resultContent.textContent = JSON.stringify(data, null, 2);
        }
      }
      displayChanges(data);
    }
    return data;
  })
  .catch(error => {
    console.error('Request failed:', error);
    showError('An error occurred during conversion');
    throw error;
  });
}

export function showError(message, doc = document) {
  console.error('Showing error message:', message);
  const errorDiv = doc.getElementById('error-message') || createErrorDiv(doc);
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  return errorDiv;
}

export function createErrorDiv(doc = document) {
  console.log('Creating error div element');
  const div = doc.createElement('div');
  div.id = 'error-message';
  div.style.cssText = `
    ${NOTIFICATION_STYLES.base}
    background-color: ${NOTIFICATION_STYLES.error};
  `;
  doc.body.appendChild(div);
  return div;
}

export function displayChanges(data) {
  console.log('Displaying changes:', data);
  // Implementation of displaying changes based on the data
}

export function showNotification(message, isError = false, doc = document) {
  console.log(`Showing notification: ${message} (${isError ? 'error' : 'success'})`);
  const notification = doc.createElement('div');
  notification.style.cssText = `
    ${NOTIFICATION_STYLES.base}
    background-color: ${isError ? NOTIFICATION_STYLES.error : NOTIFICATION_STYLES.success};
  `;
  notification.textContent = message;
  doc.body.appendChild(notification);
  setTimeout(() => {
    console.log('Removing notification');
    notification.remove();
  }, 3000);
  return notification;
}

// Only run initialization code if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('Initializing code block monitoring');
  let previousBlocks = new Set();
  setInterval(() => {
    console.log('Scanning for new code blocks...');
    const blocks = extractCodeBlocks();
    const currentBlocksSet = new Set(blocks.map(b => b.code));
    
    const newBlocks = blocks.filter(block => !previousBlocks.has(block.code));
    if (newBlocks.length > 0) {
      console.log(`Found ${newBlocks.length} new code blocks`);
      sendToLocalhost(newBlocks);
    } else {
      console.log('No new code blocks found');
    }
    
    previousBlocks = currentBlocksSet;
  }, SCAN_INTERVAL);

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      console.log('Manual extraction triggered (Ctrl+Shift+E)');
      const blocks = extractCodeBlocks();
      if (blocks.length > 0) {
        console.log(`Manually sending ${blocks.length} code blocks`);
        sendToLocalhost(blocks);
      } else {
        console.log('No code blocks found for manual extraction');
        showNotification('Nie znaleziono bloków kodu na tej stronie', true);
      }
    }
  });

  console.log('Code block monitoring initialized');
}
