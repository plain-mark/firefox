// Network handling functionality
window.NETWORK = {
  sendToLocalhost: function(codeBlocks) {
    if (!codeBlocks || codeBlocks.length === 0) {
      console.log('[API] No code blocks to send');
      return;
    }

    console.log('[API] Preparing to send code blocks:', codeBlocks);
    const payload = {
      blocks: codeBlocks,
      metadata: {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    };
    
    console.log('[API] Request payload:', payload);

    // Use the appropriate runtime API
    const runtime = chrome.runtime || browser.runtime;

    // Send message to background script
    return new Promise((resolve, reject) => {
      runtime.sendMessage({
        type: 'CODE_BLOCK',
        data: payload
      }, response => {
        // Check for runtime error
        if (runtime.lastError) {
          console.error('[API] Runtime error:', runtime.lastError);
          UI.showError('Extension error: ' + runtime.lastError.message);
          reject(runtime.lastError);
          return;
        }

        console.log('[API] Response from background script:', response);
        if (response.status === 'error') {
          console.error('[API] Background script reported error:', response.message);
          UI.showError(response.message);
          reject(new Error(response.message));
          return;
        }
        
        if (response.status === 'success') {
          console.log('[API] Processing successful response');
          const errorDiv = document.getElementById('error-message');
          if (errorDiv) errorDiv.style.display = 'none';
          UI.displayChanges(response.data);
          resolve(response);
        }
      });
    }).catch(error => {
      console.error('[API] Request failed:', error);
      UI.showError('An error occurred during conversion');
      throw error;
    });
  }
};
