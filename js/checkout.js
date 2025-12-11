// Enhanced Cart Manager with in-memory management
class CartManager {
  constructor() {
    this.cart = [];
    this.metadata = {
      version: '1.0',
      lastUpdated: null,
      itemCount: 0,
      totalItems: 0
    };
    this.maxCartSize = 100; // Maximum items in cart
    this.maxQuantityPerItem = 50; // Maximum quantity per item
    this.loadCart();
    this.validateCart();
  }

  // Load cart from localStorage with error handling
  loadCart() {
    try {
      const stored = localStorage.getItem("cart");
      const storedMeta = localStorage.getItem("cart_metadata");
      
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.cart = parsed;
        }
      }
      
      if (storedMeta) {
        const parsedMeta = JSON.parse(storedMeta);
        this.metadata = { ...this.metadata, ...parsedMeta };
      }
      
      this.updateMetadata();
    } catch (error) {
      console.error("Error loading cart:", error);
      this.cart = [];
      this.saveCart();
    }
  }

  // Save cart to localStorage
  saveCart() {
    try {
      localStorage.setItem("cart", JSON.stringify(this.cart));
      this.updateMetadata();
      localStorage.setItem("cart_metadata", JSON.stringify(this.metadata));
    } catch (error) {
      console.error("Error saving cart:", error);
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        this.handleStorageFull();
      }
    }
  }

  // Update cart metadata
  updateMetadata() {
    this.metadata.lastUpdated = new Date().toISOString();
    this.metadata.itemCount = this.cart.length;
    this.metadata.totalItems = this.cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  }

  // Validate cart data integrity
  validateCart() {
    const originalLength = this.cart.length;
    
    // Remove invalid items
    this.cart = this.cart.filter(item => {
      // Validate item structure
      if (!item || typeof item !== 'object') return false;
      if (!item.key || typeof item.key !== 'string') return false;
      if (!item.size || typeof item.size !== 'string') return false;
      if (!item.qty || typeof item.qty !== 'number' || item.qty < 1) return false;
      
      // Validate quantity limits
      if (item.qty > this.maxQuantityPerItem) {
        item.qty = this.maxQuantityPerItem;
      }
      
      return true;
    });

    // Remove duplicates (keep the one with highest quantity)
    const seen = new Map();
    this.cart = this.cart.filter(item => {
      const key = `${item.key}_${item.size}`;
      if (seen.has(key)) {
        const existing = seen.get(key);
        if (item.qty > existing.qty) {
          seen.set(key, item);
          return true;
        }
        return false;
      }
      seen.set(key, item);
      return true;
    });

    // If cart was modified, save it
    if (this.cart.length !== originalLength) {
      this.saveCart();
    }
  }

  // Get cart statistics
  getStats() {
    return {
      itemCount: this.cart.length,
      totalItems: this.metadata.totalItems,
      lastUpdated: this.metadata.lastUpdated,
      isEmpty: this.cart.length === 0
    };
  }

  // Find item in cart
  findItem(productKey, size) {
    return this.cart.find(item => item.key === productKey && item.size === size);
  }

  // Add item to cart
  addItem(productKey, size, quantity = 1) {
    // Validate inputs
    if (!productKey || !size || quantity < 1) {
      return { success: false, error: 'Invalid input' };
    }

    // Check cart size limit
    if (this.cart.length >= this.maxCartSize) {
      return { success: false, error: 'Cart is full' };
    }

    const existingItem = this.findItem(productKey, size);
    
    if (existingItem) {
      const newQty = existingItem.qty + quantity;
      if (newQty > this.maxQuantityPerItem) {
        existingItem.qty = this.maxQuantityPerItem;
        return { success: true, warning: 'Maximum quantity reached', item: existingItem };
      }
      existingItem.qty = newQty;
    } else {
      this.cart.push({ 
        key: productKey, 
        size, 
        qty: Math.min(quantity, this.maxQuantityPerItem),
        addedAt: new Date().toISOString()
      });
    }

    this.saveCart();
    return { success: true, item: existingItem || this.cart[this.cart.length - 1] };
  }

  // Update item quantity
  updateQuantity(index, newQuantity) {
    if (index < 0 || index >= this.cart.length) {
      return { success: false, error: 'Invalid index' };
    }

    if (newQuantity < 1) {
      return this.removeItem(index);
    }

    if (newQuantity > this.maxQuantityPerItem) {
      newQuantity = this.maxQuantityPerItem;
    }

    this.cart[index].qty = newQuantity;
    this.cart[index].updatedAt = new Date().toISOString();
    this.saveCart();
    return { success: true, item: this.cart[index] };
  }

  // Remove item from cart
  removeItem(index) {
    if (index < 0 || index >= this.cart.length) {
      return { success: false, error: 'Invalid index' };
    }

    const removed = this.cart.splice(index, 1)[0];
    this.saveCart();
    return { success: true, item: removed };
  }

  // Clear entire cart
  clear() {
    this.cart = [];
    this.saveCart();
    return { success: true };
  }

  // Get cart as array
  getCart() {
    return [...this.cart]; // Return copy to prevent direct mutation
  }

  // Handle storage full error
  handleStorageFull() {
    // Try to clear old metadata
    try {
      localStorage.removeItem("cart_metadata");
      this.saveCart();
    } catch (e) {
      // If still failing, clear cart
      this.cart = [];
      localStorage.removeItem("cart");
      console.warn("Storage full, cart cleared");
    }
  }

  // Export cart data (for backup/debugging)
  exportCart() {
    return {
      cart: this.getCart(),
      metadata: { ...this.metadata },
      exportedAt: new Date().toISOString()
    };
  }

  // Import cart data (for restoration)
  importCart(data) {
    try {
      if (data && Array.isArray(data.cart)) {
        this.cart = data.cart;
        this.validateCart();
        this.saveCart();
        return { success: true };
      }
      return { success: false, error: 'Invalid cart data' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Initialize cart manager
const cartManager = new CartManager();
let cart = cartManager.getCart(); // Keep for backward compatibility

// XSS protection - escape HTML
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function addToCart(productKey, size) {
  // Get product name for better feedback
  const productName = i18next.t(`${productKey}.name`, { defaultValue: productKey });
  
  // Find existing item before adding
  const existingItem = cartManager.findItem(productKey, size);
  const wasNew = !existingItem;
  const previousQty = existingItem ? existingItem.qty : 0;
  
  // Add item using cart manager
  const result = cartManager.addItem(productKey, size, 1);
  
  // Update cart reference
  cart = cartManager.getCart();
  
  if (!result.success) {
    // Handle errors
    if (result.error === 'Cart is full') {
      showToast(i18next.t('cart_full', { defaultValue: 'Cart is full. Please remove some items.' }), 3000);
    } else {
      showToast(i18next.t('add_to_cart_error', { defaultValue: 'Failed to add item to cart' }), 2000);
    }
    return;
  }
  
  // Update cart count with animation
  updateCartCount();
  
  // Animate cart button
  animateCartButton();
  
  // Show enhanced toast with product info
  let message;
  if (result.warning) {
    message = `${productName} (${size}) - ${i18next.t('max_quantity_reached', { defaultValue: 'Maximum quantity reached' })}`;
  } else if (wasNew) {
    message = `${i18next.t('added_to_cart', { defaultValue: 'Added to cart' })}: ${productName} (${size})`;
  } else {
    message = `${productName} (${size}) - ${i18next.t('quantity_increased', { defaultValue: 'Quantity increased' })}: ${previousQty + 1}`;
  }
  
  showToast(message, 3000);
  
  // Animate the button that was clicked
  animateAddButton(productKey);
}

function updateCartCount() {
  // Get fresh cart data
  cart = cartManager.getCart();
  const stats = cartManager.getStats();
  const total = stats.totalItems;
  
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    const previousCount = parseInt(cartCountEl.innerText) || 0;
    cartCountEl.innerText = total;
    
    // Hide badge if cart is empty
    if (total === 0) {
      cartCountEl.style.display = 'none';
    } else {
      cartCountEl.style.display = 'flex';
      
      // Animate only if count increased
      if (total > previousCount) {
        cartCountEl.classList.add('bounce');
        setTimeout(() => {
          cartCountEl.classList.remove('bounce');
        }, 500);
      }
    }
  }
  
  // Update product cards to show cart status
  updateProductCardCartStatus();
}

// Update product cards to show cart status
function updateProductCardCartStatus() {
  cart = cartManager.getCart();
  
  // Get all product cards
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    const productKey = card.getAttribute('data-product-key');
    if (!productKey) return;
    
    // Count total quantity of this product (all sizes)
    const productItems = cart.filter(item => item.key === productKey);
    const totalQty = productItems.reduce((sum, item) => sum + (item.qty || 0), 0);
    
    // Find the button and badge elements
    const button = card.querySelector('.add-cart-btn');
    const existingBadge = card.querySelector('.cart-badge-product');
    
    if (totalQty > 0) {
      // Item is in cart - update button and show badge
      if (button) {
        const addText = button.querySelector('.add-text');
        if (addText) {
          addText.textContent = i18next.t('in_cart', { defaultValue: 'In Cart' });
        }
        // Change button style to show it's in cart
        button.classList.remove('gradient-button');
        button.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
      }
      
      // Add or update badge
      if (!existingBadge) {
        const badge = document.createElement('div');
        badge.className = 'cart-badge-product absolute top-2 right-2 bg-green-600 text-white rounded-full px-2 py-1 text-xs font-bold shadow-lg flex items-center justify-center min-w-[24px] z-10';
        badge.textContent = totalQty;
        badge.setAttribute('aria-label', `${totalQty} in cart`);
        card.appendChild(badge);
      } else {
        existingBadge.textContent = totalQty;
      }
    } else {
      // Item not in cart - reset button
      if (button) {
        const addText = button.querySelector('.add-text');
        if (addText) {
          addText.textContent = i18next.t('add_to_cart', { defaultValue: 'Add to Cart' });
        }
        button.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        button.classList.add('gradient-button');
      }
      
      // Remove badge
      if (existingBadge) {
        existingBadge.remove();
      }
    }
  });
}

function openCart() {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.remove("translate-x-full");
  drawer.classList.add("translate-x-0");
  renderCartItems();
  // Update i18n text in cart
  if (typeof updateI18nText === 'function') updateI18nText();
  // Focus management for accessibility
  const closeBtn = drawer.querySelector('button[aria-label="Close Cart"]');
  if (closeBtn) closeBtn.focus();
  // Prevent body scroll when cart is open
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.remove("translate-x-0");
  drawer.classList.add("translate-x-full");
  // Restore body scroll
  document.body.style.overflow = '';
  // Return focus to cart button
  const cartButton = document.getElementById("floatingCart");
  if (cartButton) cartButton.focus();
}

// Close cart when clicking outside or pressing Escape
document.addEventListener('click', function(event) {
  const drawer = document.getElementById("cartDrawer");
  const cartButton = document.getElementById("floatingCart");
  if (drawer && !drawer.contains(event.target) && !cartButton.contains(event.target) && !drawer.classList.contains("translate-x-full")) {
    closeCart();
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const drawer = document.getElementById("cartDrawer");
    if (drawer && !drawer.classList.contains("translate-x-full")) {
      closeCart();
    }
  }
});

function renderCartItems() {
  // Get fresh cart data
  cart = cartManager.getCart();
  const container = document.getElementById("cartItems");
  container.innerHTML = "";
  
  if (cart.length === 0) {
    container.innerHTML = '<li class="text-gray-500 text-center py-8">' + (i18next.t('cart_empty', { defaultValue: 'Your cart is empty' })) + '</li>';
    return;
  }
  cart.forEach((item, index) => {
    const name = i18next.t(`${item.key}.name`, { defaultValue: item.key });
    const li = document.createElement("li");
    li.className = 'bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all border border-yellow-100';
    li.innerHTML = `
      <div class="flex justify-between items-start gap-3">
        <div class="flex-1 min-w-0">
          <span class="block font-semibold text-gray-800 text-sm mb-1">${escapeHtml(name)}</span>
          <span class="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded inline-block">${escapeHtml(item.size)}</span>
        </div>
        <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
          <button onclick="decrementQty(${index})" class="bg-white hover:bg-yellow-100 px-3 py-1 rounded text-sm font-bold text-gray-700 transition-all shadow-sm hover:shadow" aria-label="Decrease quantity">−</button>
          <span class="min-w-[32px] text-center font-semibold text-gray-800">${item.qty}</span>
          <button onclick="incrementQty(${index})" class="bg-white hover:bg-yellow-100 px-3 py-1 rounded text-sm font-bold text-gray-700 transition-all shadow-sm hover:shadow" aria-label="Increase quantity">+</button>
        </div>
        <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all group relative" aria-label="Remove item" title="${i18next.t('remove_item', { defaultValue: 'Remove item' })}">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    `;
    container.appendChild(li);
  });
  const stats = cartManager.getStats();
  const summary = document.createElement("div");
  summary.className = "mt-4 pt-4 border-t-2 border-yellow-200 bg-white rounded-lg p-3 shadow-sm";
  summary.innerHTML = `
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="font-bold text-gray-800">${i18next.t('total_items', { defaultValue: 'Total items' })}:</span>
        <span class="text-xl font-bold text-yellow-700">${stats.totalItems}</span>
      </div>
      <div class="flex justify-between items-center text-xs text-gray-500">
        <span>${i18next.t('unique_items', { defaultValue: 'Unique items' })}:</span>
        <span>${stats.itemCount}</span>
      </div>
    </div>
  `;
  container.appendChild(summary);
}

function checkoutWhatsApp() {
  // Get fresh cart data
  cart = cartManager.getCart();
  const stats = cartManager.getStats();
  
  if (stats.isEmpty) {
    showToast(i18next.t('cart_empty', { defaultValue: 'Your cart is empty' }));
    return;
  }

  let message = i18next.t('whatsapp_order_prefix', { defaultValue: 'Hi, I would like to order:' }) + "\n\n";
  
  cart.forEach((item, index) => {
    const name = i18next.t(`${item.key}.name`, { defaultValue: item.key });
    message += `${index + 1}. ${name} (${item.size}) × ${item.qty}\n`;
  });
  
  message += `\n${i18next.t('total_items', { defaultValue: 'Total items' })}: ${stats.totalItems}`;
  message += `\n${i18next.t('unique_items', { defaultValue: 'Unique items' })}: ${stats.itemCount}`;
  message += "\n\n" + i18next.t('whatsapp_order_suffix', { defaultValue: 'Please confirm availability.' });

  const phone = "919787781569";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  
  // Track checkout event (optional analytics)
  if (typeof console !== 'undefined' && console.log) {
    console.log('Checkout initiated', stats);
  }
}

// Print cart functionality
function printCart() {
  cart = cartManager.getCart();
  const stats = cartManager.getStats();
  
  if (stats.isEmpty) {
    showToast(i18next.t('cart_empty', { defaultValue: 'Your cart is empty' }));
    return;
  }

  const printWindow = window.open('', '_blank');
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Preethi Masala - Cart</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #92400e; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #fef3c7; }
        .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <h1>Preethi Masala - Shopping Cart</h1>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Size</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${cart.map((item, index) => {
            const name = i18next.t(`${item.key}.name`, { defaultValue: item.key });
            return `
              <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(name)}</td>
                <td>${escapeHtml(item.size)}</td>
                <td>${item.qty}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      <div class="total">
        <p><strong>Total Items:</strong> ${stats.totalItems}</p>
        <p><strong>Unique Items:</strong> ${stats.itemCount}</p>
      </div>
      <p><strong>Contact:</strong> preethimasala@gmail.com | 63693 57434</p>
      <button onclick="window.print()">Print</button>
    </body>
    </html>
  `;
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}

// Share cart functionality
function shareCart() {
  cart = cartManager.getCart();
  const stats = cartManager.getStats();
  
  if (stats.isEmpty) {
    showToast(i18next.t('cart_empty', { defaultValue: 'Your cart is empty' }));
    return;
  }

  let message = i18next.t('share_cart_prefix', { defaultValue: 'Check out my Preethi Masala cart:' }) + "\n\n";
  
  cart.forEach((item, index) => {
    const name = i18next.t(`${item.key}.name`, { defaultValue: item.key });
    message += `${index + 1}. ${name} (${item.size}) × ${item.qty}\n`;
  });
  
  message += `\n${i18next.t('total_items', { defaultValue: 'Total items' })}: ${stats.totalItems}`;
  message += `\n\n${i18next.t('share_cart_suffix', { defaultValue: 'Order at: yourdomain.github.io' })}`;

  if (navigator.share) {
    navigator.share({
      title: 'Preethi Masala Cart',
      text: message,
      url: window.location.href
    }).catch(err => {
      console.log('Error sharing:', err);
      copyToClipboard(message);
    });
  } else {
    copyToClipboard(message);
  }
}

// Copy to clipboard
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(i18next.t('copied_to_clipboard', { defaultValue: 'Cart copied to clipboard!' }), 2000);
    });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast(i18next.t('copied_to_clipboard', { defaultValue: 'Cart copied to clipboard!' }), 2000);
  }
}

// Initialize cart count on load and sync cart reference
cart = cartManager.getCart();
updateCartCount();

// Sync cart on storage events (for multi-tab support)
window.addEventListener('storage', function(e) {
  if (e.key === 'cart' || e.key === 'cart_metadata') {
    cartManager.loadCart();
    cart = cartManager.getCart();
    updateCartCount();
    // Re-render if cart drawer is open
    const drawer = document.getElementById("cartDrawer");
    if (drawer && !drawer.classList.contains("translate-x-full")) {
      renderCartItems();
    }
  }
});

function removeFromCart(index, skipAnimation = false) {
  // Get item name before removal for toast message
  cart = cartManager.getCart();
  const itemToRemove = cart[index];
  const itemName = itemToRemove ? i18next.t(`${itemToRemove.key}.name`, { defaultValue: itemToRemove.key }) : '';
  
  // Find the cart item element
  const cartItems = document.querySelectorAll('#cartItems li');
  const itemElement = cartItems[index];
  
  if (itemElement && !skipAnimation) {
    // Add removal animation
    itemElement.classList.add('cart-item-removing');
    
    // Wait for animation to complete before removing
    setTimeout(() => {
      const result = cartManager.removeItem(index);
      cart = cartManager.getCart();
      
      if (result.success) {
        updateCartCount();
        renderCartItems();
        showToast(`${itemName} ${i18next.t('item_removed', { defaultValue: 'removed from cart' })}`, 2000);
      }
    }, 300); // Match animation duration
  } else {
    // Immediate removal (for decrement when qty reaches 0)
    const result = cartManager.removeItem(index);
    cart = cartManager.getCart();
    
    if (result.success) {
      updateCartCount();
      renderCartItems();
      if (itemName) {
        showToast(`${itemName} ${i18next.t('item_removed', { defaultValue: 'removed from cart' })}`, 2000);
      }
    }
  }
}

function clearCart() {
  if (confirm(i18next.t('clear_cart_confirm', { defaultValue: 'Are you sure you want to clear your cart?' }))) {
    const result = cartManager.clear();
    cart = cartManager.getCart();
    
    if (result.success) {
      updateCartCount();
      renderCartItems();
      showToast(i18next.t('cart_cleared', { defaultValue: 'Cart cleared' }), 2000);
    }
  }
}

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

// Animate cart button when item is added
function animateCartButton() {
  const cartButton = document.getElementById("floatingCart");
  if (cartButton) {
    // Add pulse animation
    cartButton.classList.add("animate-pulse");
    cartButton.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
      cartButton.classList.remove("animate-pulse");
      cartButton.style.transform = 'scale(1)';
    }, 600);
  }
}

// Animate the add to cart button that was clicked
function animateAddButton(productKey) {
  // Find the button by looking for the product card or by data attribute
  const button = document.querySelector(`button[data-product-key="${productKey}"]`) || 
                 document.querySelector(`[data-product-key="${productKey}"] button.add-cart-btn`);
  
  if (button) {
    // Store original classes and content
    const originalClasses = button.className;
    const addIcon = button.querySelector('.add-icon');
    const addText = button.querySelector('.add-text');
    
    if (addIcon && addText) {
      // Store original content
      const originalIcon = addIcon.outerHTML;
      const originalText = addText.textContent;
      
      // Change to success state
      addIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
      addText.textContent = i18next.t('added', { defaultValue: 'Added!' });
      
      button.classList.add('add-button-success', 'bg-green-600');
      button.classList.remove('gradient-button');
      button.style.pointerEvents = 'none';
      
      // Reset after animation
      setTimeout(() => {
        addIcon.outerHTML = originalIcon;
        addText.textContent = originalText;
        button.className = originalClasses;
        button.style.pointerEvents = '';
      }, 1500);
    } else {
      // Fallback for buttons without the new structure
      const originalContent = button.innerHTML;
      button.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        ${escapeHtml(i18next.t('added', { defaultValue: 'Added!' }))}
      `;
      button.classList.add('add-button-success', 'bg-green-600');
      button.classList.remove('gradient-button');
      button.disabled = true;
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.className = originalClasses;
        button.disabled = false;
      }, 1500);
    }
  }
}

function incrementQty(index) {
  cart = cartManager.getCart();
  if (index < 0 || index >= cart.length) return;
  
  const currentQty = cart[index].qty;
  const result = cartManager.updateQuantity(index, currentQty + 1);
  cart = cartManager.getCart();
  
  if (result.success) {
    if (result.warning) {
      showToast(i18next.t('max_quantity_reached', { defaultValue: 'Maximum quantity reached' }), 2000);
    }
    updateCartCount();
    renderCartItems();
  }
}

function decrementQty(index) {
  cart = cartManager.getCart();
  if (index < 0 || index >= cart.length) return;
  
  const currentQty = cart[index].qty;
  if (currentQty > 1) {
    const result = cartManager.updateQuantity(index, currentQty - 1);
    cart = cartManager.getCart();
    if (result.success) {
      updateCartCount();
      renderCartItems();
    }
  } else {
    // When quantity reaches 0, remove with animation
    removeFromCart(index, false);
  }
}
