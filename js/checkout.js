let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(productKey, size) {
  const existingItem = cart.find(item => item.key === productKey && item.size === size);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ key: productKey, size, qty: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showToast(i18next.t('added_to_cart') || "Added to cart!");
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cartCount").innerText = total;
}

function openCart() {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.remove("translate-x-full");
  drawer.classList.add("translate-x-0");
  renderCartItems();
}

function closeCart() {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.remove("translate-x-0");
  drawer.classList.add("translate-x-full");
}

function renderCartItems() {
  const container = document.getElementById("cartItems");
  container.innerHTML = "";
  container.classList.add("max-h-[300px]", "overflow-y-auto", "pr-2", "scrollbar-thin", "scrollbar-thumb-rounded", "scrollbar-thumb-gray-400", "scrollbar-track-gray-100");
  cart.forEach((item, index) => {
    const name = i18next.t(`${item.key}.name`);
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="flex justify-between items-center border-b pb-2 gap-2">
        <div class="flex-1">
          <span class="block font-medium">${name}</span>
          <span class="text-xs text-gray-600">(${item.size})</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="decrementQty(${index})" class="bg-gray-200 px-2 rounded text-sm">-</button>
          <span class="min-w-[24px] text-center">${item.qty}</span>
          <button onclick="incrementQty(${index})" class="bg-gray-200 px-2 rounded text-sm">+</button>
        </div>
        <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 text-sm font-bold ml-2">❌</button>
      </div>
    `;
    container.appendChild(li);
  });
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const summary = document.createElement("div");
  summary.className = "mt-4 text-right font-semibold text-sm text-gray-700";
  summary.innerText = `Total items: ${totalItems}`;
  container.appendChild(summary);
}

function checkoutWhatsApp() {
  if (cart.length === 0) return;

  let message = "Hi, I would like to order:\n";
  cart.forEach(item => {
    const name = i18next.t(`${item.key}.name`);
    message += `- ${name} (${item.size}) × ${item.qty}\n`;
  });
  message += "\nPlease confirm availability.";

  const phone = "919787781569";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function clearCart() {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

// Initialize cart count on load
updateCartCount();

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

function clearCart() {
  cart = [];
  localStorage.removeItem("cart");
  updateCartCount();
  renderCartItems();
}

function showToast(message, duration = 2000) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, duration);
}

function incrementQty(index) {
  cart[index].qty += 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

function decrementQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
  } else {
    cart.splice(index, 1);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}
