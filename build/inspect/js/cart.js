/**
 * SHOPPING CART ENGINE
 * Manages basket state, persistence, and cart UI updates.
 */

function buildFallbackBookImage(book) {
  const title = String(book.name || book.title || 'BOOKNOOK').slice(0, 28);
  const genre = String(book.genre || book.category || 'General');
  const palette = {
    'Programming': ['#3b82f6', '#38bdf8'],
    'Fiction': ['#8b5cf6', '#f472b6'],
    'Scripture': ['#b45309', '#facc15'],
    'Self-help': ['#dc2626', '#fb923c'],
    'Textbook': ['#0f766e', '#2dd4bf'],
    'General': ['#2f3e46', '#b9945c']
  };
  const [start, end] = palette[genre] || palette.General;
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='${start}' />
          <stop offset='100%' stop-color='${end}' />
        </linearGradient>
      </defs>
      <rect width='320' height='180' rx='18' fill='url(#g)' />
      <rect x='18' y='18' width='284' height='144' rx='16' fill='rgba(255,255,255,0.08)' stroke='rgba(255,255,255,0.25)' />
      <text x='32' y='56' font-family='Arial, Helvetica, sans-serif' font-size='18' fill='rgba(255,255,255,0.9)'>${genre.toUpperCase()}</text>
      <text x='32' y='98' font-family='Arial, Helvetica, sans-serif' font-size='24' font-weight='700' fill='white'>${title}</text>
      <text x='32' y='135' font-family='Arial, Helvetica, sans-serif' font-size='15' fill='rgba(255,255,255,0.88)'>BOOKNOOK Cart</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function parseCartPayload(rawValue) {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Cart data was invalid and has been reset:', error);
    return [];
  }
}

function getCart() {
  try {
    const localCart = localStorage.getItem('booknook_cart') || localStorage.getItem('cart');
    const localItems = parseCartPayload(localCart);
    if (localItems.length > 0 || localStorage.getItem('booknook_cart')) {
      if (!localStorage.getItem('booknook_cart') && localStorage.getItem('cart')) {
        localStorage.setItem('booknook_cart', localCart);
      }
      return localItems;
    }

    const sessionCart = sessionStorage.getItem('booknook_cart') || sessionStorage.getItem('cart');
    return parseCartPayload(sessionCart);
  } catch (error) {
    console.error('Unable to read cart data:', error);
    return [];
  }
}

function normalizeBackendCartItem(item) {
  const product = item && typeof item === 'object' && 'product' in item ? (item.product || {}) : (item || {});
  const quantity = Number(item?.quantity ?? product.quantity ?? 1) || 1;
  const price = Number(product.price ?? item.price ?? 0) || 0;

  return {
    id: Number(product.id ?? item.productId ?? item.id ?? 0) || (item.id ?? 0),
    cartItemId: item.id ?? item.cartItemId ?? product.id ?? item.productId ?? null,
    title: product.name || product.title || item.title || item.name || 'Untitled Book',
    author: product.author || item.author || 'General Collection',
    price,
    quantity,
    image: product.image || product.cover || item.image || item.cover || buildFallbackBookImage(product),
    genre: product.category || product.genre || item.genre || 'Book'
  };
}

function saveCart(cart) {
  const normalizedCart = Array.isArray(cart) ? cart : [];
  try {
    const cartString = JSON.stringify(normalizedCart);
    localStorage.setItem('booknook_cart', cartString);
    localStorage.setItem('cart', cartString);
    sessionStorage.setItem('booknook_cart', cartString);
    sessionStorage.setItem('cart', cartString);
  } catch (error) {
    console.error('Unable to persist cart data:', error);
  }
}

function normalizeCartItem(book, quantity = 1) {
  const price = Number(book.price || 0);
  return {
    id: Number(book.id),
    title: book.name || book.title || 'Untitled Book',
    author: book.author || '',
    price,
    quantity: Number(quantity) || 1,
    image: book.image || book.cover || buildFallbackBookImage(book),
    genre: book.genre || book.category || ''
  };
}

async function resolveBookReference(bookOrId) {
  if (bookOrId && typeof bookOrId === 'object' && 'id' in bookOrId) {
    return normalizeCartItem(bookOrId);
  }

  const bookId = Number(bookOrId);
  if (!Number.isFinite(bookId)) {
    return null;
  }

  try {
    const catalog = (typeof window.getBooks === 'function') ? await window.getBooks() : [];
    const book = catalog.find(item => Number(item.id) === bookId);
    return book ? normalizeCartItem(book) : null;
  } catch (error) {
    console.warn('Unable to resolve cart book reference:', error);
    return null;
  }
}

async function addToCart(bookOrId) {
  const resolvedBook = await resolveBookReference(bookOrId);

  const backendUser = typeof getOrCreateBackendUser === 'function' ? await getOrCreateBackendUser() : null;
  if (backendUser && resolvedBook) {
    try {
      await fetch(`${BOOKNOOK_API_BASE || 'http://localhost:8081/api'}/cart/add?userId=${backendUser.id}&productId=${resolvedBook.id}&quantity=1&productName=${encodeURIComponent(resolvedBook.title)}&productImage=${encodeURIComponent(resolvedBook.image || '')}&productPrice=${resolvedBook.price}`, {
        method: 'POST'
      });
    } catch (error) {
      console.warn('Backend cart sync failed, continuing with local cart:', error);
    }
  }

  if (!resolvedBook) {
    if (bookOrId && typeof bookOrId === 'object') {
      const fallback = normalizeCartItem(bookOrId);
      if (!fallback.id) return false;
      const cart = getCart();
      const existing = cart.find(item => Number(item.id) === fallback.id);
      if (existing) existing.quantity += 1; else cart.push({ ...fallback, quantity: 1 });
      saveCart(cart);
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    }
    return false;
  }

  const cart = getCart();
  const existingItem = cart.find(item => Number(item.id) === resolvedBook.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...resolvedBook, quantity: 1 });
  }

  saveCart(cart);
  window.dispatchEvent(new Event('cartUpdated'));
  return true;
}

async function removeFromCart(cartItemId, productId = cartItemId) {
  const backendUser = typeof getOrCreateBackendUser === 'function' ? await getOrCreateBackendUser() : null;
  if (backendUser && cartItemId && Number(cartItemId) !== Number(productId)) {
    try {
      await fetch(`${BOOKNOOK_API_BASE || 'http://localhost:8081/api'}/cart/remove/${cartItemId}`, { method: 'DELETE' });
      window.dispatchEvent(new Event('cartUpdated'));
      if (typeof renderCartPage === 'function') await renderCartPage();
      return;
    } catch (error) {
      console.warn('Backend remove failed:', error);
    }
  }

  let cart = getCart();
  cart = cart.filter(item => Number(item.id) !== Number(productId));
  saveCart(cart);
  window.dispatchEvent(new Event('cartUpdated'));
  if (typeof renderCartPage === 'function') {
    await renderCartPage();
  }
}

async function updateQuantity(itemId, delta, productId = itemId) {
  const backendUser = typeof getOrCreateBackendUser === 'function' ? await getOrCreateBackendUser() : null;
  if (backendUser && itemId && Number(itemId) !== Number(productId)) {
    try {
      const items = await fetchJson(`${BOOKNOOK_API_BASE || 'http://localhost:8081/api'}/cart/${backendUser.id}`);
      const currentItem = items.find(item => Number(item.id) === Number(itemId));
      if (!currentItem) throw new Error('Cart item not found');
      const nextQuantity = (Number(currentItem.quantity) || 1) + Number(delta);
      if (nextQuantity <= 0) {
        await fetch(`${BOOKNOOK_API_BASE || 'http://localhost:8081/api'}/cart/remove/${itemId}`, { method: 'DELETE' });
      } else {
        await fetch(`${BOOKNOOK_API_BASE || 'http://localhost:8081/api'}/cart/update?itemId=${itemId}&quantity=${nextQuantity}`, { method: 'PUT' });
      }
      window.dispatchEvent(new Event('cartUpdated'));
      if (typeof renderCartPage === 'function') await renderCartPage();
      return;
    } catch (error) {
      console.warn('Backend quantity update failed:', error);
    }
  }

  const cart = getCart();
  const item = cart.find(i => Number(i.id) === Number(productId));

  if (!item) return;

  item.quantity += Number(delta);

  if (item.quantity <= 0) {
    await removeFromCart(itemId, productId);
    return;
  }

  saveCart(cart);
  window.dispatchEvent(new Event('cartUpdated'));
  if (typeof renderCartPage === 'function') {
    await renderCartPage();
  }
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
}

async function clearCart() {
  const backendUser = typeof getOrCreateBackendUser === 'function' ? await getOrCreateBackendUser() : null;
  if (backendUser) {
    try {
      await fetch(`${BOOKNOOK_API_BASE || 'http://localhost:8081/api'}/cart/clear/${backendUser.id}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('Backend clear failed:', error);
    }
  }

  saveCart([]);
  localStorage.removeItem('booknook_cart');
  localStorage.removeItem('cart');
  sessionStorage.removeItem('booknook_cart');
  sessionStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
  if (typeof renderCartPage === 'function') {
    await renderCartPage();
  }
}

async function buyNowItem(itemId) {
  const cart = getCart();
  const item = cart.find(entry => Number(entry.id) === Number(itemId));

  if (!item) {
    console.error('Buy Now failed: item not found in cart', itemId);
    if (typeof showToast === 'function') {
      showToast('This item is no longer available in your cart.', 'error');
    }
    return false;
  }

  if (typeof showToast === 'function') {
    showToast(`Preparing checkout for ${item.title || 'this item'}.`, 'success');
  }

  if (typeof window !== 'undefined') {
    window.location.href = 'orders.html';
  }

  return true;
}

async function getDisplayedCart() {
  const backendUser = typeof getOrCreateBackendUser === 'function' ? await getOrCreateBackendUser() : null;
  if (backendUser) {
    try {
      const payload = await fetchJson(`${BOOKNOOK_API_BASE || 'http://localhost:8081/api'}/cart/${backendUser.id}`);
      const items = Array.isArray(payload) ? payload : (Array.isArray(payload.items) ? payload.items : []);
      return items.map(normalizeBackendCartItem);
    } catch (error) {
      console.warn('Backend cart unavailable, using local cart:', error);
    }
  }
  return getCart();
}

async function renderCartPage() {
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');

  if (!cartItemsList || !cartTotalEl) return;

  try {
    const cart = await getDisplayedCart();
    const safeCart = Array.isArray(cart) ? cart : [];
    const total = safeCart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    cartTotalEl.textContent = total.toLocaleString('en-IN');

    if (!safeCart.length) {
      cartItemsList.innerHTML = `
        <div class="empty-cart-card">
          <i class="fas fa-shopping-basket"></i>
          <h3>Your cart is empty</h3>
          <p>Add a book from the store to see it here.</p>
          <a href="index.html" class="auth-link">Continue shopping</a>
        </div>`;
      if (checkoutBtn) checkoutBtn.disabled = true;
      if (clearCartBtn) clearCartBtn.disabled = true;
      return;
    }

    cartItemsList.innerHTML = safeCart.map(item => `
      <article class="cart-item-card">
        <div class="cart-item-media">
          ${item.image ? `<img src="${item.image}" alt="${item.title}">` : '<div class="cart-item-placeholder"><i class="fas fa-book"></i></div>'}
        </div>
        <div class="cart-item-details">
          <h4>${item.title}</h4>
          <p>${item.author || 'General Collection'}</p>
          <div class="cart-item-meta">
            <span>₹${(Number(item.price) || 0).toLocaleString('en-IN')}</span>
            <span>${item.genre || 'Book'}</span>
          </div>
        </div>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button type="button" onclick="updateQuantity(${item.cartItemId || item.id}, -1, ${item.id})" aria-label="Decrease quantity">−</button>
            <strong>${item.quantity}</strong>
            <button type="button" onclick="updateQuantity(${item.cartItemId || item.id}, 1, ${item.id})" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="remove-btn" onclick="removeFromCart(${item.cartItemId || item.id}, ${item.id})">Remove</button>
          <button type="button" class="checkout-btn secondary" style="margin-top:0.5rem;" onclick="buyNowItem(${item.id})">Buy Now</button>
        </div>
        <div class="cart-item-total">₹${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}</div>
      </article>
    `).join('');

    if (checkoutBtn) checkoutBtn.disabled = false;
    if (clearCartBtn) clearCartBtn.disabled = false;
  } catch (error) {
    console.error('Unable to render cart page:', error);
    cartItemsList.innerHTML = '<p class="empty-cart-card">The cart could not be loaded. Please refresh the page.</p>';
  }

}

window.getCart = getCart;
window.saveCart = saveCart;
window.addToCartShared = addToCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.getCartTotal = getCartTotal;
window.clearCart = clearCart;
window.buyNowItem = buyNowItem;
window.renderCartPage = renderCartPage;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    renderCartPage();
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', clearCart);
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', async (event) => {
        event.preventDefault();

        const cart = await getDisplayedCart();
        if (!cart || !cart.length) {
          if (typeof showToast === 'function') showToast('Your cart is empty. Add a book first.', 'error');
          return;
        }

        if (typeof placeOrder === 'function') {
          const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
          const orderId = placeOrder({
            name: currentUser?.name || 'Guest Customer',
            email: currentUser?.email || 'guest@booknook.com',
            address: 'Cart checkout'
          });
          if (orderId) {
            if (typeof showToast === 'function') showToast(`Order placed successfully! Ref: ${orderId}`, 'success');
            window.location.href = 'orders.html';
          }
        } else if (typeof showToast === 'function') {
          showToast('Checkout is currently unavailable. Please try again later.', 'error');
        }
      });
    }

    window.addEventListener('cartUpdated', renderCartPage);
    window.addEventListener('storage', (event) => {
      if (event.key === 'booknook_cart' || event.key === 'cart') {
        renderCartPage();
      }
    });
  });
}