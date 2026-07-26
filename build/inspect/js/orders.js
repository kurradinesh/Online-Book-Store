/**
 * Backend-backed order history and checkout integration.
 */

async function placeOrder(userDetails) {
  const cart = typeof getDisplayedCart === 'function' ? await getDisplayedCart() : getCart();
  if (!cart || !cart.length) {
    if (typeof showToast === 'function') showToast('Your cart is empty!', 'error');
    return false;
  }

  const backendUser = typeof getOrCreateBackendUser === 'function' ? await getOrCreateBackendUser() : null;

  if (backendUser) {
    try {
      const response = await fetchJson(`${BOOKNOOK_API_BASE || 'http://localhost:8081/api'}/orders/create?userId=${backendUser.id}&customerName=${encodeURIComponent(userDetails.name || backendUser.name || 'Customer')}&email=${encodeURIComponent(userDetails.email || backendUser.email || 'guest@example.com')}&address=${encodeURIComponent(userDetails.address || 'Cart checkout')}` , { method: 'POST' });
      if (response && response.orderId) {
        await fetch(`${BOOKNOOK_API_BASE || 'http://localhost:8081/api'}/cart/clear/${backendUser.id}`, { method: 'DELETE' });
        saveCart([]);
        window.dispatchEvent(new Event('cartUpdated'));
        return response.orderId;
      }
    } catch (error) {
      console.warn('Backend order creation failed:', error);
      if (typeof showToast === 'function') showToast('Backend order failed. Falling back to local history.', 'error');
    }
  }

  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const newOrder = {
    id: 'BN-' + Date.now(),
    orderNumber: 'BN-' + Date.now(),
    date: new Date().toLocaleString(),
    items: cart,
    total,
    orderStatus: 'PLACED',
    paymentStatus: 'PENDING',
    user: userDetails
  };

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const ordersKey = user ? `orders_${user.email}` : 'orders_guest';
  const orderHistory = JSON.parse(localStorage.getItem(ordersKey) || '[]');
  orderHistory.push(newOrder);
  localStorage.setItem(ordersKey, JSON.stringify(orderHistory));
  saveCart([]);
  window.dispatchEvent(new Event('cartUpdated'));
  return newOrder.id;
}

async function getOrderHistory() {
  const backendUser = typeof getOrCreateBackendUser === 'function' ? await getOrCreateBackendUser() : null;
  if (backendUser) {
    try {
      return await fetchJson(`${BOOKNOOK_API_BASE || 'http://localhost:8081/api'}/orders/${backendUser.id}`);
    } catch (error) {
      console.warn('Backend order history unavailable, using local history:', error);
    }
  }

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const ordersKey = user ? `orders_${user.email}` : 'orders_guest';
  return JSON.parse(localStorage.getItem(ordersKey) || '[]');
}

function renderOrderHistory() {
  const container = document.getElementById('ordersContainer');
  if (!container) return;

  (async () => {
    try {
      const orders = await getOrderHistory();
      if (!orders.length) {
        container.innerHTML = '<div class="empty-cart-card"><i class="fas fa-truck"></i><h3>No orders yet</h3><p>Your placed orders will appear here with tracking and payment status.</p></div>';
        return;
      }

      container.innerHTML = orders.map(order => {
        const items = Array.isArray(order.items) ? order.items : (order.order && order.order.items) || [];
        const totalAmount = order.totalAmount ?? order.total ?? 0;
        const orderNumber = order.orderNumber || order.id || 'BN-000';
        const orderStatus = order.orderStatus || 'PLACED';
        const paymentStatus = order.paymentStatus || 'PENDING';
        const orderDate = order.orderDate || order.date || 'Recently';

        return `
          <article class="cart-item-card" style="display:block;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:12px;">
              <div>
                <h3 style="margin:0;">Order ${orderNumber}</h3>
                <p style="margin:6px 0 0; color:#5d6b75;">Placed on ${orderDate}</p>
              </div>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <span class="badge">Status: ${orderStatus}</span>
                <span class="badge">Payment: ${paymentStatus}</span>
              </div>
            </div>
            <div style="display:grid; gap:10px;">
              ${items.map(item => {
                const product = item.product || item;
                const qty = Number(item.quantity || product.quantity || 1);
                const price = Number(product.price || item.price || 0);
                return `<div style="display:flex; justify-content:space-between; align-items:center; gap:12px; border-top:1px solid #eee; padding-top:10px;">
                  <div>
                    <strong>${product.name || product.title || 'Book'}</strong>
                    <div style="color:#67737d; font-size:0.95rem;">Qty: ${qty}</div>
                  </div>
                  <div style="font-weight:700;">₹${(price * qty).toLocaleString('en-IN')}</div>
                </div>`;
              }).join('')}
            </div>
            <div style="margin-top:12px; border-top:1px solid #eee; padding-top:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <strong>Total: ₹${Number(totalAmount).toLocaleString('en-IN')}</strong>
              <span style="color:#6a7b87;">Tracking: In Transit · ETA 2-4 business days</span>
            </div>
          </article>
        `;
      }).join('');
    } catch (error) {
      container.innerHTML = `<div class="empty-cart-card"><i class="fas fa-exclamation-circle"></i><h3>We could not load orders</h3><p>${error.message}</p></div>`;
    }
  })();
}

window.placeOrder = placeOrder;
window.getOrderHistory = getOrderHistory;
window.renderOrderHistory = renderOrderHistory;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    renderOrderHistory();
  });
}
