import { SCAN_INTERVAL } from './config.js';
import { extractCodeBlocks } from './code-blocks.js';
import { sendToLocalhost } from './network.js';
import { showNotification } from './ui.js';

export function initializeEventListeners() {
  console.log('[Init] Initializing code block monitoring');
  let previousBlocks = new Set();
  
  // Initial scan for code blocks
  console.log('[Init] Performing initial code block scan');
  extractCodeBlocks();

  // Set up periodic scanning
  setInterval(() => {
    console.log('[Monitor] Scanning for new code blocks...');
    const blocks = extractCodeBlocks();
    const currentBlocksSet = new Set(blocks.map(b => b.code));
    
    const newBlocks = blocks.filter(block => !previousBlocks.has(block.code));
    if (newBlocks.length > 0) {
      console.log(`[Monitor] Found ${newBlocks.length} new code blocks`);
      sendToLocalhost(newBlocks);
    } else {
      console.log('[Monitor] No new code blocks found');
    }
    
    previousBlocks = currentBlocksSet;
  }, SCAN_INTERVAL);

  // Set up keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      console.log('[Shortcut] Manual extraction triggered (Ctrl+Shift+E)');
      const blocks = extractCodeBlocks();
      if (blocks.length > 0) {
        console.log(`[Shortcut] Manually sending ${blocks.length} code blocks`);
        sendToLocalhost(blocks);
      } else {
        console.log('[Shortcut] No code blocks found for manual extraction');
        showNotification('Nie znaleziono bloków kodu na tej stronie', true);
      }
    }
  });

  console.log('[Init] Code block monitoring initialized');
}
