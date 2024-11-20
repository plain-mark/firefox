// Code block extraction functionality
window.CODE_BLOCKS = {
  extractCodeBlocks: function() {
    const platform = PLATFORM.detectPlatform();
    console.log('[Extract] Detected platform:', platform);
    
    let selectors = CONFIG.PLATFORM_SELECTORS[platform] || CONFIG.PLATFORM_SELECTORS.generic;
    console.log('[Extract] Using selectors:', selectors);

    let codeBlocks = [];
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const code = element.textContent.trim();
        if (code.length >= CONFIG.MIN_CODE_LENGTH) {
          const language = this.detectLanguage(element);
          codeBlocks.push({
            code: code,
            language: language,
            selector: selector
          });
        }
      });
    });

    console.log('[Extract] Found code blocks:', codeBlocks.length);
    return codeBlocks;
  },

  detectLanguage: function(element) {
    // Try to get language from class
    const classes = Array.from(element.classList);
    for (const cls of classes) {
      const match = cls.match(/language-(\w+)/);
      if (match && CONFIG.SUPPORTED_LANGUAGES.includes(match[1])) {
        return match[1];
      }
    }

    // Try parent element classes
    const parentClasses = Array.from(element.parentElement.classList);
    for (const cls of parentClasses) {
      const match = cls.match(/language-(\w+)/);
      if (match && CONFIG.SUPPORTED_LANGUAGES.includes(match[1])) {
        return match[1];
      }
    }

    return 'text';
  }
};
