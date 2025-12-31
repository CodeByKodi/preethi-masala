// Application Configuration
// Update these values with your actual domain and contact information

const APP_CONFIG = {
  // Site Configuration
  site: {
    // TODO: Replace with your actual GitHub Pages URL or custom domain
    // Examples:
    // - GitHub Pages: 'https://yourusername.github.io/preethi-masala'
    // - Custom domain: 'https://preethimasala.com'
    domain: 'https://yourdomain.github.io',
    name: 'Preethi Masala',
    title: 'Preethi Masala - Authentic Indian Spices'
  },

  // Contact Information
  contact: {
    phone: {
      // Landline (with area code)
      landline: '04546-251689',
      // Mobile (display format)
      mobile: '63693 57434',
      // WhatsApp (with country code, no spaces or dashes)
      // Format: country code + number (e.g., 91 for India)
      whatsapp: '916369357434'
    },
    email: 'preethimasala@gmail.com',
    address: {
      street: '26, SIDCO Industrial Estate, Madurai Road',
      city: 'THENI',
      pincode: '625 531',
      country: 'IN',
      full: '26, SIDCO Industrial Estate, Madurai Road, THENI - 625 531'
    }
  },

  // Company Information
  company: {
    name: 'Preethi Masala',
    manufacturer: 'VELLS COTTAGE WORKS',
    iso: 'ISO 9001-2000 CERTIFIED'
  },

  // Cart Configuration
  cart: {
    maxCartSize: 100,
    maxQuantityPerItem: 50
  }
};

// Helper function to get full WhatsApp URL
function getWhatsAppUrl(message) {
  const phone = APP_CONFIG.contact.phone.whatsapp;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// Helper function to get site URL with path
function getSiteUrl(path = '') {
  const domain = APP_CONFIG.site.domain.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return domain + cleanPath;
}

