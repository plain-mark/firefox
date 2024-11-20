// Listen for installation
browser.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

// Listen for messages from content script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'COPY_CODE') {
        console.log('Received code:', request.code);
        
        // Forward to localhost
        fetch('http://localhost:5000/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: request.code,
                source: request.source,
                timestamp: new Date().toISOString()
            })
        })
        .then(response => response.json())
        .then(data => {
            sendResponse({ status: 'success', data });
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({ status: 'error', message: error.message });
        });
        
        return true; // Will respond asynchronously
    }
});

// Inject content script when visiting GitHub
browser.webNavigation.onCompleted.addListener(
    (details) => {
        browser.tabs.executeScript(details.tabId, {
            code: `
                console.log('Injecting code block extractor');
                
                // Function to highlight copy buttons
                function highlightCopyButtons() {
                    const copyButtons = document.querySelectorAll('button[data-copy-feedback], .js-clipboard-copy');
                    copyButtons.forEach(button => {
                        button.style.border = '2px solid #4CAF50';
                        button.style.boxShadow = '0 0 5px #4CAF50';
                        
                        // Add click listener
                        button.addEventListener('click', function() {
                            const codeBlock = this.closest('.Box-row')?.querySelector('pre') || 
                                            this.closest('.highlight')?.querySelector('pre');
                            
                            if (codeBlock) {
                                const code = codeBlock.textContent;
                                browser.runtime.sendMessage({
                                    type: 'COPY_CODE',
                                    code: code,
                                    source: window.location.href
                                });
                            }
                        });
                    });
                }
                
                // Run immediately and observe for changes
                highlightCopyButtons();
                new MutationObserver(() => highlightCopyButtons())
                    .observe(document.body, { childList: true, subtree: true });
            `
        });
    },
    { url: [{ hostContains: 'github.com' }] }
);
