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
      catContainer.innerHTML += `
        <div class="bg-white rounded shadow p-4">
        <img src="images/${item.image}" loading="lazy" class="w-full h-48 object-cover rounded mb-3" alt="${item.name}">
        <h3 class="font-bold text-lg">${item.name}</h3>
        <p class="text-sm">${item.desc}</p>
        <p class="text-xs mt-2">Sizes: ${item.sizes.join(", ")}</p>
        <a href="https://wa.me/919876543210?text=I'm%20interested%20in%20${encodeURIComponent(item.name)}" target="_blank" class="mt-3 inline-block text-green-600 underline text-sm">💬 Order via WhatsApp</a>
        </div>
      `;
    });
  }
}