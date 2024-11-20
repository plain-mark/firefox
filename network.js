// Initialize NETWORK object immediately
window.NETWORK = {};

// Network handling functionality
(function() {
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
    },

    // Function to send code to localhost with retry logic
    sendToLocalhost2: async function(code, retries = 3) {
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

      for (let attempt = 1; attempt <= retries; attempt++) {
          try {
              const response = await fetch('http://localhost:5000/code-blocks', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      blocks: [{
                          code: code,
                          language: 'unknown',
                          platform: window.location.hostname,
                          url: window.location.href,
                          timestamp: new Date().toISOString(),
                          title: document.title
                      }]
                  })
              });

              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              console.log('Code sent successfully:', data);
              window.UI?.showNotification?.('Code sent successfully!', false);
              return;
          } catch (error) {
              console.error(`Attempt ${attempt} failed:`, error);

              if (attempt === retries) {
                  window.UI?.showNotification?.(`Failed to send code after ${retries} attempts`, true);
                  throw error;
              }

              // Wait before retrying (exponential backoff)
              await delay(Math.pow(2, attempt) * 1000);
          }
      }
    },

    // Function to send code to convert endpoint with retry logic
    sendToConvert: async function(code, retries = 3) {
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

      for (let attempt = 1; attempt <= retries; attempt++) {
          try {
              // Create form data
              const formData = new FormData();
              formData.append('markdown_content', code);

              const response = await fetch('http://localhost:5000/convert', {
                  method: 'POST',
                  body: formData
              });

              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              console.log('Code sent to convert endpoint successfully:', data);
              window.UI?.showNotification?.('Code sent to converter successfully!', false);
              return;
          } catch (error) {
              console.error(`Attempt ${attempt} failed for convert endpoint:`, error);

              if (attempt === retries) {
                  window.UI?.showNotification?.(`Failed to send code to converter after ${retries} attempts`, true);
                  throw error;
              }

              // Wait before retrying (exponential backoff)
              await delay(Math.pow(2, attempt) * 1000);
          }
      }
    }
  };

  console.log('Network module initialized');
})();
