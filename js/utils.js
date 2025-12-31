// Shared Utility Functions

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML string
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds (default: 2000)
 */
function showToast(message, duration = 2000) {
  const toast = document.getElementById("toast");
  if (toast) {
    // Create toast content with icon
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-medium">${escapeHtml(message)}</span>
      </div>
    `;
    toast.classList.remove("hidden", "opacity-0");
    toast.classList.add("opacity-100");
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.classList.add("hidden");
      }, 300);
    }, duration);
  }
}

/**
 * Handle errors with consistent logging and user feedback
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @param {boolean} silent - If true, don't show toast (default: false)
 */
function handleError(error, context, silent = false) {
  console.error(`Error in ${context}:`, error);
  if (!silent) {
    const errorMessage = typeof i18next !== 'undefined' && i18next.isInitialized
      ? i18next.t('error_occurred', { defaultValue: 'An error occurred. Please try again.' })
      : 'An error occurred. Please try again.';
    showToast(errorMessage, 3000);
  }
}

/**
 * Check if device is online
 * @returns {boolean} True if online
 */
function isOnline() {
  return navigator.onLine !== false;
}

/**
 * Show offline/online status to user
 */
function handleOnlineStatus() {
  if (!isOnline()) {
    showToast(
      typeof i18next !== 'undefined' && i18next.isInitialized
        ? i18next.t('offline_mode', { defaultValue: 'You are offline. Some features may not work.' })
        : 'You are offline. Some features may not work.',
      4000
    );
  }
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

