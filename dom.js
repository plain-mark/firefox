// Initialize DOM namespace
window.DOM = {
    addActionButton: async function(element) {
        // Check if button already exists
        if (element.querySelector('.action-button')) return;

        const button = window.UI.createActionButton();

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
    },

    processGreenFrames: function() {
        const elements = window.Detection.findReadmeElements();
        
        elements.forEach(element => {
            if (window.Detection.hasGreenFrame(element) && !element.dataset.processed) {
                element.dataset.processed = true;
                this.addActionButton(element);
            }
        });
    },

    processCopyButton: function(button) {
        // Skip if already processed
        if (button.dataset.processed) return;

        // Mark as processed
        button.dataset.processed = true;

        // Add styling
        window.UI.styleCopyButton(button);

        // Store original click handler
        const originalClick = button.onclick;

        // Override click handler
        button.onclick = async function(e) {
            try {
                const code = window.Detection.extractCode(this);

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
    },

    processCopyButtons: function() {
        // Process buttons based on selectors
        const selectors = window.Detection.getCopyButtonSelectors();
        const copyButtons = document.querySelectorAll(selectors.join(','));

        copyButtons.forEach(button => {
            // Additional check for Claude.ai SVG buttons
            if (window.location.hostname.includes('claude.ai') && button.querySelector('svg')) {
                this.processCopyButton(button);
            } else if (window.Detection.isCopyButton(button)) {
                this.processCopyButton(button);
            }
        });

        // For Claude.ai, also look for buttons with SVG that might have been missed
        if (window.location.hostname.includes('claude.ai')) {
            document.querySelectorAll('button:has(svg)').forEach(button => {
                if (!button.dataset.processed) {
                    this.processCopyButton(button);
                }
            });
        }
    }
};

console.log('DOM module initialized');
