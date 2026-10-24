import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Profile() {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('details'); // details, addresses, password, danger
  const [profileForm, setProfileForm] = useState({
    name: '',
    mobileNumber: '',
    avatarUrl: '',
    language: 'en',
    timezone: 'Asia/Kolkata',
    promoEmails: true,
    orderUpdates: true,
  });

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    recipient: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    isDefault: false,
  });

  // Password
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setProfileForm({
        name: user.name || '',
        mobileNumber: user.mobileNumber || '',
        avatarUrl: user.avatarUrl || '',
        language: user.language || 'en',
        timezone: user.timezone || 'Asia/Kolkata',
        promoEmails: user.promoEmails !== false,
        orderUpdates: user.orderUpdates !== false,
      });
    }
    loadAddresses();
  }, [user, isAuthenticated]);

  const loadAddresses = async () => {
    try {
      const res = await api.addresses.getAll();
      if (res.data) setAddresses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.profile.update(profileForm);
      if (res.data) {
        updateUser(res.data);
        setMessage({ type: 'success', text: 'Profile details saved successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setLoading(true);
    try {
      await api.profile.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api.addresses.update(editingAddress.id, addressForm);
      } else {
        await api.addresses.create(addressForm);
      }
      setAddressModalOpen(false);
      setEditingAddress(null);
      await loadAddresses();
    } catch (err) {
      alert("Address error: " + err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Remove this saved address?")) return;
    try {
      await api.addresses.delete(id);
      await loadAddresses();
    } catch (err) {
      alert("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await api.addresses.setDefault(id);
      await loadAddresses();
    } catch (err) {
      alert("Failed to set default address");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("WARNING: Are you absolutely sure you want to permanently delete your BookNook account? This cannot be undone.")) {
      try {
        await api.profile.deleteAccount();
        logout();
        navigate('/');
      } catch (err) {
        alert("Failed to delete account: " + err.message);
      }
    }
  };

  return (
    <div className="profile-page container animate-fade-in">
      <div className="profile-header">
        <h1 className="page-heading">Account & Settings</h1>
        <p className="text-muted">Manage your profile, shipping addresses, and security credentials</p>
      </div>

      {message && (
        <div className={`alert-banner ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'}`}></i> {message.text}
        </div>
      )}

      <div className="profile-layout-grid">
        {/* Left Tabs Navigation */}
        <aside className="profile-nav-card glass-card">
          <div className="user-nav-badge">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
              alt={user?.name}
              className="user-profile-avatar"
            />
            <div className="user-profile-name font-bold">{user?.name}</div>
            <div className="user-profile-email text-muted text-sm">{user?.email}</div>
          </div>

          <div className="profile-tabs-list">
            <button
              className={`profile-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <i className="fas fa-user-pen"></i> Personal Profile
            </button>
            <button
              className={`profile-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <i className="fas fa-location-dot"></i> Saved Addresses ({addresses.length})
            </button>
            <button
              className={`profile-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <i className="fas fa-key"></i> Change Password
            </button>
            <button
              className={`profile-tab-btn text-danger ${activeTab === 'danger' ? 'active' : ''}`}
              onClick={() => setActiveTab('danger')}
            >
              <i className="fas fa-user-xmark"></i> Delete Account
            </button>
            <div style={{ height: '1px', background: 'var(--border-light)', margin: '10px 0' }}></div>
            <button
              className="profile-tab-btn"
              style={{ color: '#dc2626' }}
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <i className="fas fa-arrow-right-from-bracket"></i> Sign Out
            </button>
          </div>
        </aside>

        {/* Right Active Tab Content */}
        <main className="profile-tab-content glass-card">
          {/* Tab 1: Personal Details */}
          {activeTab === 'details' && (
            <form onSubmit={handleProfileSubmit}>
              <h2 className="tab-heading">Personal Information</h2>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Registered Email</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled readOnly />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={profileForm.mobileNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Avatar Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={profileForm.avatarUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Preferred Language</label>
                  <select
                    className="form-select"
                    value={profileForm.language}
                    onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                  >
                    <option value="en">English (India)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.timezone}
                    onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                  />
                </div>
              </div>

              <div className="checkbox-group-block">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profileForm.orderUpdates}
                    onChange={(e) => setProfileForm({ ...profileForm, orderUpdates: e.target.checked })}
                  />
                  <span>Receive automated order status alerts and shipping notifications</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profileForm.promoEmails}
                    onChange={(e) => setProfileForm({ ...profileForm, promoEmails: e.target.checked })}
                  />
                  <span>Subscribe to BookNook Gazette weekly book recommendations and discounts</span>
                </label>
              </div>

              <button type="submit" className="btn btn-gold btn-md" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {/* Tab 2: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div>
              <div className="tab-header-row">
                <h2 className="tab-heading">Saved Delivery Addresses</h2>
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressForm({
                      label: 'Home',
                      recipient: user?.name || '',
                      phone: user?.mobileNumber || '',
                      line1: '',
                      line2: '',
                      city: '',
                      state: '',
                      zip: '',
                      country: 'India',
                      isDefault: addresses.length === 0,
                    });
                    setAddressModalOpen(true);
                  }}
                >
                  <i className="fas fa-plus"></i> Add New Address
                </button>
              </div>

              <div className="saved-addresses-grid">
                {addresses.map((addr) => (
                  <div key={addr.id} className="address-item-card glass-card">
                    <div className="address-header">
                      <span className="badge badge-gold">{addr.label}</span>
                      {addr.isDefault && <span className="badge badge-success">Default</span>}
                    </div>
                    <div className="recipient-name font-bold">{addr.recipient}</div>
                    <div className="recipient-phone text-muted text-sm">{addr.phone}</div>
                    <p className="address-lines">{addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.zip}</p>

                    <div className="address-actions-row">
                      {!addr.isDefault && (
                        <button
                          className="btn-text-action text-gold"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        className="btn-text-action"
                        onClick={() => {
                          setEditingAddress(addr);
                          setAddressForm(addr);
                          setAddressModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-text-action text-danger"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Password Change */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <h2 className="tab-heading">Change Password</h2>

              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">New Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-gold btn-md" disabled={loading}>
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* Tab 4: Account Deletion */}
          {activeTab === 'danger' && (
            <div className="danger-zone-box">
              <h2 className="tab-heading text-danger">Delete Account (GDPR Compliance)</h2>
              <p className="text-muted">
                Once you delete your account, all personal data, address history, and cart items will be erased from our database.
              </p>
              <button
                type="button"
                className="btn btn-danger btn-md"
                onClick={handleDeleteAccount}
              >
                <i className="fas fa-trash-can"></i> Permanently Delete My Account
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Address Edit/Create Modal */}
      {addressModalOpen && (
        <div className="modal-overlay" onClick={() => setAddressModalOpen(false)}>
          <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAddress ? 'Edit Shipping Address' : 'Add New Shipping Address'}</h3>
              <button className="modal-close" onClick={() => setAddressModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Address Label</label>
                  <select
                    className="form-select"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Office / Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Recipient Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={addressForm.recipient}
                    onChange={(e) => setAddressForm({ ...addressForm, recipient: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Flat / House / Street *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={addressForm.zip}
                    onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setAddressModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold btn-sm">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
