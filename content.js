// Add debug info to verify script is running
console.log('Code Block Extractor: Starting...');

// Function to send code to localhost
function sendToLocalhost(code) {
    fetch('http://localhost:5000/convert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            code: code,
            source: window.location.href,
            timestamp: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Code sent successfully:', data);
        showNotification('Code sent successfully!', false);
    })
    .catch(error => {
        console.error('Error sending code:', error);
        showNotification('Error sending code!', true);
    });
}

// Function to show notification
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background: ${isError ? '#ff4444' : '#4CAF50'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// Function to process copy buttons
function processCopyButtons() {
    // Find all copy buttons
    const copyButtons = document.querySelectorAll('.js-clipboard-copy');
    
    copyButtons.forEach(button => {
        // Skip if already processed
        if (button.dataset.processed) return;
        
        // Mark as processed
        button.dataset.processed = true;
        
        // Add highlight
        button.style.cssText = `
            border: 2px solid #4CAF50 !important;
            box-shadow: 0 0 5px #4CAF50 !important;
            position: relative;
            z-index: 1000;
        `;
        
        // Store original click handler
        const originalClick = button.onclick;
        
        // Override click handler
        button.onclick = function(e) {
            // Get code block
            const codeBlock = this.closest('.highlight')?.querySelector('pre') ||
                            this.closest('.Box-row')?.querySelector('pre') ||
                            this.parentElement.querySelector('pre');
            
            if (codeBlock) {
                const code = codeBlock.textContent;
                console.log('Captured code:', code.substring(0, 100) + '...');
                sendToLocalhost(code);
            }
            
            // Call original handler
            if (originalClick) {
                originalClick.call(this, e);
            }
        };
    });
}

// Initial processing
processCopyButtons();

// Watch for new copy buttons
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            processCopyButtons();
        }
    });
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('Code Block Extractor: Ready');
