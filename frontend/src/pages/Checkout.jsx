import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Checkout() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address form inputs
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    recipient: user?.name || '',
    phone: user?.mobileNumber || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    isDefault: true,
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or CARD or UPI
  const [cardDetails, setCardDetails] = useState({ number: '4532 •••• •••• 8821', exp: '12/28', cvv: '782' });
  const [upiId, setUpiId] = useState('user@okaxis');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load user saved addresses
  useEffect(() => {
    async function loadAddresses() {
      if (isAuthenticated) {
        try {
          const res = await api.addresses.getAll();
          if (res.data && res.data.length > 0) {
            setAddresses(res.data);
            const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
            setSelectedAddressId(defaultAddr.id);
          } else {
            setShowNewAddressForm(true);
          }
        } catch (err) {
          console.error("Address fetch failed:", err);
          setShowNewAddressForm(true);
        }
      } else {
        setShowNewAddressForm(true);
      }
    }
    loadAddresses();
  }, [isAuthenticated]);

  const FREE_SHIPPING_THRESHOLD = 499;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + shippingCost;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    let payload = {
      paymentMethod: paymentMethod,
    };

    if (selectedAddressId && !showNewAddressForm) {
      payload.addressId = selectedAddressId;
    } else {
      // Validate new address form
      if (!newAddress.recipient || !newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.zip) {
        setErrorMsg("Please complete all required delivery address fields.");
        return;
      }
      payload.recipient = newAddress.recipient;
      payload.phone = newAddress.phone;
      payload.line1 = newAddress.line1;
      payload.line2 = newAddress.line2;
      payload.city = newAddress.city;
      payload.state = newAddress.state;
      payload.zip = newAddress.zip;
    }

    setIsSubmitting(true);
    try {
      const res = await api.checkout.process(payload);
      if (res.data) {
        setOrderSuccess(res.data);
        clearCart();
      }
    } catch (err) {
      setErrorMsg(err.message || "Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="container order-success-page animate-fade-in">
        <div className="order-success-card glass-card">
          <div className="success-icon-box">
            <i className="fas fa-circle-check text-success fa-3x"></i>
          </div>
          <h1 className="success-heading">Order Placed Successfully!</h1>
          <p className="success-subtext">
            Thank you for shopping with BookNook! We have received your order and are preparing it for shipment.
          </p>

          <div className="order-meta-box">
            <div className="order-meta-item">
              <span className="label">Order ID:</span>
              <span className="value">#{orderSuccess.id}</span>
            </div>
            <div className="order-meta-item">
              <span className="label">Tracking Code:</span>
              <span className="value text-gold font-bold">{orderSuccess.trackingCode}</span>
            </div>
            <div className="order-meta-item">
              <span className="label">Total Amount:</span>
              <span className="value font-bold">₹{parseFloat(orderSuccess.totalAmount).toFixed(2)}</span>
            </div>
            <div className="order-meta-item">
              <span className="label">Payment Mode:</span>
              <span className="value badge badge-gold">{orderSuccess.paymentMethod}</span>
            </div>
          </div>

          <div className="success-actions-row">
            <Link to={`/order/${orderSuccess.id}`} className="btn btn-gold btn-lg">
              <i className="fas fa-truck-ramp-box"></i> Track Order Details
            </Link>
            <Link to="/shop" className="btn btn-outline btn-lg">
              <i className="fas fa-compass"></i> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container animate-fade-in">
      <div className="checkout-header">
        <h1 className="page-heading">Secure Checkout</h1>
        <p className="text-muted"><i className="fas fa-lock text-gold"></i> SSL Encrypted & Verified Transaction</p>
      </div>

      {errorMsg && (
        <div className="alert-banner alert-danger">
          <i className="fas fa-triangle-exclamation"></i> {errorMsg}
        </div>
      )}

      <div className="checkout-grid">
        {/* Left Column: Form Steps */}
        <div className="checkout-steps-column">
          {/* Step 1: Shipping Address */}
          <section className="checkout-step-card glass-card">
            <div className="step-title-row">
              <span className="step-number">1</span>
              <h3>Delivery Shipping Address</h3>
            </div>

            {/* Saved Addresses Picker */}
            {addresses.length > 0 && (
              <div className="saved-addresses-list">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`address-option-card ${selectedAddressId === addr.id && !showNewAddressForm ? 'selected' : ''}`}
                    onClick={() => { setSelectedAddressId(addr.id); setShowNewAddressForm(false); }}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddressId === addr.id && !showNewAddressForm}
                      onChange={() => { setSelectedAddressId(addr.id); setShowNewAddressForm(false); }}
                    />
                    <div className="address-card-body">
                      <div className="address-label-badge badge badge-gold">{addr.label}</div>
                      <div className="address-recipient font-bold">{addr.recipient}</div>
                      <div className="address-phone text-muted text-sm">{addr.phone}</div>
                      <div className="address-text">{addr.line1}, {addr.city}, {addr.state} - {addr.zip}</div>
                    </div>
                  </label>
                ))}

                <button
                  type="button"
                  className="btn btn-outline btn-sm add-address-toggle"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                >
                  <i className={`fas ${showNewAddressForm ? 'fa-minus' : 'fa-plus'}`}></i> {showNewAddressForm ? 'Use Saved Address' : 'Deliver to a New Address'}
                </button>
              </div>
            )}

            {/* New Address Input Form */}
            {showNewAddressForm && (
              <div className="new-address-form-box">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Recipient Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newAddress.recipient}
                      onChange={(e) => setNewAddress({ ...newAddress, recipient: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Mobile Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Flat / House No. / Street Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newAddress.line1}
                    onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal PIN Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newAddress.zip}
                      onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Step 2: Payment Method */}
          <section className="checkout-step-card glass-card">
            <div className="step-title-row">
              <span className="step-number">2</span>
              <h3>Choose Payment Method</h3>
            </div>

            <div className="payment-options-group">
              {/* Cash on Delivery */}
              <label className={`payment-card ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMode"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <div className="payment-icon"><i className="fas fa-hand-holding-dollar text-gold"></i></div>
                <div className="payment-info">
                  <h4>Cash on Delivery (COD)</h4>
                  <p>Pay in cash or UPI scan when your books arrive at your doorstep.</p>
                </div>
              </label>

              {/* Credit / Debit Card (Sandbox) */}
              <label className={`payment-card ${paymentMethod === 'CARD' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMode"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                />
                <div className="payment-icon"><i className="fas fa-credit-card text-gold"></i></div>
                <div className="payment-info">
                  <h4>Credit / Debit Card (Sandbox Demo)</h4>
                  <p>Instant secure payment simulation via Visa / MasterCard.</p>
                </div>
              </label>

              {paymentMethod === 'CARD' && (
                <div className="sandbox-card-inputs glass-card">
                  <div className="form-group">
                    <label className="form-label">Card Number (Sandbox Demo)</label>
                    <input type="text" className="form-input" value={cardDetails.number} readOnly />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Expiry Date</label>
                      <input type="text" className="form-input" value={cardDetails.exp} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input type="text" className="form-input" value={cardDetails.cvv} readOnly />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI / QR Code (Sandbox) */}
              <label className={`payment-card ${paymentMethod === 'UPI' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMode"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                />
                <div className="payment-icon"><i className="fas fa-qrcode text-gold"></i></div>
                <div className="payment-info">
                  <h4>UPI Instant Payment (GPay, PhonePe, Paytm)</h4>
                  <p>Pay via your preferred UPI app or QR code scanning.</p>
                </div>
              </label>

              {paymentMethod === 'UPI' && (
                <div className="sandbox-card-inputs glass-card">
                  <div className="form-group">
                    <label className="form-label">Virtual Payment Address (VPA)</label>
                    <input type="text" className="form-input" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Order Items Review & Final Submission */}
        <div className="checkout-summary-column glass-card">
          <h3 className="summary-heading">Review Order ({cartItems.length} items)</h3>

          <div className="checkout-items-preview">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-preview-item">
                <img src={item.productImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80'} alt={item.productName} />
                <div className="item-text">
                  <h5>{item.productName}</h5>
                  <div className="item-qty-price">Qty: {item.quantity} × ₹{item.productPrice}</div>
                </div>
                <div className="item-subtotal">₹{(item.productPrice * item.quantity).toFixed(0)}</div>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shippingCost === 0 ? <strong className="text-success">FREE</strong> : `₹${shippingCost.toFixed(2)}`}</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total-row">
            <span>Total Payable</span>
            <span className="total-price text-gold">₹{grandTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting || cartItems.length === 0}
            className="btn btn-gold btn-lg w-full checkout-submit-btn"
            id="place-order-btn"
          >
            {isSubmitting ? (
              <><i className="fas fa-spinner fa-spin"></i> Processing Order...</>
            ) : (
              <><i className="fas fa-lock"></i> Place Order (₹{grandTotal.toFixed(0)})</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
