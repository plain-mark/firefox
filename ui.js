// UI handling functionality
window.UI = {
  showNotification: function(message, isError = false) {
    const existingNotification = document.querySelector('.code-extractor-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'code-extractor-notification';
    notification.textContent = message;
    notification.style.cssText = CONFIG.NOTIFICATION_STYLES.base;
    notification.style.backgroundColor = isError ? 
      CONFIG.NOTIFICATION_STYLES.error : 
      CONFIG.NOTIFICATION_STYLES.success;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  },

  showError: function(message) {
    this.showNotification(message, true);
  },

  displayChanges: function(data) {
    if (data && data.message) {
      this.showNotification(data.message);
    }
  }
};
