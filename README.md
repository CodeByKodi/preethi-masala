# 🛒 Preethi Masala Shop

Welcome to the **Preethi Masala Shop**, a multilingual e-commerce frontend for showcasing and selling authentic Indian masala products. Built with simplicity and scalability in mind, this project supports dynamic product listing, internationalization, and category-based filtering.

---

## 📦 Features

- 🌐 Multi-language support (English, Tamil, Hindi)
- 🖼️ Dynamic product rendering from `products.json`
- 🔍 Product search functionality
- 🧭 Category and size-based filtering
- 🛒 Enhanced shopping cart with in-memory management
- 📸 Image lightbox/zoom for product images
- 🖨️ Print cart functionality
- 📤 Share cart functionality
- 🔄 Language selection with persistence
- 📱 Fully responsive design
- ♿ Accessibility features (skip to content, ARIA labels)
- 🎨 Modern UI with animations and transitions
- 📊 Cart statistics and analytics
- 🔒 Data validation and error handling

---

## 🛠️ Tech Stack

- **HTML / CSS / JavaScript**
- **i18next** for localization
- **JSON** for product and language data
- **Vanilla JS** (no frameworks)

---

## 🧩 Folder Structure

```
preethi-masala/
├── assets/              # PDF catalog
├── data/                # products.json
├── images/              # Product images and logos
├── lang/                # Translations (en.json, hi.json, ta.json)
├── js/                  # JavaScript files
│   ├── main.js         # Product rendering and language switching
│   └── checkout.js     # Cart management and checkout
├── .github/workflows/   # GitHub Actions deployment
├── index.html           # Main HTML file
├── robots.txt           # SEO robots file
├── sitemap.xml          # SEO sitemap
├── .nojekyll            # Disable Jekyll processing
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/masala-shop.git
cd masala-shop
```

### 2. Run Locally

**⚠️ Important:** Since this project uses `fetch()` to load JSON files, you need to run it through a local server (not just open the HTML file directly) to avoid CORS errors.

#### Option 1: Using Python (Recommended - No installation needed)

```bash
# Python 3
python3 -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

#### Option 2: Using Node.js (live-server)

```bash
# Install live-server globally
npm install -g live-server

# Run it
live-server
```

#### Option 3: Using PHP

```bash
php -S localhost:8000
```

#### Option 4: Using VS Code Live Server Extension

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option 5: Using npx (No installation)

```bash
npx http-server -p 8000
```

Then open: `http://localhost:8000`

---

## 🌐 Deploy to GitHub Pages

This project is ready to deploy to GitHub Pages! Follow these steps:

### Automatic Deployment (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click on **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The site will automatically deploy when you push to the `main` or `master` branch

3. **Your site will be live at:**
   ```
   https://your-username.github.io/preethi-masala/
   ```

### Manual Deployment

If you prefer manual deployment:

1. Go to **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose **main** (or **master**) branch and **/ (root)** folder
4. Click **Save**

### Custom Domain (Optional)

To use a custom domain:

1. Create a file named `CNAME` in the root directory with your domain:
   ```
   yourdomain.com
   ```

2. Update the `canonical` and `og:url` in `index.html` with your domain

3. Configure DNS settings in your domain provider

### Important Files for GitHub Pages

- ✅ `.nojekyll` - Tells GitHub Pages not to use Jekyll
- ✅ `.github/workflows/deploy.yml` - Automatic deployment workflow
- ✅ All paths are relative, so they work on GitHub Pages

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