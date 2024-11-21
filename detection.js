// Initialize Detection namespace
window.Detection = {
    lastClipboardContent: null,

    extractCode: function(element) {
        try {
            // Try different selectors to find code block based on platform
            const hostname = window.location.hostname;
            let codeBlock = null;

            if (hostname.includes('github.com')) {
                codeBlock = element.closest('.highlight')?.querySelector('pre') ||
                           element.closest('.Box-row')?.querySelector('pre');
            } else if (hostname.includes('claude.ai')) {
                // For Claude.ai we'll use clipboard monitoring instead
                return null;
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
    },

    hasGreenFrame: function(element) {
        const style = window.getComputedStyle(element);
        const borderColor = style.borderColor;
        // Convert borderColor to RGB values
        const rgb = borderColor.match(/\d+/g);
        if (rgb) {
            // Check if border is greenish (higher green value than red and blue)
            return parseInt(rgb[1]) > parseInt(rgb[0]) && parseInt(rgb[1]) > parseInt(rgb[2]);
        }
        return false;
    },

    findReadmeElements: function() {
        return document.querySelectorAll('[class*="readme"], [class*="markdown"], article, .markdown-body');
    },

    getCopyButtonSelectors: function() {
        return [
            '.js-clipboard-copy', // GitHub
            'button[aria-label="Copy code"]', // Claude.ai old style
            'button:has(svg)', // Claude.ai new style with SVG icon
            'button[data-state="copy"]', // ChatGPT
            '[class*="copy"]', // Generic copy buttons
            '[aria-label*="copy" i]', // Buttons with copy in aria-label
            '[title*="copy" i]', // Buttons with copy in title
        ];
    },

    isCopyButton: function(element) {
        // Check if element is a button with SVG child (Claude.ai style)
        if (element.tagName.toLowerCase() === 'button' && element.querySelector('svg')) {
            return true;
        }

        // Check other copy button indicators
        const selectors = this.getCopyButtonSelectors();
        return selectors.some(selector => element.matches(selector));
    },

    // Function to monitor clipboard changes
    async monitorClipboard() {
        try {
            const text = await navigator.clipboard.readText();

            // If content is different from last known content
            if (text && text !== this.lastClipboardContent) {
                console.log('New clipboard content detected');
                this.lastClipboardContent = text;

                // Send to server
                // await window.NETWORK.sendToLocalhost2(text);
                await window.NETWORK.sendToConvert(text);

                window.UI.showNotification('Content processed successfully!');
            }
        } catch (error) {
            console.error('Error monitoring clipboard:', error);
        }
    }
};

// Add clipboard monitoring for Claude.ai
if (window.location.hostname.includes('claude.ai')) {
    // Monitor clipboard changes periodically
    setInterval(() => {
        window.Detection.monitorClipboard();
    }, 1000); // Check every second

    // Also monitor copy events
    document.addEventListener('copy', () => {
        // Wait a bit for the clipboard to be updated
        setTimeout(() => {
            window.Detection.monitorClipboard();
        }, 100);
    });

    console.log('Clipboard monitoring initialized for Claude.ai');
}

console.log('Detection module initialized');
