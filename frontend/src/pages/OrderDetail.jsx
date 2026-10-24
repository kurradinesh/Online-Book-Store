import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function OrderDetail() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await api.orders.getDetails(id);
        if (res.data) setOrderData(res.data);
      } catch (err) {
        console.error("Order details fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? Book inventory will be returned to the store.")) return;
    setCancelling(true);
    try {
      const res = await api.orders.cancel(id);
      if (res.data) {
        setOrderData(prev => ({
          ...prev,
          order: { ...prev.order, status: 'Cancelled' }
        }));
        alert("Order has been cancelled successfully.");
      }
    } catch (err) {
      alert("Failed to cancel order: " + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const copyTracking = () => {
    if (orderData?.order?.trackingCode) {
      navigator.clipboard.writeText(orderData.order.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container orders-loading">
        <i className="fas fa-spinner fa-spin fa-2x text-gold"></i>
        <p>Loading order breakdown...</p>
      </div>
    );
  }

  if (!orderData || !orderData.order) {
    return (
      <div className="container empty-state-box glass-card animate-fade-in">
        <h2>Order Not Found</h2>
        <p>Could not locate the requested order details.</p>
        <Link to="/orders" className="btn btn-gold btn-sm">Return to Orders</Link>
      </div>
    );
  }

  const { order, items } = orderData;

  // Timeline Step Status
  const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStatus = order.status || 'Pending';
  const isCancelled = currentStatus.toLowerCase() === 'cancelled';

  const getStepIndex = (status) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'shipped') return 2;
    if (s === 'processing') return 1;
    return 0;
  };

  const currentStepIndex = getStepIndex(currentStatus);

  return (
    <div className="order-detail-page container animate-fade-in">
      {/* Back button */}
      <div className="order-detail-top-nav">
        <Link to="/orders" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to all orders
        </Link>
        <span className="order-badge-status">
          Status: <strong className="text-gold">{order.status}</strong>
        </span>
      </div>

      {/* Header Banner */}
      <div className="order-detail-header-card glass-card">
        <div className="order-title-block">
          <h1>Order #{order.id}</h1>
          <p className="text-muted">
            Placed on {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently'}
          </p>
        </div>

        <div className="tracking-pill-box">
          <span className="tracking-label">Tracking Code:</span>
          <span className="tracking-value font-mono">{order.trackingCode || 'Pending'}</span>
          {order.trackingCode && (
            <button onClick={copyTracking} className="copy-btn" title="Copy tracking code">
              <i className={`fas ${copied ? 'fa-check text-success' : 'fa-copy'}`}></i>
            </button>
          )}
        </div>
      </div>

      {/* Timeline Shipment Progress */}
      <div className="shipment-timeline-card glass-card">
        <h3 className="timeline-heading"><i className="fas fa-truck-ramp-box text-gold"></i> Delivery Timeline</h3>

        {isCancelled ? (
          <div className="cancelled-timeline-notice">
            <i className="fas fa-ban text-danger fa-2x"></i>
            <div>
              <h4>Order Cancelled</h4>
              <p className="text-muted">This order was cancelled. No charges were deducted or payment will be refunded.</p>
            </div>
          </div>
        ) : (
          <div className="timeline-steps-track">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="step-circle">
                    {isCompleted ? <i className="fas fa-check"></i> : idx + 1}
                  </div>
                  <div className="step-label">{step}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Ordered Items & Delivery Summary */}
      <div className="order-detail-grid">
        {/* Ordered Items List */}
        <div className="order-items-column glass-card">
          <h3 className="section-title-sm">Items in this Delivery ({items?.length || 0})</h3>

          <div className="order-items-detail-list">
            {items?.map((item) => (
              <div key={item.id} className="order-detail-item-row">
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80'}
                  alt={item.productName}
                  className="detail-item-thumb"
                />
                <div className="detail-item-info">
                  <Link to={`/book/${item.productId}`}>
                    <h4>{item.productName}</h4>
                  </Link>
                  <p className="text-muted text-sm">by {item.productAuthor}</p>
                  <div className="detail-item-meta">
                    <span>Qty: <strong>{item.quantity}</strong></span>
                    <span>Price: <strong>₹{item.productPrice}</strong></span>
                  </div>
                </div>
                <div className="detail-item-total font-bold">
                  ₹{(item.productPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {order.status === 'Pending' && (
            <div className="cancel-order-box">
              <button
                type="button"
                className="btn btn-outline btn-sm text-danger"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : <><i className="fas fa-xmark"></i> Cancel Order</>}
              </button>
            </div>
          )}
        </div>

        {/* Shipping & Payment Summary */}
        <div className="order-sidebar-column">
          {/* Shipping Address */}
          <div className="order-info-card glass-card">
            <h4><i className="fas fa-location-dot text-gold"></i> Shipping Address</h4>
            <div className="address-display">
              <p className="font-bold">{order.shippingRecipient || 'Customer'}</p>
              <p className="text-muted">{order.shippingPhone}</p>
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}, {order.shippingState} - {order.shippingZip}</p>
            </div>
          </div>

          {/* Payment & Charges Breakdown */}
          <div className="order-info-card glass-card">
            <h4><i className="fas fa-receipt text-gold"></i> Payment Details</h4>
            <div className="summary-row">
              <span>Payment Mode</span>
              <span className="badge badge-gold">{order.paymentMethod}</span>
            </div>
            <div className="summary-row">
              <span>Payment Status</span>
              <span>{order.paymentStatus}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span>Total Paid</span>
              <span className="text-gold font-bold">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
