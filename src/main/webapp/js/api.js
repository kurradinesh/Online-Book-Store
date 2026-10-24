/**
 * BOOKNOOK CENTRAL API CONFIGURATION ENGINE
 * Maps frontend application properties directly to Java Tomcat Servlets.
 */

const KNOWN_PATH_BREAKERS = ['index.html','login.html','register.html','orders.html','cart.html','pages','js','css','WEB-INF','META-INF'];

function getAppContextPath() {
  const path = window.location.pathname || '';
  const segments = path.split('/').filter(Boolean);
  const appSegments = [];
  for (const segment of segments) {
    if (KNOWN_PATH_BREAKERS.includes(segment)) {
      break;
    }
    appSegments.push(segment);
  }
  return appSegments.length ? `/${appSegments.join('/')}` : '';
}

const BOOKNOOK_API_BASE = window.location.origin + getAppContextPath();

/**
 * Global Profile State Synchronizer
 * Reads the cached fallback user state matching Tomcat Session markers
 */
function getCurrentUserProfile() {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to read client profile cache data:', error);
    return null;
  }
}

/**
 * Polling Check for Session Authentication Status
 * Calls AuthStatusServlet to verify if a Tomcat Http Session exists.
 * Returns user profile parameters or requests guest access fallback controls.
 */
async function getOrCreateBackendUser() {
  try {
    const response = await fetch(`${BOOKNOOK_API_BASE}/AuthStatusServlet`, { credentials: 'same-origin' });
    if (!response.ok) return null;
    
    const status = await response.json();
    if (status && status.isLoggedIn) {
      const activeUser = {
        name: status.username || status.email.split('@')[0],
        email: status.email || status.username,
        role: status.role || 'customer',
        id: status.email || status.username
      };
      localStorage.setItem('currentUser', JSON.stringify(activeUser));
      return activeUser;
    }
  } catch (error) {
    console.warn('Tomcat session validation poll threw an exception:', error);
  }

  // Wipe profile definitions locally if the back-end explicitly destroys context variables
  localStorage.removeItem('currentUser');
  return null;
}

/**
 * Clean Utility Interface Wrapper for Asynchronous Actions
 */
async function fetchJson(url, options = {}) {
  const configHeaders = options.headers || {};
  
  const response = await fetch(url, {
    ...options,
    credentials: options.credentials || 'same-origin',
    headers: {
      ...configHeaders
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Operation transaction failed with server status: ${response.status}`);
  }

  // Safely extract payloads parsing structured text blocks
  return await response.json().catch(() => ({}));
}

/**
 * Currency Formatting Engine
 * Formats standard integers into Indian Rupee pricing layout formats (₹0,000.00)
 */
function formatCurrency(value) {
  return Number(value || 0).toLocaleString('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0 
  });
}

/**
 * Shared Multi-Page Application Dark Mode Sync Handler
 */
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark');
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
      const icon = darkToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      }
    }
  }
});

// Bind execution pointers to the global window scope for shared file accessibility
window.BOOKNOOK_API_BASE = BOOKNOOK_API_BASE;
window.getCurrentUserProfile = getCurrentUserProfile;
window.getOrCreateBackendUser = getOrCreateBackendUser;
window.fetchJson = fetchJson;
window.formatCurrency = formatCurrency;