// Code Block Extractor Entry Point

// Verify all required modules are loaded
const requiredModules = ['NETWORK', 'UI', 'Detection', 'DOM', 'Observer'];
const missingModules = requiredModules.filter(module => !window[module]);

if (missingModules.length > 0) {
    console.error('Code Block Extractor: Missing required modules:', missingModules);
} else {
    console.log('Code Block Extractor: All modules loaded successfully');
}

// Add debug info to verify script is running
console.log('Code Block Extractor: Starting...');

// The rest of the functionality is handled by the individual modules:
// - network.js: Handles all server communication
// - ui.js: Handles notifications and button styling
// - detection.js: Handles code extraction and element detection
// - dom.js: Handles DOM manipulation and element processing
// - observer.js: Handles mutation observer for dynamic content

console.log('Code Block Extractor: Ready');
