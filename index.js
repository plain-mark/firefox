// Immediately log that script is loaded
console.log('[Content] index.js is being executed');

// Test messaging with background script
function testBackgroundCommunication() {
    console.log('[Content] Testing communication with background script');
    browser.runtime.sendMessage({ type: 'TEST' })
        .then(response => {
            console.log('[Content] Received response from background:', response);
        })
        .catch(error => {
            console.error('[Content] Communication test failed:', error);
        });
}

// Initialize extension
function initializeExtension() {
    console.log('[Content] Starting Code Block Extractor');
    
    // Test background communication first
    testBackgroundCommunication();
    
    // Verify all required globals are available
    const globals = {
        CONFIG: !!window.CONFIG,
        PLATFORM: !!window.PLATFORM,
        UI: !!window.UI,
        CODE_BLOCKS: !!window.CODE_BLOCKS,
        NETWORK: !!window.NETWORK,
        EVENTS: !!window.EVENTS
    };
    
    console.log('[Content] Available globals:', globals);

    if (!Object.values(globals).every(Boolean)) {
        console.error('[Content] Missing required global objects');
        return;
    }

    try {
        console.log('[Content] Initializing event listeners');
        EVENTS.initializeEventListeners();
        console.log('[Content] Event listeners initialized successfully');
    } catch (error) {
        console.error('[Content] Error during initialization:', error);
    }
}

// Wait for DOM and required scripts
if (document.readyState === 'loading') {
    console.log('[Content] Document still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[Content] DOMContentLoaded fired');
        // Give a small delay to ensure all scripts are loaded
        setTimeout(initializeExtension, 100);
    });
} else {
    console.log('[Content] Document already loaded');
    // Give a small delay to ensure all scripts are loaded
    setTimeout(initializeExtension, 100);
}

// Log any errors
window.addEventListener('error', (event) => {
    console.error('[Content] Error caught:', event.error);
});

// Log that script has finished loading
console.log('[Content] index.js finished loading');
