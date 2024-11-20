import { PLATFORM_SELECTORS, MIN_CODE_LENGTH, SUPPORTED_LANGUAGES } from './config.js';
import { detectPlatform } from './platform.js';
import { addRunButtonToElement } from './ui.js';

export function extractCodeBlocks(doc = document) {
  console.log('[Extraction] Starting code block extraction...');
  const platform = detectPlatform(doc.location?.href || window.location.href);
  const selectors = [
    ...PLATFORM_SELECTORS[platform],
    ...PLATFORM_SELECTORS.generic
  ];
  
  console.log('[Extraction] Using selectors:', selectors);
  const codeBlocks = new Set();
  let blockCount = 0;
  
  selectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    console.log(`[Extraction] Found ${elements.length} elements matching selector: ${selector}`);
    
    elements.forEach(element => {
      const isInPre = element.closest('pre');
      if (!isInPre && !element.classList.contains('block')) {
        console.log('[Extraction] Skipping element - not in pre tag or missing block class');
        return;
      }
      
      const code = element.textContent.trim();
      if (!code || code.length < MIN_CODE_LENGTH) {
        console.log('[Extraction] Skipping element - empty or too short code block');
        return;
      }
      
      let language = detectLanguage(element);
      
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
      console.log(`[Extraction] Added code block #${blockCount} with language: ${language}`);
      
      addRunButtonToElement(element, blockData);
    });
  });

  console.log(`[Extraction] Complete. Found ${blockCount} unique code blocks`);
  return Array.from(codeBlocks).map(block => JSON.parse(block));
}

function detectLanguage(element) {
  let language = 'text';
  const classNames = [...element.classList];
  console.log('[Extraction] Analyzing element classes:', classNames);
  
  for (const className of classNames) {
    if (className.startsWith('language-')) {
      language = className.replace('language-', '');
      console.log('[Extraction] Language detected from language- prefix:', language);
      break;
    }
    if (className.startsWith('hljs-')) {
      language = className.replace('hljs-', '');
      console.log('[Extraction] Language detected from hljs- prefix:', language);
      break;
    }
    if (SUPPORTED_LANGUAGES.includes(className.toLowerCase())) {
      language = className.toLowerCase();
      console.log('[Extraction] Language detected from supported languages:', language);
      break;
    }
  }
  
  return language;
}
