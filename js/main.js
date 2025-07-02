i18next
  .use(i18nextHttpBackend)
  .init({
    lng: "en",
    backend: {
      loadPath: "./lang/{{lng}}.json",
    },
    debug: false
  }, function (err, t) {
    loadProducts();
  });

document.getElementById("langSwitcher").addEventListener("change", function (e) {
  i18next.changeLanguage(e.target.value, () => loadProducts());
});

async function loadProducts() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = i18next.t(key);
  });

  const res = await fetch('./data/products.json');
  const data = await res.json();
  const categories = i18next.t('categories', { returnObjects: true });

  const container = document.getElementById('productSection');
  container.innerHTML = '';

  for (const cat in data) {
    const catTitle = categories[cat] || cat;
    container.innerHTML += `<h2 class="text-xl font-bold mt-6 mb-2">${catTitle}</h2><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6" id="${cat}"></div>`;
    const catContainer = document.getElementById(cat);

    data[cat].forEach((item) => {
      const sizeOptions = item.sizes.map(size => `<option value="${size}">${size}</option>`).join('');
      catContainer.innerHTML += `
        <div class="bg-white rounded shadow p-4">
          <img src="images/${item.image}" loading="lazy" class="w-full h-48 object-cover rounded mb-3" alt="${i18next.t(item.key + '.name')}">
          <h3 class="font-bold text-lg">${i18next.t(item.key + '.name')}</h3>
          <p class="text-sm">${i18next.t(item.key + '.desc')}</p>
          <label class="block text-xs mt-2">Select Size:
            <select class="border rounded p-1 mt-1" id="size-${item.key}">
              ${sizeOptions}
            </select>
          </label>
          <button onclick="addToCart('${item.key}', document.getElementById('size-${item.key}').value)" class="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">Add to Cart</button>
          ${item.video ? `<a href="${item.video}" target="_blank" class="text-blue-500 underline text-sm mt-2 block">🎥 Watch Cooking Demo</a>` : ''}
        </div>
      `;
    });
  }
}