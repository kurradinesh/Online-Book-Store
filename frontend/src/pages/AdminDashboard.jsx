import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, books, orders, users
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Books tab state
  const [adminBooks, setAdminBooks] = useState([]);
  const [bookSearch, setBookSearch] = useState('');
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    price: '',
    genre: 'Self-help',
    imageUrl: '',
    stock: 25,
    description: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Orders tab state
  const [adminOrders, setAdminOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [statusUpdateInput, setStatusUpdateInput] = useState('');

  // Users tab state
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      alert("Access Denied: Administrator role required.");
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes, booksRes] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getOrders(),
        api.admin.getUsers(),
        api.admin.getBooks({ size: 100 }),
      ]);
      if (statsRes.data) setAnalytics(statsRes.data);
      if (ordersRes.data) setAdminOrders(ordersRes.data);
      if (usersRes.data) setAdminUsers(usersRes.data);
      if (booksRes.data) setAdminBooks(booksRes.data.content || []);
    } catch (err) {
      console.error("Admin dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Book CRUD Operations ---
  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...bookForm,
        price: parseFloat(bookForm.price),
        stock: parseInt(bookForm.stock, 10),
      };
      if (editingBook) {
        await api.admin.updateBook(editingBook.id, payload);
        alert("Book updated successfully!");
      } else {
        await api.admin.addBook(payload);
        alert("Book created successfully!");
      }
      setBookModalOpen(false);
      setEditingBook(null);
      await loadDashboardData();
    } catch (err) {
      alert("Error saving book: " + err.message);
    }
  };

  const handleDeleteBook = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.admin.deleteBook(id);
      await loadDashboardData();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setUploadSuccessMsg('');
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.admin.uploadImage(formData);
      if (res.data?.imageUrl) {
        setBookForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
        setUploadSuccessMsg(`Image "${file.name}" uploaded permanently!`);
      }
    } catch (err) {
      alert("Failed to upload image: " + err.message);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // --- Order Management ---
  const handleViewOrder = async (orderId) => {
    try {
      const res = await api.admin.getOrderDetails(orderId);
      if (res.data) {
        setSelectedOrderDetail(res.data);
        setStatusUpdateInput(res.data.order.status);
        setTrackingCodeInput(res.data.order.trackingCode || '');
        setOrderModalOpen(true);
      }
    } catch (err) {
      alert("Failed to load order: " + err.message);
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrderDetail) return;
    try {
      await api.admin.updateOrderStatus(selectedOrderDetail.order.id, {
        status: statusUpdateInput,
        trackingCode: trackingCodeInput,
      });
      alert("Order status updated!");
      setOrderModalOpen(false);
      await loadDashboardData();
    } catch (err) {
      alert("Failed to update order: " + err.message);
    }
  };

  // --- User Role Management ---
  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole?.toLowerCase() === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Change user role from ${currentRole} to ${newRole}?`)) return;
    try {
      await api.admin.updateUserRole(userId, newRole);
      await loadDashboardData();
    } catch (err) {
      alert("Role update failed: " + err.message);
    }
  };

  // Filtered lists
  const filteredBooks = adminBooks.filter(b =>
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.genre?.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const filteredOrders = adminOrders.filter(o =>
    orderFilter === 'ALL' ? true : o.status?.toUpperCase() === orderFilter
  );

  if (loading) {
    return (
      <div className="container orders-loading">
        <i className="fas fa-spinner fa-spin fa-2x text-gold"></i>
        <p>Loading administrative telemetry...</p>
      </div>
    );
  }

  return (
    <div className="admin-page container animate-fade-in">
      {/* Top Header */}
      <div className="admin-header-row">
        <div>
          <span className="badge badge-gold"><i className="fas fa-shield-halved"></i> SECURE CONTROL CENTER</span>
          <h1 className="page-heading">Administrator Dashboard</h1>
          <p className="text-muted">Welcome, {user?.name}. Manage book inventory, process orders, and review sales analytics.</p>
        </div>

        <div className="admin-quick-actions">
          <button
            onClick={() => {
              setEditingBook(null);
              setBookForm({
                title: '',
                author: '',
                price: '',
                genre: 'Self-help',
                imageUrl: '',
                stock: 25,
                description: '',
              });
              setImagePreview(null);
              setUploadSuccessMsg('');
              setBookModalOpen(true);
            }}
            className="btn btn-gold btn-sm"
          >
            <i className="fas fa-plus"></i> Add New Book
          </button>
          <Link to="/" className="btn btn-outline btn-sm">
            <i className="fas fa-arrow-up-right-from-square"></i> View Storefront
          </Link>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="admin-tabs-bar glass-card">
        <button
          className={`admin-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-chart-pie"></i> Business Overview
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          <i className="fas fa-book"></i> Book Catalog ({adminBooks.length})
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <i className="fas fa-boxes-stacked"></i> Customer Orders ({adminOrders.length})
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fas fa-users-gear"></i> User Accounts ({adminUsers.length})
        </button>
      </div>

      {/* Tab 1: Business Analytics Overview */}
      {activeTab === 'overview' && (
        <div className="admin-tab-section animate-fade-in">
          {/* Key Metric KPI Cards */}
          <div className="admin-kpi-grid">
            <div className="kpi-card glass-card">
              <div className="kpi-icon-box bg-gold-subtle"><i className="fas fa-indian-rupee-sign text-gold"></i></div>
              <div className="kpi-content">
                <span className="kpi-label">Total Revenue</span>
                <h3 className="kpi-value text-gold">₹{parseFloat(analytics?.totalRevenue || 0).toFixed(2)}</h3>
              </div>
            </div>

            <div className="kpi-card glass-card">
              <div className="kpi-icon-box bg-primary-subtle"><i className="fas fa-cart-check"></i></div>
              <div className="kpi-content">
                <span className="kpi-label">Completed Orders</span>
                <h3 className="kpi-value">{analytics?.totalOrders || 0}</h3>
              </div>
            </div>

            <div className="kpi-card glass-card">
              <div className="kpi-icon-box bg-gold-subtle"><i className="fas fa-book-bookmark text-gold"></i></div>
              <div className="kpi-content">
                <span className="kpi-label">Active Book Titles</span>
                <h3 className="kpi-value">{analytics?.totalBooks || 0}</h3>
              </div>
            </div>

            <div className="kpi-card glass-card">
              <div className="kpi-icon-box bg-primary-subtle"><i className="fas fa-triangle-exclamation text-warning"></i></div>
              <div className="kpi-content">
                <span className="kpi-label">Low Stock Alerts (&lt;10)</span>
                <h3 className="kpi-value text-warning">{analytics?.lowStockCount || 0}</h3>
              </div>
            </div>
          </div>

          {/* Recent Orders Feed */}
          <div className="admin-card-section glass-card">
            <div className="section-header-inline">
              <h3><i className="fas fa-clock-rotate-left text-gold"></i> Recent Orders Feed</h3>
              <button onClick={() => setActiveTab('orders')} className="view-more-link">
                View all orders <i className="fas fa-arrow-right"></i>
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Email</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminOrders.slice(0, 8).map((ord) => (
                    <tr key={ord.id}>
                      <td className="font-bold">#{ord.id}</td>
                      <td>{ord.userEmail}</td>
                      <td>{new Date(ord.orderDate).toLocaleDateString()}</td>
                      <td className="font-bold text-gold">₹{parseFloat(ord.totalAmount).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${ord.status === 'Delivered' ? 'badge-success' : ord.status === 'Shipped' ? 'badge-info' : ord.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleViewOrder(ord.id)} className="btn btn-outline btn-sm">
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Book Catalog Management */}
      {activeTab === 'books' && (
        <div className="admin-tab-section animate-fade-in">
          <div className="admin-subbar">
            <div className="admin-search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Filter catalog by title, author, or genre..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="form-input"
              />
            </div>
            <button
              onClick={() => {
                setEditingBook(null);
                setBookForm({
                  title: '',
                  author: '',
                  price: '',
                  genre: 'Self-help',
                  imageUrl: '',
                  stock: 25,
                  description: '',
                });
                setImagePreview(null);
                setUploadSuccessMsg('');
                setBookModalOpen(true);
              }}
              className="btn btn-gold btn-sm"
            >
              <i className="fas fa-plus"></i> Add New Book
            </button>
          </div>

          <div className="admin-table-wrapper glass-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title & Author</th>
                  <th>Genre</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <img
                        src={b.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80'}
                        alt={b.title}
                        className="table-book-thumb"
                      />
                    </td>
                    <td>
                      <div className="font-bold">{b.title}</div>
                      <div className="text-muted text-sm">by {b.author}</div>
                    </td>
                    <td><span className="badge badge-gold">{b.genre || 'General'}</span></td>
                    <td className="font-bold">₹{parseFloat(b.price).toFixed(2)}</td>
                    <td>
                      <span className={`stock-counter ${b.stock <= 5 ? 'critical' : b.stock < 15 ? 'low' : ''}`}>
                        {b.stock} copies
                      </span>
                    </td>
                    <td>
                      <span className="text-gold font-bold"><i className="fas fa-star"></i> {b.rating || '4.5'}</span>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setEditingBook(b);
                            setBookForm({
                              title: b.title,
                              author: b.author,
                              price: b.price,
                              genre: b.genre,
                              imageUrl: b.imageUrl,
                              stock: b.stock,
                              description: b.description || '',
                            });
                            setImagePreview(b.imageUrl || null);
                            setUploadSuccessMsg('');
                            setBookModalOpen(true);
                          }}
                        >
                          <i className="fas fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          className="btn btn-outline btn-sm text-danger"
                          onClick={() => handleDeleteBook(b.id, b.title)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Customer Orders Management */}
      {activeTab === 'orders' && (
        <div className="admin-tab-section animate-fade-in">
          <div className="order-filter-bar">
            {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                className={`order-filter-pill ${orderFilter === st ? 'active' : ''}`}
                onClick={() => setOrderFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="admin-table-wrapper glass-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer Email</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Total Amount</th>
                  <th>Tracking Code</th>
                  <th>Status</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="font-bold">#{ord.id}</td>
                    <td>{ord.userEmail}</td>
                    <td>{new Date(ord.orderDate).toLocaleDateString()}</td>
                    <td><span className="badge badge-gold">{ord.paymentMethod}</span></td>
                    <td className="font-bold text-gold">₹{parseFloat(ord.totalAmount).toFixed(2)}</td>
                    <td className="font-mono text-sm">{ord.trackingCode || '—'}</td>
                    <td>
                      <span className={`badge ${ord.status === 'Delivered' ? 'badge-success' : ord.status === 'Shipped' ? 'badge-info' : ord.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleViewOrder(ord.id)} className="btn btn-gold btn-sm">
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Customer Accounts Management */}
      {activeTab === 'users' && (
        <div className="admin-tab-section animate-fade-in">
          <div className="admin-table-wrapper glass-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Current Role</th>
                  <th>Registered</th>
                  <th>Change Role</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td className="font-bold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.mobileNumber || '—'}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-info'}`}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="btn btn-outline btn-sm"
                      >
                        {u.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Add/Edit Modal */}
      {bookModalOpen && (
        <div className="modal-overlay" onClick={() => setBookModalOpen(false)}>
          <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBook ? 'Edit Book Record' : 'Add New Book to Inventory'}</h3>
              <button className="modal-close" onClick={() => setBookModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="modal-form">
              <div className="form-group">
                <label className="form-label">Book Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Author Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category / Genre *</label>
                  <select
                    className="form-select"
                    value={bookForm.genre}
                    onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                    required
                  >
                    <option value="Self-help">Self-help</option>
                    <option value="Programming">Programming</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Finance">Finance</option>
                    <option value="Textbook">Textbook</option>
                    <option value="Scripture">Scripture</option>
                    <option value="Biography">Biography</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={bookForm.price}
                    onChange={(e) => setBookForm({ ...bookForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Inventory Stock Count *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bookForm.stock}
                    onChange={(e) => setBookForm({ ...bookForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label font-bold">Book Cover Image</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Direct File Upload button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <label className="btn btn-gold btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <i className={`fas ${uploadingImage ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}`}></i>
                      {uploadingImage ? 'Uploading Image...' : 'Upload Image from Computer'}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                        style={{ display: 'none' }}
                        onChange={handleImageFileUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Select image from your device (JPG, PNG, WEBP, GIF)
                    </span>
                  </div>

                  {uploadSuccessMsg && (
                    <div style={{ fontSize: '0.84rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fas fa-circle-check"></i> {uploadSuccessMsg}
                    </div>
                  )}

                  {/* Text input for image path or URL */}
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Or enter image URL / path directly:
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. /uploads/book_123.jpg or https://..."
                      value={bookForm.imageUrl}
                      onChange={(e) => {
                        setBookForm({ ...bookForm, imageUrl: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                    />
                  </div>

                  {/* Visual Preview Box */}
                  {(imagePreview || bookForm.imageUrl) && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 14px',
                      background: 'var(--bg-card-subtle)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      marginTop: '4px'
                    }}>
                      <img
                        src={imagePreview || bookForm.imageUrl}
                        alt="Preview"
                        style={{ width: '56px', height: '78px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80'; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          Cover Image Preview
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', wordBreak: 'break-all', marginTop: '2px' }}>
                          {bookForm.imageUrl || 'Selected local file'}
                        </div>
                        <span className="badge badge-success" style={{ marginTop: '6px', fontSize: '0.7rem', padding: '2px 8px' }}>
                          <i className="fas fa-check"></i> Ready to Save
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm text-danger"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        onClick={() => {
                          setBookForm({ ...bookForm, imageUrl: '' });
                          setImagePreview(null);
                          setUploadSuccessMsg('');
                        }}
                        title="Remove image"
                      >
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Book Synopsis / Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setBookModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold btn-sm">
                  {editingBook ? 'Save Changes' : 'Publish Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Status & Delivery Modal */}
      {orderModalOpen && selectedOrderDetail && (
        <div className="modal-overlay" onClick={() => setOrderModalOpen(false)}>
          <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Order #{selectedOrderDetail.order.id}</h3>
              <button className="modal-close" onClick={() => setOrderModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body-content">
              <div className="order-modal-meta">
                <p><strong>Customer:</strong> {selectedOrderDetail.order.userEmail}</p>
                <p><strong>Recipient:</strong> {selectedOrderDetail.order.shippingRecipient}</p>
                <p><strong>Address:</strong> {selectedOrderDetail.order.shippingAddress}, {selectedOrderDetail.order.shippingCity} - {selectedOrderDetail.order.shippingZip}</p>
                <p><strong>Total Amount:</strong> ₹{parseFloat(selectedOrderDetail.order.totalAmount).toFixed(2)} ({selectedOrderDetail.order.paymentMethod})</p>
              </div>

              <div className="modal-items-list">
                <h4>Order Items:</h4>
                {selectedOrderDetail.items.map((it) => (
                  <div key={it.id} className="modal-item-line">
                    <span>{it.productName} (x{it.quantity})</span>
                    <span className="font-bold">₹{(it.productPrice * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="form-group mt-4">
                <label className="form-label">Update Delivery Status</label>
                <select
                  className="form-select"
                  value={statusUpdateInput}
                  onChange={(e) => setStatusUpdateInput(e.target.value)}
                >
                  <option value="Pending">Pending Confirmation</option>
                  <option value="Processing">Processing & Packaging</option>
                  <option value="Shipped">Shipped in Transit</option>
                  <option value="Delivered">Delivered to Customer</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Courier Tracking Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={trackingCodeInput}
                  onChange={(e) => setTrackingCodeInput(e.target.value)}
                  placeholder="e.g. BN-849204 / BlueDart-9921"
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setOrderModalOpen(false)}>
                  Close
                </button>
                <button type="button" className="btn btn-gold btn-sm" onClick={handleUpdateOrderStatus}>
                  Update Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
