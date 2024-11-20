// Add debug info to verify script is running
console.log('Code Block Extractor: Starting...');

// Function to send code to localhost with retry logic
async function sendToLocalhost2(code, retries = 3) {
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
                        platform: 'github',
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
            showNotification('Code sent successfully!', false);
            return;
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);

            if (attempt === retries) {
                showNotification(`Failed to send code after ${retries} attempts`, true);
                throw error;
            }

            // Wait before retrying (exponential backoff)
            await delay(Math.pow(2, attempt) * 1000);
        }
    }
}

// Function to send code to convert endpoint with retry logic
async function sendToLocalhost(code, retries = 3) {
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
            showNotification('Code sent to converter successfully!', false);
            return;
        } catch (error) {
            console.error(`Attempt ${attempt} failed for convert endpoint:`, error);

            if (attempt === retries) {
                showNotification(`Failed to send code to converter after ${retries} attempts`, true);
                throw error;
            }

            // Wait before retrying (exponential backoff)
            await delay(Math.pow(2, attempt) * 1000);
        }
    }
}

// Function to show notification with improved styling
function showNotification(message, isError = false) {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.code-extractor-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'code-extractor-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${isError ? '❌' : '✅'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${isError ? '#ff4444' : '#4CAF50'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: opacity 0.3s ease-in-out;
        display: flex;
        align-items: center;
        max-width: 400px;
        word-break: break-word;
    `;

    document.body.appendChild(notification);

    // Fade out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Function to safely extract code from various elements
function extractCode(element) {
    try {
        // Try different selectors to find code block
        const codeBlock = element.closest('.highlight')?.querySelector('pre') ||
                         element.closest('.Box-row')?.querySelector('pre') ||
                         element.parentElement.querySelector('pre');

        if (!codeBlock) {
            console.warn('No code block found');
            return null;
        }

        // Clean and normalize the code
        const code = codeBlock.textContent
            .replace(/\u200B/g, '') // Remove zero-width spaces
            .trim();

        if (!code) {
            console.warn('Empty code block found');
            return null;
        }

        return code;
    } catch (error) {
        console.error('Error extracting code:', error);
        return null;
    }
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

        // Add highlight with smoother animation
        button.style.cssText = `
            border: 2px solid #4CAF50 !important;
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.5) !important;
            position: relative;
            z-index: 1000;
            transition: all 0.3s ease-in-out !important;
        `;

        // Add hover effect
        button.addEventListener('mouseover', () => {
            button.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.8) !important';
        });

        button.addEventListener('mouseout', () => {
            button.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.5) !important';
        });

        // Store original click handler
        const originalClick = button.onclick;

        // Override click handler
        button.onclick = async function(e) {
            try {
                const code = extractCode(this);

                if (code) {
                    console.log('Captured code:', code.substring(0, 100) + '...');
                    // Send to both endpoints
                    await Promise.all([
                        sendToLocalhost(code),
                        // sendToLocalhost2(code)
                    ]);
                } else {
                    showNotification('No code found to extract', true);
                }
            } catch (error) {
                console.error('Error in click handler:', error);
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

// Watch for new copy buttons with debouncing
let debounceTimeout;
const observer = new MutationObserver((mutations) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        processCopyButtons();
    }, 100);
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('Code Block Extractor: Ready');
