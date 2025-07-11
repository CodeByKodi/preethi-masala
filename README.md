# 🛒 Preethi Masala Shop

Welcome to the **Preethi Masala Shop**, a multilingual e-commerce frontend for showcasing and selling authentic Indian masala products. Built with simplicity and scalability in mind, this project supports dynamic product listing, internationalization, and category-based filtering.

---

## 📦 Features

- 🌐 Multi-language support (English, Tamil, Hindi)
- 🖼️ Dynamic product rendering from `products.json`
- 🧭 Category and size-based filtering
- 🛒 Add to Cart functionality
- 🔄 Language selection with persistence
- 📱 Responsive design

---

## 🛠️ Tech Stack

- **HTML / CSS / JavaScript**
- **i18next** for localization
- **JSON** for product and language data
- **Vanilla JS** (no frameworks)

---

## 🧩 Folder Structure

```
masala-shop/
├── assets/              # Images and icons
├── lang/                # Translations (en.json, hi.json, ta.json)
├── data/                # products.json
├── index.html
├── main.js              # Logic for rendering and language switching
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/masala-shop.git
cd masala-shop
```

### 2. Open `index.html`

You can use a local server or open directly in your browser:

```bash
# using VSCode Live Server extension
npm install -g live-server
live-server
```

---

## 🗂️ Data Format

**products.json**
```json
[
  {
    "key": "turmeric_powder",
    "category": "powder",
    "name": "turmeric_powder.name",
    "desc": "turmeric_powder.desc",
    "image": "Turmeric-Powder-2025.png",
    "sizes": [15, 50, 250]
  }
]
```

**en.json**
```json
{
  "turmeric_powder": {
    "name": "Turmeric Powder",
    "desc": "Aromatic and pure turmeric for traditional Indian recipes."
  }
}
```

---

## 📧 Contact

```
VELLS COTTAGE WORKS  
26, SIDCO Industrial Estate, Madurai Road,  
THENI - 625 531  
📞 04546 - 251689  
📱 63693 57434  
✉️ preethimasala@gmail.com
```

---

## 🏷️ License

This project is licensed under the MIT License.