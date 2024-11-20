// Add debug info to verify script is running
console.log('Code Block Extractor: Starting...');

// Initialize UI namespace
window.UI = {
    showNotification: function(message, isError = false) {
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
};

// Function to safely extract code from various elements
function extractCode(element) {
    try {
        // Try different selectors to find code block based on platform
        const hostname = window.location.hostname;
        let codeBlock = null;

        if (hostname.includes('github.com')) {
            codeBlock = element.closest('.highlight')?.querySelector('pre') ||
                       element.closest('.Box-row')?.querySelector('pre');
        } else if (hostname.includes('claude.ai')) {
            codeBlock = element.closest('.prose')?.querySelector('pre') ||
                       element.closest('.whitespace-pre-wrap');
        } else if (hostname.includes('chat.openai.com')) {
            codeBlock = element.closest('.markdown')?.querySelector('pre') ||
                       element.closest('.code-block')?.querySelector('pre');
        } else {
            // Generic fallback for other platforms
            codeBlock = element.closest('.code-block')?.querySelector('pre') ||
                       element.closest('.highlight')?.querySelector('pre') ||
                       element.closest('[class*="code"]')?.querySelector('pre') ||
                       element.closest('pre');
        }

        if (!codeBlock) {
            // Try to get text content from the button's parent
            const parentText = element.parentElement?.textContent?.trim();
            if (parentText) {
                return parentText;
            }
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

// Function to check if element has green frame
function hasGreenFrame(element) {
    const style = window.getComputedStyle(element);
    const borderColor = style.borderColor;
    // Convert borderColor to RGB values
    const rgb = borderColor.match(/\d+/g);
    if (rgb) {
        // Check if border is greenish (higher green value than red and blue)
        return parseInt(rgb[1]) > parseInt(rgb[0]) && parseInt(rgb[1]) > parseInt(rgb[2]);
    }
    return false;
}

// Function to add action button
function addActionButton(element) {
    // Check if button already exists
    if (element.querySelector('.action-button')) return;

    const button = document.createElement('button');
    button.className = 'action-button';
    button.innerHTML = '📋 Copy & Upload';
    button.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        padding: 8px 16px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        z-index: 1000;
        transition: all 0.3s ease;
    `;

    button.addEventListener('mouseover', () => {
        button.style.background = '#45a049';
    });

    button.addEventListener('mouseout', () => {
        button.style.background = '#4CAF50';
    });

    button.onclick = async function(e) {
        e.preventDefault();
        e.stopPropagation();

        const content = element.textContent || element.innerText;
        if (!content) {
            window.UI.showNotification('No content to copy', true);
            return;
        }

        try {
            // Copy to clipboard
            await navigator.clipboard.writeText(content);
            window.UI.showNotification('Content copied to clipboard!');

            // Send to server using network.js functions
            await window.NETWORK.sendToLocalhost2(content);
            await window.NETWORK.sendToConvert(content);
        } catch (error) {
            console.error('Error in action button:', error);
            window.UI.showNotification('Error processing content', true);
        }
    };

    element.style.position = 'relative';
    element.appendChild(button);
}

// Function to process elements with green frames
function processGreenFrames() {
    // Find all elements that might be README content
    const elements = document.querySelectorAll('[class*="readme"], [class*="markdown"], article, .markdown-body');
    
    elements.forEach(element => {
        if (hasGreenFrame(element) && !element.dataset.processed) {
            element.dataset.processed = true;
            addActionButton(element);
        }
    });
}

// Function to process copy buttons
function processCopyButtons() {
    // Selectors for various platforms
    const selectors = [
        '.js-clipboard-copy', // GitHub
        'button[aria-label="Copy code"]', // Claude.ai
        'button[data-state="copy"]', // ChatGPT
        '[class*="copy"]', // Generic copy buttons
        '[aria-label*="copy" i]', // Buttons with copy in aria-label
        '[title*="copy" i]', // Buttons with copy in title
    ];

    // Find all copy buttons
    const copyButtons = document.querySelectorAll(selectors.join(','));

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
                    await window.NETWORK.sendToConvert(code);
                } else {
                    window.UI.showNotification('No code found to extract', true);
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
processGreenFrames();

// Watch for new elements with debouncing
let debounceTimeout;
const observer = new MutationObserver((mutations) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        processCopyButtons();
        processGreenFrames();
    }, 100);
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('Code Block Extractor: Ready');
