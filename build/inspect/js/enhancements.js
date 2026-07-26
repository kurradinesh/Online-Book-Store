/**
 * UI ENHANCEMENT SUITE
 * Handles UI feedback, Cart badge updates, Dark Mode, and Global Helpers.
 */

// 1. GLOBAL SECURITY: Escape HTML to prevent XSS attacks
window.escapeHtml = (str) => {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
};

// 2. TOAST NOTIFICATION SYSTEM
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}
window.showToast = showToast;

window.addEventListener('error', (event) => {
    console.error('Frontend runtime error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled cart promise error:', event.reason);
});

// 3. CART UI SYNC: Updates all cart badges on the page
function updateCartUI() {
    let cart = [];

    try {
        const rawCart = localStorage.getItem('booknook_cart') || localStorage.getItem('cart');
        const parsed = rawCart ? JSON.parse(rawCart) : [];
        cart = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Unable to update cart badge from storage:', error);
        cart = [];
    }

    const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const badgeTargets = [
        document.getElementById('cartCountBadge'),
        ...document.querySelectorAll('.cart-count-badge')
    ];

    badgeTargets.forEach((badge) => {
        if (!badge) return;
        badge.textContent = totalQty > 0 ? totalQty : '0';
        badge.style.display = totalQty > 0 ? 'inline-flex' : 'none';
    });

    const cartLabel = document.querySelector('[data-cart-label]');
    if (cartLabel) {
        cartLabel.textContent = totalQty > 0 ? `${totalQty} item${totalQty === 1 ? '' : 's'}` : 'Cart';
    }
}
window.updateCartUI = updateCartUI;

// 4. DEFENSIVE UI INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // A. Dark Mode Logic
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        const isDark = localStorage.getItem('darkMode') === 'enabled';
        if (isDark) document.body.classList.add('dark');
        
        darkToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        darkToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const nowDark = document.body.classList.contains('dark');
            localStorage.setItem('darkMode', nowDark ? 'enabled' : 'disabled');
            darkToggle.innerHTML = nowDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // B. Scroll to Top logic
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            scrollBtn.classList.toggle('show', window.scrollY > 400);
        });
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // C. Initial state update
    updateCartUI();
});