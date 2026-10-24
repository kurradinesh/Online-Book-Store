import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cartItems, subtotal, totalCount, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 499;
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer-panel glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="drawer-title-group">
            <i className="fas fa-shopping-bag text-gold"></i>
            <h3>Your Shopping Bag</h3>
            <span className="badge badge-gold">{totalCount} items</span>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="shipping-progress-box">
          <div className="shipping-progress-text">
            {remainingForFreeShipping === 0 ? (
              <span className="text-success font-semibold"><i className="fas fa-check-circle"></i> Congratulations! You unlocked Free Delivery!</span>
            ) : (
              <span>Add <strong>₹{remainingForFreeShipping}</strong> more to unlock <strong>Free Express Shipping</strong>!</span>
            )}
          </div>
          <div className="progress-bar-track">
            <div
              className={`progress-bar-fill ${remainingForFreeShipping === 0 ? 'bg-success' : 'bg-gold'}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Items List */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-cart-icon">
                <i className="fas fa-book-bookmark"></i>
              </div>
              <h4>Your bag is currently empty</h4>
              <p>Explore thousands of bestsellers, textbooks, and novels waiting for you.</p>
              <button
                className="btn btn-gold btn-sm"
                onClick={() => { setIsCartOpen(false); navigate('/shop'); }}
              >
                Browse Books Catalog
              </button>
            </div>
          ) : (
            <div className="drawer-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="drawer-item-row">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80'}
                    alt={item.productName}
                    className="drawer-item-img"
                  />
                  <div className="drawer-item-info">
                    <h5 className="drawer-item-title">{item.productName}</h5>
                    <div className="drawer-item-author">{item.productAuthor}</div>
                    <div className="drawer-item-price">₹{item.productPrice}</div>

                    <div className="drawer-item-controls">
                      {/* Quantity Selector */}
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

                      {/* Remove Button */}
                      <button
                        type="button"
                        className="drawer-item-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove book from cart"
                      >
                        <i className="fas fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="drawer-summary-row">
              <span>Subtotal</span>
              <span className="drawer-subtotal-price">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="drawer-summary-row text-muted text-sm">
              <span>Delivery</span>
              <span>{remainingForFreeShipping === 0 ? <strong className="text-success">FREE</strong> : '₹50.00'}</span>
            </div>

            <div className="drawer-footer-actions">
              <button
                className="btn btn-gold btn-lg w-full"
                onClick={handleCheckoutClick}
                id="drawer-checkout-btn"
              >
                Proceed to Checkout <i className="fas fa-arrow-right"></i>
              </button>
              <Link
                to="/cart"
                className="btn btn-outline btn-sm w-full"
                onClick={() => setIsCartOpen(false)}
                id="drawer-view-cart-link"
              >
                View Detailed Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
