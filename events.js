// Event handling functionality
window.EVENTS = {
  initializeEventListeners: function() {
    console.log('[Init] Initializing code block monitoring');
    let previousBlocks = new Set();
    
    // Initial scan for code blocks
    console.log('[Init] Performing initial code block scan');
    CODE_BLOCKS.extractCodeBlocks();

    // Set up periodic scanning
    setInterval(() => {
      console.log('[Monitor] Scanning for new code blocks...');
      const blocks = CODE_BLOCKS.extractCodeBlocks();
      const currentBlocksSet = new Set(blocks.map(b => b.code));
      
      const newBlocks = blocks.filter(block => !previousBlocks.has(block.code));
      if (newBlocks.length > 0) {
        console.log(`[Monitor] Found ${newBlocks.length} new code blocks`);
        NETWORK.sendToLocalhost(newBlocks);
      } else {
        console.log('[Monitor] No new code blocks found');
      }
      
      previousBlocks = currentBlocksSet;
    }, CONFIG.SCAN_INTERVAL);

    // Set up keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        console.log('[Shortcut] Manual extraction triggered (Ctrl+Shift+E)');
        const blocks = CODE_BLOCKS.extractCodeBlocks();
        if (blocks.length > 0) {
          console.log(`[Shortcut] Manually sending ${blocks.length} code blocks`);
          NETWORK.sendToLocalhost(blocks);
        } else {
          console.log('[Shortcut] No code blocks found for manual extraction');
          UI.showNotification('No code blocks found on this page', true);
        }
      }
    });

    console.log('[Init] Code block monitoring initialized');
  }
};
