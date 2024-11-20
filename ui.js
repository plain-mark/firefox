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
    },

    createActionButton: function() {
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

        return button;
    },

    styleCopyButton: function(button) {
        // Check if it's a Claude.ai button with SVG
        const isClaudeButton = window.location.hostname.includes('claude.ai') && button.querySelector('svg');
        
        if (isClaudeButton) {
            // Style for Claude.ai buttons
            button.style.cssText = `
                border: 2px solid #4CAF50 !important;
                box-shadow: 0 0 5px rgba(76, 175, 80, 0.5) !important;
                background-color: rgba(76, 175, 80, 0.1) !important;
                position: relative;
                z-index: 1000;
                transition: all 0.3s ease-in-out !important;
                padding: 4px !important;
                border-radius: 4px !important;
            `;

            // Style the SVG icon
            const svg = button.querySelector('svg');
            if (svg) {
                svg.style.cssText = `
                    color: #4CAF50 !important;
                    width: 20px !important;
                    height: 20px !important;
                `;
            }

            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = 'rgba(76, 175, 80, 0.2) !important';
                button.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.8) !important';
            });

            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = 'rgba(76, 175, 80, 0.1) !important';
                button.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.5) !important';
            });
        } else {
            // Style for other platforms
            button.style.cssText = `
                border: 2px solid #4CAF50 !important;
                box-shadow: 0 0 5px rgba(76, 175, 80, 0.5) !important;
                position: relative;
                z-index: 1000;
                transition: all 0.3s ease-in-out !important;
            `;

            button.addEventListener('mouseover', () => {
                button.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.8) !important';
            });

            button.addEventListener('mouseout', () => {
                button.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.5) !important';
            });
        }
    }
};

console.log('UI module initialized');
