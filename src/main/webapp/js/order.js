/**
 * ORDER MANAGEMENT SYSTEM
 * Handles checkout finalization and persistent order history.
 */

/**
 * Places an order by moving cart contents to the order history.
 * @param {Object} userDetails - Object containing {name, address, email}
 * @returns {string|boolean} - The unique Order ID or false if failed.
 */
function placeOrder(userDetails) {
  const rawCart = localStorage.getItem('booknook_cart') || localStorage.getItem('cart') || '[]';
  const cart = JSON.parse(rawCart);
  
  if (!Array.isArray(cart) || cart.length === 0) {
    if (typeof showToast === 'function') {
      showToast("Your cart is empty!", "error");
    }
    return false;
  }

  // Calculate order total safely
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const newOrder = {
    id: 'BN-' + Date.now(),
    date: new Date().toLocaleString(),
    items: cart,
    total: total,
    user: userDetails
  };

  // Get current user to save orders specifically to their profile (if logged in)
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const ordersKey = user ? `orders_${user.email}` : 'orders_guest';
  
  const orderHistory = JSON.parse(localStorage.getItem(ordersKey) || '[]');
  orderHistory.push(newOrder);
  
  localStorage.setItem(ordersKey, JSON.stringify(orderHistory));
  
  // Clean up
  localStorage.removeItem('booknook_cart');
  localStorage.removeItem('cart');
  sessionStorage.removeItem('booknook_cart');
  sessionStorage.removeItem('cart');
  
  // Refresh UI
  if (typeof updateCartUI === 'function') updateCartUI();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdated'));
  }
  
  return newOrder.id;
}

/**
 * Retrieves the order history for the currently logged-in user.
 */
function getOrderHistory() {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const ordersKey = user ? `orders_${user.email}` : 'orders_guest';
  return JSON.parse(localStorage.getItem(ordersKey) || '[]');
}

// Attach to Global Scope
window.placeOrder = placeOrder;
window.getOrderHistory = getOrderHistory;