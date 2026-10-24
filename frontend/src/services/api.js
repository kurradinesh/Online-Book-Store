// Centralized HTTP API Client for BookNook
const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
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
