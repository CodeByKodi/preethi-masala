# 🚀 GitHub Pages Deployment Guide

## ✅ Pure GitHub Pages - No Build Tools Required

This project uses **ONLY GitHub Pages** - no build process, no npm, no additional stack. Just push and it works!

## Quick Start

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Preethi Masala Shop"

# Add your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/your-username/preethi-masala.git

# Push to main branch
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select **GitHub Actions**
5. Save the settings

### Step 3: Wait for Deployment

- GitHub Actions will automatically deploy your site
- Check the **Actions** tab to see deployment progress
- Your site will be live at: `https://your-username.github.io/preethi-masala/`

## Manual Deployment (Alternative)

If you prefer manual deployment:

1. Go to **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose:
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
4. Click **Save**

## Custom Domain Setup

To use your own domain (e.g., `preethimasala.com`):

1. Create a `CNAME` file in the root directory:
   ```
   preethimasala.com
   ```

2. Update `index.html`:
   - Change `https://yourdomain.github.io/` to your actual domain
   - Update all `og:url` and canonical URLs

3. Configure DNS:
   - Add a CNAME record pointing to `your-username.github.io`
   - Or add A records for GitHub Pages IPs

## Troubleshooting

### Site not loading?
- Check the **Actions** tab for deployment errors
- Ensure `.nojekyll` file exists in root
- Verify all file paths are relative (not absolute)

### Images not showing?
- Check that image paths start with `images/` (relative)
- Verify image files are committed to git

### JSON files not loading?
- Ensure `data/products.json` and `lang/*.json` files are committed
- Check browser console for CORS errors (shouldn't happen on GitHub Pages)

## Files Created for GitHub Pages

- ✅ `.nojekyll` - Disables Jekyll processing
- ✅ `.github/workflows/deploy.yml` - Automatic deployment
- ✅ `.gitignore` - Excludes unnecessary files

## Updating Your Site

Simply push changes to the `main` branch:

```bash
git add .
git commit -m "Update products"
git push
```

GitHub Actions will automatically redeploy your site!

