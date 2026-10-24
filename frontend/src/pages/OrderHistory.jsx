import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await api.orders.getMyOrders();
        if (res.data) setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <span className="badge badge-success"><i className="fas fa-check-circle"></i> Delivered</span>;
      case 'shipped':
        return <span className="badge badge-info"><i className="fas fa-truck-fast"></i> Shipped</span>;
      case 'processing':
        return <span className="badge badge-warning"><i className="fas fa-box"></i> Processing</span>;
      case 'cancelled':
        return <span className="badge badge-danger"><i className="fas fa-ban"></i> Cancelled</span>;
      default:
        return <span className="badge badge-gold"><i className="fas fa-clock"></i> Pending Confirmation</span>;
    }
  };

  if (loading) {
    return (
      <div className="container orders-loading">
        <i className="fas fa-spinner fa-spin fa-2x text-gold"></i>
        <p>Retrieving your order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container empty-cart-page glass-card animate-fade-in">
        <div className="empty-cart-illustration">
          <i className="fas fa-box-open fa-3x text-gold"></i>
        </div>
        <h1 className="empty-cart-heading">No Orders Placed Yet</h1>
        <p className="empty-cart-subtext">You haven’t ordered any books yet. Once you place an order, you can track delivery here!</p>
        <Link to="/shop" className="btn btn-gold btn-lg">Browse Library</Link>
      </div>
    );
  }

  return (
    <div className="orders-page container animate-fade-in">
      <div className="orders-header">
        <h1 className="page-heading">Your Order History</h1>
        <p className="text-muted">Review and track all your past and current book purchases</p>
      </div>

      <div className="orders-list-grid">
        {orders.map((order) => (
          <div key={order.id} className="order-summary-card glass-card">
            <div className="order-card-header">
              <div className="order-id-group">
                <span className="order-label">ORDER</span>
                <span className="order-number font-bold">#{order.id}</span>
                <span className="order-date text-muted text-sm">
                  • {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                </span>
              </div>
              <div className="order-status-badge">
                {getStatusBadge(order.status)}
              </div>
            </div>

            <div className="order-card-body">
              <div className="order-stat-item">
                <span className="stat-label">Total Amount</span>
                <span className="stat-value text-gold font-bold">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
              <div className="order-stat-item">
                <span className="stat-label">Payment Method</span>
                <span className="stat-value">{order.paymentMethod} ({order.paymentStatus})</span>
              </div>
              <div className="order-stat-item">
                <span className="stat-label">Tracking Number</span>
                <span className="stat-value font-mono">{order.trackingCode || 'Generating...'}</span>
              </div>
            </div>

            <div className="order-card-footer">
              <Link to={`/order/${order.id}`} className="btn btn-outline btn-sm">
                View Order Details <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
