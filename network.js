import { API_ENDPOINTS } from './config.js';
import { showError } from './ui.js';
import { displayChanges } from './ui.js';

export function sendToLocalhost(codeBlocks) {
  if (!codeBlocks || codeBlocks.length === 0) {
    console.log('[API] No code blocks to send');
    return;
  }

  console.log('[API] Preparing to send code blocks:', codeBlocks);
  const formData = new FormData();
  const payload = {
    blocks: codeBlocks,
    metadata: {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
  };
  
  console.log('[API] Request payload:', payload);
  formData.append('blocks', JSON.stringify(payload));

  console.log('[API] Sending request to:', API_ENDPOINTS.convert);
  return fetch(API_ENDPOINTS.convert, {
    method: 'POST',
    body: formData
  })
  .then(response => {
    console.log('[API] Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('[API] Received response data:', data);
    if (data.error) {
      console.error('[API] Server reported error:', data.error);
      showError(data.error);
    } else {
      console.log('[API] Processing successful response');
      const errorDiv = document.getElementById('error-message');
      if (errorDiv) errorDiv.style.display = 'none';
      displayChanges(data);
    }
    return data;
  })
  .catch(error => {
    console.error('[API] Request failed:', error);
    showError('An error occurred during conversion');
    throw error;
  });
}
