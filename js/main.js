function updateI18nText() {
  // Check if i18next is initialized
  if (typeof i18next === 'undefined' || !i18next.isInitialized) {
    console.warn('i18next not initialized yet, skipping updateI18nText');
    return;
  }
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      const translation = i18next.t(key);
      // Only update if translation exists and is different
      if (translation && translation !== key) {
        el.innerHTML = translation;
      }
    }
  });
  
  // Update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      const translation = i18next.t(key, { defaultValue: el.placeholder });
      if (translation) {
        el.placeholder = translation;
      }
    }
  });
  
  // Update select option texts
  document.querySelectorAll("select option[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      const translation = i18next.t(key, { defaultValue: el.textContent });
      if (translation && translation !== key) {
        el.textContent = translation;
      }
    }
  });
}

const savedLang = localStorage.getItem('lang') || 'en';

i18next
  .use(i18nextHttpBackend)
  .init({
    lng: savedLang,
    fallbackLng: 'en',
    backend: {
      loadPath: "./lang/{{lng}}.json",
    },
    debug: false
  }, function (err, t) {
    if (err) {
      console.error("i18next initialization error:", err);
    } else {
      // Update i18n text after initialization
      updateI18nText();
      // Load products
      loadProducts();
    }
  });

// Note: Language switcher event listener is handled in index.html to avoid duplicates

// Store all products for search/filter
let allProducts = [];
let currentCategory = 'all';
let currentSort = 'default';
let currentProductData = null; // For product detail modal

// Note: escapeHtml is now in utils.js
// If utils.js is not loaded, provide fallback
if (typeof escapeHtml === 'undefined') {
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

async function loadProducts() {
  // Don't call updateI18nText here - it's called separately after language change
  // This prevents double updates and ensures proper timing
  
  // Show loading indicator
  const loadingIndicator = document.getElementById('loadingIndicator');
  const productGrid = document.getElementById('productGrid');
  const noProducts = document.getElementById('noProducts');
  
  if (loadingIndicator) loadingIndicator.classList.remove('hidden');
  if (productGrid) productGrid.innerHTML = '';
  if (noProducts) noProducts.classList.add('hidden');

  try {
    const res = await fetch('./data/products.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    allProducts = []; // Reset
    const categories = i18next.t('categories', { returnObjects: true }) || {};

    const container = document.getElementById('productSection');
    container.innerHTML = '<h2 class="text-3xl font-bold mb-6 text-center text-yellow-900" data-i18n="our_products">🌶️ Our Products</h2>';
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) {
      const grid = document.createElement('div');
      grid.id = 'productGrid';
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4';
      container.appendChild(grid);
    }

    // Handle the current structure where products are under "Preethi Products" key
    for (const cat in data) {
      const products = Array.isArray(data[cat]) ? data[cat] : [];
      const catTitle = categories[cat] || cat;
      
      // Only show category title if it's not the default "Preethi Products"
      if (cat !== 'Preethi Products' && catTitle !== cat) {
        const catDiv = document.createElement('div');
        catDiv.className = 'mb-6';
        catDiv.innerHTML = `<h2 class="text-xl font-bold mt-6 mb-4">${catTitle}</h2><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="cat-${cat.replace(/\s+/g, '-')}"></div>`;
        container.appendChild(catDiv);
      }

      const targetContainer = cat !== 'Preethi Products' && catTitle !== cat 
        ? document.getElementById(`cat-${cat.replace(/\s+/g, '-')}`)
        : document.getElementById('productGrid') || container;

      products.forEach((item) => {
        // Fallback to item.name if translation is missing
        const nameKey = item.key + '.name';
        const descKey = item.key + '.desc';
        const name = i18next.t(nameKey, { defaultValue: item.name || item.key });
        const desc = i18next.t(descKey, { defaultValue: item.desc || item.notes || '' });
        
        // Store product for search
        allProducts.push({ ...item, name, desc, category: cat });
        
        // XSS protection - escape user content
        const safeName = escapeHtml(name);
        const safeDesc = escapeHtml(desc);
        const sizeOptions = item.sizes.map(size => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join('');
        
        // Determine category for filtering
        const productCategory = determineProductCategory(item.key, name);
        
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-lg shadow-md p-4 product-card card-glow fade-in-up cursor-pointer relative';
        productCard.setAttribute('data-product-name', name.toLowerCase());
        productCard.setAttribute('data-product-key', item.key);
        productCard.setAttribute('data-product-category', productCategory);
        productCard.style.animationDelay = `${Math.min(products.indexOf(item) * 0.1, 1)}s`;
        productCard.onclick = (e) => {
          // Don't open modal if clicking on button or select
          if (!e.target.closest('button') && !e.target.closest('select') && !e.target.closest('a')) {
            openProductModal(item, name, desc);
          }
        };
        productCard.innerHTML = `
          <div class="relative overflow-hidden rounded-lg mb-3 bg-gradient-to-br from-yellow-50 to-white">
            <img src="images/${escapeHtml(item.image)}" loading="lazy" class="w-full h-40 object-cover product-image" alt="${safeName}" onerror="this.src='images/logo.png'" onclick="event.stopPropagation(); openLightbox('images/${escapeHtml(item.image)}', '${safeName}')">
          </div>
          <h3 class="font-bold text-base mb-1.5 text-gray-800 line-clamp-2">${safeName}</h3>
          <p class="text-xs text-gray-600 mb-3 min-h-[54px] line-clamp-3 leading-relaxed">${safeDesc}</p>
          <label class="block text-xs mt-1.5 font-semibold text-gray-700 mb-1">${escapeHtml(i18next.t('select_size', { defaultValue: 'Select Size' }))}:
            <select class="border-2 border-yellow-200 rounded-lg px-2 py-1.5 mt-1 w-full bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm hover:shadow-md transition-all text-xs" id="size-${escapeHtml(item.key)}" aria-label="Select size for ${safeName}" onclick="event.stopPropagation()" onchange="if(typeof updateProductCardCartStatus === 'function') updateProductCardCartStatus()">
              ${sizeOptions}
            </select>
          </label>
          <div class="quantity-controls mt-2 flex items-center justify-center gap-2" data-product-key="${escapeHtml(item.key)}">
            <button 
              onclick="event.stopPropagation(); decrementProductQty('${escapeHtml(item.key)}', document.getElementById('size-${escapeHtml(item.key)}').value)" 
              class="qty-btn qty-decrement bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg shadow-sm hover:shadow font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
              aria-label="Decrease quantity"
              style="min-width: 40px;"
            >
              −
            </button>
            <div class="qty-display bg-white border-2 border-yellow-200 px-4 py-2 rounded-lg text-sm font-semibold text-gray-800 min-w-[60px] text-center" data-qty="0">
              0
            </div>
            <button 
              onclick="event.stopPropagation(); incrementProductQty('${escapeHtml(item.key)}', document.getElementById('size-${escapeHtml(item.key)}').value)" 
              class="qty-btn qty-increment gradient-button text-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg font-bold text-sm transition-all duration-200 active:scale-95" 
              aria-label="Increase quantity"
              style="min-width: 40px;"
            >
              +
            </button>
          </div>
          ${item.video ? `<a href="${escapeHtml(item.video)}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline text-sm mt-3 block text-center font-medium" onclick="event.stopPropagation()">🎥 ${escapeHtml(i18next.t('watch_demo', { defaultValue: 'Watch Cooking Demo' }))}</a>` : ''}
        `;
        targetContainer.appendChild(productCard);
      });
    }
    
    // Hide loading indicator
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    
    // Initialize search
    if (typeof filterProducts === 'function') {
      filterProducts('');
    }
    
    // Update product cards to show cart status
    if (typeof updateProductCardCartStatus === 'function') {
      updateProductCardCartStatus();
    }
    
    // Render recently viewed products
    if (typeof renderRecentlyViewed === 'function') {
      renderRecentlyViewed();
    }
  } catch (error) {
    if (typeof handleError === 'function') {
      handleError(error, 'loadProducts');
    } else {
      console.error("Failed to load products.json", error);
    }
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    const errorMsg = i18next.t('load_error', { defaultValue: 'Unable to load products. Please try again later.' });
    const productSection = document.getElementById('productSection');
    if (productSection) {
      productSection.innerHTML = `<p class="text-red-500 text-center p-4" role="alert">${errorMsg}</p>`;
    }
  }
}

// Determine product category based on key/name
function determineProductCategory(key, name) {
  const keyLower = key.toLowerCase();
  const nameLower = name.toLowerCase();
  
  // Ready Mix products
  if (keyLower.includes('rice_powder') || keyLower.includes('mix') || 
      nameLower.includes('rice') || nameLower.includes('mix')) {
    return 'readyMix';
  }
  
  // Masala products (most products are masalas)
  if (keyLower.includes('masala') || keyLower.includes('powder') || 
      nameLower.includes('masala') || nameLower.includes('powder')) {
    return 'masala';
  }
  
  return 'masala'; // Default to masala
}

// Product search/filter function
function filterProducts(searchTerm) {
  const searchLower = searchTerm.toLowerCase().trim();
  const productCards = document.querySelectorAll('.product-card');
  const noProducts = document.getElementById('noProducts');
  let visibleCount = 0;
  
  productCards.forEach(card => {
    const productName = card.getAttribute('data-product-name') || '';
    const productKey = card.getAttribute('data-product-key') || '';
    const productCategory = card.getAttribute('data-product-category') || '';
    
    // Category filter
    const categoryMatch = currentCategory === 'all' || productCategory === currentCategory;
    
    // Search filter
    const searchMatch = !searchTerm || productName.includes(searchLower) || productKey.includes(searchLower);
    
    if (categoryMatch && searchMatch) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });
  
  // Show/hide "no products" message
  if (noProducts) {
    if (visibleCount === 0) {
      noProducts.classList.remove('hidden');
    } else {
      noProducts.classList.add('hidden');
    }
  }
}

// Category filter function
function filterByCategory(category) {
  currentCategory = category;
  
  // Update button styles
  document.querySelectorAll('.category-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === category) {
      btn.classList.remove('bg-white', 'text-yellow-700', 'border-2', 'border-yellow-300', 'hover:bg-yellow-50');
      btn.classList.add('bg-gradient-to-r', 'from-yellow-500', 'to-yellow-600', 'text-white');
    } else {
      btn.classList.remove('bg-gradient-to-r', 'from-yellow-500', 'to-yellow-600', 'text-white');
      btn.classList.add('bg-white', 'text-yellow-700', 'border-2', 'border-yellow-300', 'hover:bg-yellow-50');
    }
  });
  
  // Apply filters
  const searchInput = document.getElementById('productSearch');
  filterProducts(searchInput ? searchInput.value : '');
}

// Sort products function
function sortProducts(sortType) {
  currentSort = sortType;
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;
  
  const cards = Array.from(productGrid.querySelectorAll('.product-card'));
  
  if (sortType === 'name-asc') {
    cards.sort((a, b) => {
      const nameA = a.getAttribute('data-product-name') || '';
      const nameB = b.getAttribute('data-product-name') || '';
      return nameA.localeCompare(nameB);
    });
  } else if (sortType === 'name-desc') {
    cards.sort((a, b) => {
      const nameA = a.getAttribute('data-product-name') || '';
      const nameB = b.getAttribute('data-product-name') || '';
      return nameB.localeCompare(nameA);
    });
  }
  
  // Re-append sorted cards
  cards.forEach(card => productGrid.appendChild(card));
}

// Recently Viewed Products Manager
function addToRecentlyViewed(productKey, productName, productImage) {
  try {
    let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    // Remove if already exists
    viewed = viewed.filter(item => item.key !== productKey);
    // Add to beginning
    viewed.unshift({ key: productKey, name: productName, image: productImage, timestamp: Date.now() });
    // Keep only last 6 items
    viewed = viewed.slice(0, 6);
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
    // Update display
    renderRecentlyViewed();
  } catch (error) {
    if (typeof handleError === 'function') {
      handleError(error, 'addToRecentlyViewed', true); // Silent - not critical
    } else {
      console.error('Error saving recently viewed:', error);
    }
  }
}

function renderRecentlyViewed() {
  try {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const container = document.getElementById('recentlyViewedProducts');
    if (!container || viewed.length === 0) {
      if (container) container.style.display = 'none';
      return;
    }
    
    container.style.display = 'block';
    container.innerHTML = '<h3 class="text-xl font-bold mb-4 text-yellow-900" data-i18n="recently_viewed">Recently Viewed</h3><div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3"></div>';
    const grid = container.querySelector('div');
    
    viewed.forEach(item => {
      const productCard = document.createElement('div');
      productCard.className = 'bg-white rounded-lg p-2 shadow-md hover:shadow-lg transition-all cursor-pointer product-card relative';
      productCard.onclick = () => {
        const product = allProducts.find(p => p.key === item.key);
        if (product) {
          const name = i18next.t(`${product.key}.name`, { defaultValue: product.name || product.key });
          const desc = i18next.t(`${product.key}.desc`, { defaultValue: product.desc || '' });
          openProductModal(product, name, desc);
        }
      };
      productCard.innerHTML = `
        <img src="images/${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="w-full h-24 object-cover rounded mb-2" onerror="this.src='images/logo.png'">
        <p class="text-xs text-gray-700 line-clamp-2 font-medium">${escapeHtml(item.name)}</p>
      `;
      grid.appendChild(productCard);
    });
    
    // Update i18n
    if (typeof updateI18nText === 'function') updateI18nText();
  } catch (error) {
    if (typeof handleError === 'function') {
      handleError(error, 'renderRecentlyViewed', true); // Silent - not critical
    } else {
      console.error('Error rendering recently viewed:', error);
    }
  }
}

// Product detail modal functions
function openProductModal(product, name, desc) {
  currentProductData = product;
  const modal = document.getElementById('productDetailModal');
  if (!modal) return;
  
  // Track as recently viewed
  addToRecentlyViewed(product.key, name, product.image);
  
  // Set modal content
  document.getElementById('modalProductName').textContent = name;
  document.getElementById('modalProductTitle').textContent = name;
  document.getElementById('modalProductDesc').textContent = desc;
  document.getElementById('modalProductImage').src = `images/${product.image}`;
  document.getElementById('modalProductImage').alt = name;
  
  // Populate size select
  const sizeSelect = document.getElementById('modalProductSize');
  sizeSelect.innerHTML = product.sizes.map(size => 
    `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`
  ).join('');
  
  // Show modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProductModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('productDetailModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  currentProductData = null;
}

function addToCartFromModal() {
  if (!currentProductData) return;
  const sizeSelect = document.getElementById('modalProductSize');
  const size = sizeSelect ? sizeSelect.value : currentProductData.sizes[0];
  addToCart(currentProductData.key, size);
  closeProductModal();
}