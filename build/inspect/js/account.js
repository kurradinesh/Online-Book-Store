document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('account-dashboard');
    const pageTitle = document.body.getAttribute('data-page-title');
    if (pageTitle) {
        document.getElementById('pageTitle').textContent = pageTitle;
    }

    const themeToggle = document.getElementById('accountThemeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('theme-light');
            localStorage.setItem('accountTheme', document.body.classList.contains('theme-light') ? 'light' : 'dark');
        });
        const savedTheme = localStorage.getItem('accountTheme');
        if (savedTheme === 'light') document.body.classList.add('theme-light');
    }

    if (document.body.id === 'cartPage') {
        loadCartItems();
    }
    if (document.body.id === 'wishlistPage') {
        loadWishlist();
    }
    if (document.body.id === 'ordersPage') {
        loadOrders();
    }
    if (document.body.id === 'accountSettingsPage') {
        loadProfile();
    }
    if (document.body.id === 'addressBookPage') {
        loadAddresses();
    }
    if (document.body.id === 'helpCenterPage') {
        attachHelpForms();
    }
});

function fetchJSON(url, options) {
    return fetch(url, options).then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    });
}

function showAccountToast(message, type = 'success') {
    const container = document.getElementById('accountToastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} account-toast shadow-sm rounded-4 animate__animated animate__fadeInUp`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('animate__fadeOutDown');
        toast.addEventListener('animationend', () => toast.remove());
    }, 2500);
}

function loadCartItems() {
    fetchJSON('../CartServlet?action=list')
        .then(data => {
            const container = document.getElementById('cartContent');
            const subtotal = document.getElementById('cartSubtotal');
            if (!data.items || data.items.length === 0) {
                container.innerHTML = `<div class="account-empty-state text-center">` +
                    `<div class="icon-circle"><i class="fas fa-shopping-cart"></i></div>` +
                    `<h4>No items in your cart yet</h4>` +
                    `<p class="account-tagline">Browse the store and add products for a faster checkout experience.</p>` +
                    `</div>`;
                subtotal.textContent = '₹0.00';
                return;
            }
            container.innerHTML = data.items.map(item => `
                <div class="card account-card mb-3 p-3 border-0">
                    <div class="row g-3 align-items-center">
                        <div class="col-3 col-md-2">
                            <img src="${item.coverUrl}" class="img-fluid rounded-3" alt="${item.title}">
                        </div>
                        <div class="col-9 col-md-6">
                            <h5 class="mb-1 text-white">${item.title}</h5>
                            <p class="mb-1 text-muted small">${item.author}</p>
                            <span class="badge bg-secondary">${item.category}</span>
                        </div>
                        <div class="col-12 col-md-4 d-flex flex-column gap-2">
                            <div class="d-flex align-items-center justify-content-between">
                                <span class="fw-semibold">₹${item.unitPrice.toFixed(2)}</span>
                                <button class="btn btn-sm btn-outline-danger" onclick="removeCartItem(${item.cartId})"><i class="fas fa-trash-alt"></i> Remove</button>
                            </div>
                            <div class="input-group input-group-sm w-100">
                                <button class="btn btn-outline-light" type="button" onclick="updateCartQuantity(${item.cartId}, ${item.quantity - 1})"><i class="fas fa-minus"></i></button>
                                <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                                <button class="btn btn-outline-light" type="button" onclick="updateCartQuantity(${item.cartId}, ${item.quantity + 1})"><i class="fas fa-plus"></i></button>
                            </div>
                            <button class="btn btn-sm account-btn-glow w-100" onclick="buyNow(${item.cartId})">Buy Now</button>
                        </div>
                    </div>
                </div>`).join('');
            subtotal.textContent = `₹${data.total.toFixed(2)}`;
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function updateCartQuantity(cartId, quantity) {
    if (quantity < 1) return removeCartItem(cartId);
    fetchJSON('../CartServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', cartId, quantity })
    })
        .then(() => {
            loadCartItems();
            showAccountToast('Cart updated instantly');
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function removeCartItem(cartId) {
    fetchJSON('../CartServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', cartId })
    })
        .then(() => {
            loadCartItems();
            showAccountToast('Item removed from cart');
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function buyNow(cartId) {
    fetchJSON('../CartServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'buy', cartId })
    })
        .then(data => {
            loadCartItems();
            showAccountToast(data.message || 'Purchase successful');
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function loadWishlist() {
    fetchJSON('../WishlistServlet?action=list')
        .then(data => {
            const container = document.getElementById('wishlistContent');
            if (!data.items || data.items.length === 0) {
                container.innerHTML = `<div class="account-empty-state text-center">` +
                    `<div class="icon-circle"><i class="fas fa-heart"></i></div>` +
                    `<h4>Your wishlist is waiting</h4>` +
                    `<p class="account-tagline">Save favorite books and move them to cart when ready.</p>` +
                    `</div>`;
                return;
            }
            container.innerHTML = data.items.map(item => `
                <div class="card account-card mb-3 p-3 border-0">
                    <div class="row g-3 align-items-center">
                        <div class="col-3 col-md-2">
                            <img src="${item.coverUrl}" class="img-fluid rounded-3" alt="${item.title}">
                        </div>
                        <div class="col-9 col-md-6">
                            <h5 class="mb-1 text-white">${item.title}</h5>
                            <p class="mb-1 text-muted small">${item.author}</p>
                        </div>
                        <div class="col-12 col-md-4 d-flex flex-column gap-2">
                            <span class="fw-semibold">₹${item.unitPrice.toFixed(2)}</span>
                            <button class="btn btn-sm account-btn-glow w-100" onclick="moveWishlistToCart(${item.wishlistId})">Move to Cart</button>
                            <button class="btn btn-sm btn-outline-danger w-100" onclick="removeWishlistItem(${item.wishlistId})">Remove</button>
                        </div>
                    </div>
                </div>`).join('');
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function removeWishlistItem(wishlistId) {
    fetchJSON('../WishlistServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', wishlistId })
    })
        .then(() => {
            loadWishlist();
            showAccountToast('Removed from wishlist');
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function moveWishlistToCart(wishlistId) {
    fetchJSON('../WishlistServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move', wishlistId })
    })
        .then(() => {
            loadWishlist();
            showAccountToast('Moved to cart');
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function loadOrders() {
    fetchJSON('../OrdersServlet?action=list')
        .then(data => {
            const container = document.getElementById('ordersContent');
            if (!data.orders || data.orders.length === 0) {
                container.innerHTML = `<div class="account-empty-state text-center">` +
                    `<div class="icon-circle"><i class="fas fa-box-open"></i></div>` +
                    `<h4>No order history yet</h4>` +
                    `<p class="account-tagline">Complete a purchase to see order tracking details here.</p>` +
                    `</div>`;
                return;
            }
            container.innerHTML = data.orders.map(order => `
                <div class="card account-card mb-3 p-3 border-0">
                    <div class="d-flex flex-column flex-md-row justify-content-between gap-3">
                        <div>
                            <div class="text-muted small mb-2">Order #${order.orderId} • ${order.orderedAt}</div>
                            <h5 class="mb-1 text-white">${order.trackingCode}</h5>
                            <p class="mb-0 text-muted">${order.statusLabel}</p>
                        </div>
                        <div class="d-flex flex-column gap-2 align-items-start align-items-md-end">
                            <span class="account-status-pill ${order.statusClass}">${order.status}</span>
                            <span class="fw-semibold">₹${order.totalAmount.toFixed(2)}</span>
                            <button class="btn btn-sm btn-outline-light" onclick="window.location.href='OrderDetails.jsp?orderId=${order.orderId}'">Track Order</button>
                        </div>
                    </div>
                </div>`).join('');
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function loadProfile() {
    fetchJSON('../ProfileServlet?action=view')
        .then(data => {
            document.getElementById('profileName').value = data.name || '';
            document.getElementById('profileEmail').value = data.email || '';
            document.getElementById('profileRole').value = data.role || 'customer';
            document.getElementById('profileAvatarPreview').textContent = data.initials || 'BK';
            if (data.avatarUrl) {
                document.getElementById('profileAvatarImage').src = data.avatarUrl;
                document.getElementById('profileAvatarImage').classList.remove('d-none');
            }
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function saveProfile(event) {
    event.preventDefault();
    const form = document.getElementById('profileForm');
    const formData = new FormData(form);
    fetch('../ProfileServlet', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showAccountToast('Profile updated successfully');
                if (data.avatarUrl) {
                    document.getElementById('profileAvatarImage').src = data.avatarUrl;
                    document.getElementById('profileAvatarImage').classList.remove('d-none');
                }
            } else {
                showAccountToast(data.message || 'Unable to save profile', 'danger');
            }
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function changePassword(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (newPassword !== confirmPassword) {
        showAccountToast('Passwords do not match', 'danger');
        return;
    }
    fetchJSON('../ProfileServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'changePassword', currentPassword, newPassword })
    })
        .then(data => {
            showAccountToast(data.message || 'Password updated');
            if (data.success) document.getElementById('passwordForm').reset();
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function loadAddresses() {
    fetchJSON('../AddressServlet?action=list')
        .then(data => {
            const container = document.getElementById('addressList');
            if (!data.addresses || data.addresses.length === 0) {
                container.innerHTML = `<div class="account-empty-state text-center">` +
                    `<div class="icon-circle"><i class="fas fa-map-marker-alt"></i></div>` +
                    `<h4>No saved addresses yet</h4>` +
                    `<p class="account-tagline">Add an address for faster checkout and delivery.</p>` +
                    `</div>`;
                return;
            }
            container.innerHTML = data.addresses.map(addr => `
                <div class="card account-card mb-3 p-3 border-0">
                    <div class="d-flex justify-content-between flex-column flex-md-row gap-3">
                        <div>
                            <div class="fw-semibold text-white">${addr.label} ${addr.isDefault ? '<span class="badge bg-warning text-dark">Default</span>' : ''}</div>
                            <p class="mb-1 text-muted">${addr.recipient}</p>
                            <p class="mb-1 text-muted">${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}</p>
                            <p class="mb-0 text-muted">${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}</p>
                        </div>
                        <div class="d-flex gap-2 flex-wrap align-items-center">
                            <button class="btn btn-sm btn-outline-light" onclick="editAddress(${addr.addressId})">Edit</button>
                            <button class="btn btn-sm btn-outline-warning" onclick="setDefaultAddress(${addr.addressId})">Set Default</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteAddress(${addr.addressId})">Delete</button>
                        </div>
                    </div>
                </div>`).join('');
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function showAddressForm(address) {
    const form = document.getElementById('addressForm');
    form.addressId.value = address ? address.addressId : '';
    form.label.value = address ? address.label : '';
    form.recipient.value = address ? address.recipient : '';
    form.line1.value = address ? address.line1 : '';
    form.line2.value = address ? address.line2 : '';
    form.city.value = address ? address.city : '';
    form.state.value = address ? address.state : '';
    form.zip.value = address ? address.zip : '';
    form.country.value = address ? address.country : '';
    document.getElementById('addressFormTitle').textContent = address ? 'Edit Address' : 'Add New Address';
    document.getElementById('addressSubmitButton').textContent = address ? 'Save Changes' : 'Add Address';
    window.scrollTo({ top: form.offsetTop - 90, behavior: 'smooth' });
}

function addAddress(event) {
    event.preventDefault();
    const form = document.getElementById('addressForm');
    const payload = Object.fromEntries(new FormData(form).entries());
    fetchJSON('../AddressServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(() => {
            loadAddresses();
            form.reset();
            showAccountToast('Address saved');
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function deleteAddress(addressId) {
    fetchJSON('../AddressServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', addressId })
    })
        .then(() => {
            loadAddresses();
            showAccountToast('Address deleted');
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function setDefaultAddress(addressId) {
    fetchJSON('../AddressServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'default', addressId })
    })
        .then(() => {
            loadAddresses();
            showAccountToast('Default address updated');
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function editAddress(addressId) {
    fetchJSON(`../AddressServlet?action=view&addressId=${addressId}`)
        .then(data => {
            if (data.address) showAddressForm(data.address);
        })
        .catch(err => showAccountToast(err.message, 'danger'));
}

function attachHelpForms() {
    const contactForm = document.getElementById('contactSupportForm');
    const reportForm = document.getElementById('reportIssueForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const payload = Object.fromEntries(new FormData(contactForm).entries());
            fetchJSON('../HelpCenterServlet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'contact', ...payload }) })
                .then(() => showAccountToast('Support request submitted'))
                .catch(err => showAccountToast(err.message, 'danger'));
        });
    }
    if (reportForm) {
        reportForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const payload = Object.fromEntries(new FormData(reportForm).entries());
            fetchJSON('../HelpCenterServlet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'report', ...payload }) })
                .then(() => showAccountToast('Issue report submitted'))
                .catch(err => showAccountToast(err.message, 'danger'));
        });
    }
}
