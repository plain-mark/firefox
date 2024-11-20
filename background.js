// Listen for installation
browser.runtime.onInstalled.addListener(() => {
  console.log('Code Block Extractor installed');
});

// Listen for messages from content script
browser.runtime.onMessage.addListener((request, sender) => {
  if (request.type === 'CODE_BLOCK') {
    // Handle code block data
    console.log('Code block received:', request.data);
    // Send to localhost if needed
    return fetch('http://localhost:5000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.data)
    }).then(response => {
      return { status: 'success' };
    }).catch(error => {
      console.error('Error:', error);
      return { status: 'error', message: error.message };
    });
  }
  return Promise.resolve(null);
});
