import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, subtotal, totalCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState(null);

  const FREE_SHIPPING_THRESHOLD = 499;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 50;
  const grandTotal = Math.max(0, subtotal - discount + shippingCost);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'BOOKNOOK10') {
      const discountVal = subtotal * 0.10;
      setDiscount(discountVal);
      setCouponMessage({ type: 'success', text: '10% promotional discount applied!' });
    } else if (code === 'FREESHIP') {
      setDiscount(shippingCost);
      setCouponMessage({ type: 'success', text: 'Free delivery voucher applied!' });
    } else {
      setCouponMessage({ type: 'error', text: 'Invalid coupon code. Try BOOKNOOK10' });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container empty-cart-page glass-card animate-fade-in">
        <div className="empty-cart-illustration">
          <i className="fas fa-cart-shopping fa-3x text-gold"></i>
        </div>
        <h1 className="empty-cart-heading">Your Shopping Cart is Empty</h1>
        <p className="empty-cart-subtext">
          Looks like you haven’t added any books to your bag yet. Discover our vast catalog of bestsellers, textbooks, and fiction!
        </p>
        <Link to="/shop" className="btn btn-gold btn-lg">
          <i className="fas fa-compass"></i> Explore Books Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page container animate-fade-in">
      <div className="cart-page-header">
        <h1 className="page-heading">Shopping Bag</h1>
        <p className="text-muted">You have {totalCount} books in your bag</p>
      </div>

      <div className="cart-layout-grid">
        {/* Left Column: Cart Items List */}
        <div className="cart-items-column glass-card">
          <div className="cart-table-header">
            <span>Book Description</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span>Action</span>
          </div>

          <div className="cart-items-rows">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-table-row">
                {/* Book Info */}
                <div className="item-meta-cell">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80'}
                    alt={item.productName}
                    className="item-table-img"
                  />
                  <div className="item-details">
                    <Link to={`/book/${item.productId}`} className="item-title-link">
                      <h4>{item.productName}</h4>
                    </Link>
                    <p className="item-author">by {item.productAuthor}</p>
                    <div className="item-unit-price">₹{parseFloat(item.productPrice).toFixed(2)}</div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="item-qty-cell">
                  <div className="quantity-counter">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>

                {/* Line Total */}
                <div className="item-total-cell font-semibold">
                  ₹{(item.productPrice * item.quantity).toFixed(2)}
                </div>

                {/* Delete Button */}
                <div className="item-action-cell">
                  <button
                    type="button"
                    className="item-delete-btn"
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                  >
                    <i className="fas fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-actions-footer">
            <button onClick={clearCart} className="btn btn-outline btn-sm text-danger">
              <i className="fas fa-trash"></i> Empty Cart
            </button>
            <Link to="/shop" className="btn btn-outline btn-sm">
              <i className="fas fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="cart-summary-column glass-card">
          <h3 className="summary-heading">Order Summary</h3>

          {/* Subtotal */}
          <div className="summary-row">
            <span>Items Subtotal</span>
            <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
          </div>

          {/* Shipping */}
          <div className="summary-row">
            <span>Estimated Shipping</span>
            <span>
              {shippingCost === 0 ? (
                <strong className="text-success">FREE</strong>
              ) : (
                `₹${shippingCost.toFixed(2)}`
              )}
            </span>
          </div>

          {/* Discount if applied */}
          {discount > 0 && (
            <div className="summary-row text-success">
              <span>Promo Discount</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-divider"></div>

          {/* Total */}
          <div className="summary-row total-row">
            <span>Grand Total</span>
            <span className="total-price text-gold">₹{grandTotal.toFixed(2)}</span>
          </div>

          {/* Coupon Input Form */}
          <form onSubmit={handleApplyCoupon} className="coupon-form">
            <input
              type="text"
              placeholder="Coupon code (e.g. BOOKNOOK10)"
              className="form-input coupon-input"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button type="submit" className="btn btn-outline btn-sm">Apply</button>
          </form>
          {couponMessage && (
            <p className={`coupon-msg ${couponMessage.type}`}>{couponMessage.text}</p>
          )}

          {/* Checkout CTA */}
          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-gold btn-lg w-full checkout-cta-btn"
            id="cart-proceed-checkout-btn"
          >
            Proceed to Checkout <i className="fas fa-shield-check"></i>
          </button>

          {/* Trust Guarantees */}
          <div className="checkout-trust-badges">
            <div><i className="fas fa-lock text-gold"></i> 256-bit Encrypted Checkout</div>
            <div><i className="fas fa-truck text-gold"></i> Free Shipping on orders over ₹499</div>
          </div>
        </div>
      </div>
    </div>
  );
}
