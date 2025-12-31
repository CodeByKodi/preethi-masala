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
 */
function handleError(error, context) {
  console.error(`Error in ${context}:`, error);
  const errorMessage = typeof i18next !== 'undefined' && i18next.isInitialized
    ? i18next.t('error_occurred', { defaultValue: 'An error occurred. Please try again.' })
    : 'An error occurred. Please try again.';
  showToast(errorMessage, 3000);
}

