import { NOTIFICATION_STYLES } from './config.js';
import { sendToLocalhost } from './network.js';

export function createRunButton(codeBlock) {
  console.log('[UI] Creating run button for code block');
  const button = document.createElement('button');
  button.textContent = '[run]';
  button.className = 'code-block-run-button';
  button.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 4px 8px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    opacity: 0.8;
    transition: opacity 0.3s;
  `;
  
  button.addEventListener('mouseover', () => {
    button.style.opacity = '1';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.opacity = '0.8';
  });
  
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[UI] Run button clicked for code block:', codeBlock);
    try {
      await sendToLocalhost([codeBlock]);
      console.log('[UI] Code block sent successfully');
      showNotification('Code block sent successfully');
    } catch (error) {
      console.error('[UI] Error sending code block:', error);
      showError('Failed to send code block');
    }
  });

  return button;
}

export function addRunButtonToElement(element, codeBlock) {
  console.log('[UI] Adding run button to element');
  const container = element.closest('pre') || element.parentElement;
  if (!container) {
    console.log('[UI] No suitable container found for run button');
    return;
  }

  if (container.style.position !== 'relative') {
    container.style.position = 'relative';
  }

  const existingButton = container.querySelector('.code-block-run-button');
  if (existingButton) {
    console.log('[UI] Run button already exists for this element');
    return;
  }

  const button = createRunButton(codeBlock);
  container.appendChild(button);
  console.log('[UI] Run button added successfully');
}

export function showError(message, doc = document) {
  console.error('[Error] Showing error message:', message);
  const errorDiv = doc.getElementById('error-message') || createErrorDiv(doc);
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  return errorDiv;
}

export function createErrorDiv(doc = document) {
  console.log('[UI] Creating error div element');
  const div = doc.createElement('div');
  div.id = 'error-message';
  div.style.cssText = `
    ${NOTIFICATION_STYLES.base}
    background-color: ${NOTIFICATION_STYLES.error};
  `;
  doc.body.appendChild(div);
  return div;
}

export function displayChanges(data) {
  console.log('[UI] Displaying changes:', data);
  const resultDiv = document.getElementById('result');
  if (resultDiv) {
    resultDiv.style.display = 'block';
    const resultContent = resultDiv.querySelector('.content');
    if (resultContent) {
      resultContent.textContent = JSON.stringify(data, null, 2);
    }
  }
}

export function showNotification(message, isError = false, doc = document) {
  console.log(`[UI] Showing notification: ${message} (${isError ? 'error' : 'success'})`);
  const notification = doc.createElement('div');
  notification.style.cssText = `
    ${NOTIFICATION_STYLES.base}
    background-color: ${isError ? NOTIFICATION_STYLES.error : NOTIFICATION_STYLES.success};
  `;
  notification.textContent = message;
  doc.body.appendChild(notification);
  setTimeout(() => {
    console.log('[UI] Removing notification');
    notification.remove();
  }, 3000);
  return notification;
}
