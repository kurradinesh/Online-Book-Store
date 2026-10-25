// Centralized HTTP API Client for BookNook
const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://online-book-store-backend-6ahp.onrender.com' : '');
let cleanBase = (rawApiUrl || '').trim().replace(/\/+$/, '');
if (cleanBase.endsWith('/api')) {
  cleanBase = cleanBase.slice(0, -4);
}

export const API_BASE = cleanBase;
export const BASE_URL = cleanBase ? `${cleanBase}/api` : '/api';

export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = API_BASE || '';
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Accept': 'application/json',
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (networkError) {
    console.error(`Network or CORS Error on [${options.method || 'GET'} ${endpoint}]:`, networkError.message);
    throw new Error(
      "Unable to connect to the BookNook server. Please verify your internet connection or check if the backend service is starting up."
    );
  }

  // Handle 401 Unauthorized for protected endpoints
  if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?expired=true';
    }
  }

  // Read body text safely first to avoid "Unexpected end of JSON input" on empty responses or HTML error pages
  const rawText = await response.text();
  let data = null;
  if (rawText && rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch {
      // Content is not valid JSON (e.g. HTML error page or raw string)
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage;
    if (data && data.message) {
      errorMessage = data.message;
    } else if (rawText && rawText.length < 200 && !rawText.trim().startsWith('<')) {
      errorMessage = rawText.trim();
    } else if (response.status === 401) {
      errorMessage = "Invalid email or password. Please try again.";
    } else if (response.status === 403) {
      errorMessage = "Access forbidden or request rejected by CORS policy.";
    } else if (response.status === 404) {
      errorMessage = `The requested endpoint (${endpoint}) was not found.`;
    } else if (response.status === 502 || response.status === 503 || response.status === 504) {
      errorMessage = "The BookNook backend service is spinning up or temporarily unavailable. Please retry in a few seconds.";
    } else if (response.status >= 500) {
      errorMessage = "An internal server error occurred. Please try again later.";
    } else {
      errorMessage = `Request failed with status ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  return data !== null ? data : { success: true, data: null };
}

export const api = {
  // Auth API
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    me: () => request('/auth/me'),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyOtp: (payload) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) }),
    resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  },

  // Books Catalog API
  books: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      return request(`/books?${query.toString()}`);
    },
    getById: (id) => request(`/books/${id}`),
    getCategories: () => request('/books/categories'),
    getFeatured: () => request('/books/featured'),
    getNewArrivals: () => request('/books/new-arrivals'),
    getRelated: (id) => request(`/books/${id}/related`),
    getReviews: (id) => request(`/books/${id}/reviews`),
    addReview: (id, reviewData) => request(`/books/${id}/reviews`, { method: 'POST', body: JSON.stringify(reviewData) }),
  },

  // Shopping Cart API
  cart: {
    get: () => request('/cart'),
    add: (productId, quantity = 1) => request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
    updateQuantity: (cartId, quantity) => request(`/cart/${cartId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    remove: (cartId) => request(`/cart/${cartId}`, { method: 'DELETE' }),
    clear: () => request('/cart', { method: 'DELETE' }),
  },

  // Wishlist API
  wishlist: {
    get: () => request('/wishlist'),
    add: (productId) => request('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
    remove: (wishlistId) => request(`/wishlist/${wishlistId}`, { method: 'DELETE' }),
    moveToCart: (wishlistId) => request(`/wishlist/${wishlistId}/move-to-cart`, { method: 'POST' }),
  },

  // Addresses API
  addresses: {
    getAll: () => request('/addresses'),
    create: (address) => request('/addresses', { method: 'POST', body: JSON.stringify(address) }),
    update: (id, address) => request(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(address) }),
    delete: (id) => request(`/addresses/${id}`, { method: 'DELETE' }),
    setDefault: (id) => request(`/addresses/${id}/default`, { method: 'PATCH' }),
  },

  // Checkout & Orders API
  checkout: {
    process: (payload) => request('/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  },
  orders: {
    getMyOrders: () => request('/orders'),
    getDetails: (id) => request(`/orders/${id}`),
    cancel: (id) => request(`/orders/${id}/cancel`, { method: 'POST' }),
  },

  // Profile API
  profile: {
    get: () => request('/profile'),
    update: (profileData) => request('/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
    changePassword: (passwords) => request('/profile/change-password', { method: 'POST', body: JSON.stringify(passwords) }),
    deleteAccount: () => request('/profile/delete-account', { method: 'DELETE' }),
  },

  // Admin API
  admin: {
    getAnalytics: () => request('/admin/analytics'),
    getBooks: (params = {}) => {
      const query = new URLSearchParams(params);
      return request(`/admin/books?${query.toString()}`);
    },
    addBook: (book) => request('/admin/books', { method: 'POST', body: JSON.stringify(book) }),
    updateBook: (id, book) => request(`/admin/books/${id}`, { method: 'PUT', body: JSON.stringify(book) }),
    deleteBook: (id) => request(`/admin/books/${id}`, { method: 'DELETE' }),
    uploadImage: (formData) => request('/admin/upload-image', { method: 'POST', body: formData }),
    getOrders: () => request('/admin/orders'),
    getOrderDetails: (id) => request(`/admin/orders/${id}`),
    updateOrderStatus: (id, payload) => request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
    getUsers: () => request('/admin/users'),
    updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  },

  // Customer Support API
  support: {
    submit: (ticket) => request('/support', { method: 'POST', body: JSON.stringify(ticket) }),
    getMy: () => request('/support/my'),
    getAllAdmin: () => request('/support/admin/all'),
  },
};
