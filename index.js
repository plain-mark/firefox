import { detectPlatform } from './platform.js';
import { showError, showNotification, displayChanges } from './ui.js';
import { extractCodeBlocks } from './code-blocks.js';
import { sendToLocalhost } from './network.js';
import { initializeEventListeners } from './events.js';

// Export main functionality for external use
export {
  detectPlatform,
  showError,
  showNotification,
  displayChanges,
  extractCodeBlocks,
  sendToLocalhost
};

// Only run initialization code if we're in a browser environment
if (typeof window !== 'undefined') {
  initializeEventListeners();
}
