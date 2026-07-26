<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · Shopping Cart</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-t6agcN+FgvxwtzOkw0KI+HcBNsQw+uOeQf7uD8yyqVcC3VwY2hZ3lY5yjui3Kog/9D1ZVoE5PZm6N+GpD1u4kg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
    <style>
        .cart-item-card {
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.18);
            background: #ffffff;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            padding: 1rem;
        }
        .cart-item-card:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06); }
        .cart-item-meta { color: #64748b; }
        .cart-summary-card { border-radius: 18px; border: 1px solid rgba(148, 163, 184, 0.18); background: #ffffff; }
    </style>
</head>
<body id="cartPage" data-page-title="Shopping Cart">
    <div class="container-fluid px-4 pb-5 page-shell">
        <div class="row gx-4 gy-4">
            <div class="col-lg-8">
                <div class="account-card" data-aos="fade-up">
                    <div class="account-card-header">
                        <div>
                            <div class="page-kicker">Checkout Ready</div>
                            <h3 class="mb-1">Shopping Cart</h3>
                            <p class="page-subtitle mb-0">Review your selections, adjust quantities, and proceed to checkout confidently.</p>
                        </div>
                        <span class="account-chip"><i class="fas fa-shopping-cart"></i> Flexible updates</span>
                    </div>
                    <div class="account-card-body">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <div>
                                <strong class="me-3">You have <span id="cartItemCount">0</span> items in your cart</strong>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn btn-outline-secondary btn-sm" onclick="window.location.href='../'" type="button">Continue Shopping</button>
                                <button class="btn account-btn-primary btn-sm" onclick="checkoutNow()">Checkout</button>
                            </div>
                        </div>
                        <div id="cartContent"></div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="cart-summary-card p-4" data-aos="fade-up" data-aos-delay="80">
                    <h5 class="mb-3">Order Summary</h5>
                    <div class="mb-3">
                        <label class="form-label small mb-2">Coupon code</label>
                        <div class="input-group">
                            <input id="couponCodeInput" type="text" class="form-control" placeholder="Enter code">
                            <button class="btn btn-outline-secondary" type="button">Apply</button>
                        </div>
                    </div>
                    <div class="detail-list mb-3">
                        <div class="detail-item"><span>Subtotal</span><strong id="cartSubtotal">₹0.00</strong></div>
                        <div class="detail-item"><span>Discount</span><strong id="cartDiscount">₹0.00</strong></div>
                        <div class="detail-item"><span>Shipping</span><strong id="cartShipping">₹0.00</strong></div>
                        <div class="detail-item"><span>GST</span><strong id="cartGst">₹0.00</strong></div>
                        <div class="detail-item"><span>Estimated total</span><strong id="cartTotal">₹0.00</strong></div>
                    </div>
                    <div class="mb-3">
                        <div class="text-muted small">Estimated delivery by</div>
                        <div class="fw-semibold">2-7 business days</div>
                    </div>
                    <button class="btn account-btn-primary w-100 mb-2" onclick="checkoutNow()">Proceed to Checkout</button>
                    <button class="btn btn-outline-secondary w-100" type="button">Save for Later</button>
                </div>
            </div>
        </div>
    </div>
    <div id="accountToastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1200;"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
    <script>AOS.init({ duration: 700, once: true });</script>
    <script src="../js/account.js"></script>
    <script>
        async function checkoutNow() {
            try {
                const resp = await fetch('../CheckoutServlet', { method: 'POST', credentials: 'same-origin' });
                if (resp.ok) {
                    window.location.href = '../pages/MyOrders.jsp';
                } else {
                    console.error('Checkout failed', resp.statusText);
                    alert('Checkout failed. Please try again later.');
                }
            } catch (err) {
                console.error('Checkout error', err);
                alert('Checkout failed. Please try again later.');
            }
        }
    </script>
</body>
</html>
