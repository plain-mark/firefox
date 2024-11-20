// Add CORS headers to allow communication with localhost
browser.webRequest.onHeadersReceived.addListener(
  function(details) {
    const headers = details.responseHeaders || [];
    headers.push({
      name: 'Access-Control-Allow-Origin',
      value: '*'
    });
    headers.push({
      name: 'Access-Control-Allow-Methods',
      value: 'GET, POST, OPTIONS'
    });
    headers.push({
      name: 'Access-Control-Allow-Headers',
      value: 'Content-Type'
    });
    return {responseHeaders: headers};
  },
  {
    urls: ['http://localhost:5000/*'],
    types: ['xmlhttprequest']
  },
  ['blocking', 'responseHeaders']
);

// Handle OPTIONS preflight requests
browser.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    const headers = details.requestHeaders || [];
    headers.push({
      name: 'Origin',
      value: 'moz-extension://' + browser.runtime.id
    });
    return {requestHeaders: headers};
  },
  {
    urls: ['http://localhost:5000/*'],
    types: ['xmlhttprequest']
  },
  ['blocking', 'requestHeaders']
);
