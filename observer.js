// Initialize Observer namespace
window.Observer = {
    debounceTimeout: null,

    init: function() {
        // Initial processing
        window.DOM.processCopyButtons();
        window.DOM.processGreenFrames();

        // Create and start the observer
        const observer = new MutationObserver((mutations) => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                window.DOM.processCopyButtons();
                window.DOM.processGreenFrames();
            }, 100);
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('Mutation observer started');
    }
};

// Initialize observer when the module loads
window.Observer.init();

console.log('Observer module initialized');
