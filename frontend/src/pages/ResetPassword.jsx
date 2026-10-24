import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword({ email, otp, newPassword });
      alert("Password reset successfully! You can now log in with your new credentials.");
      navigate('/login');
    } catch (err) {
      setError(err.message || "Failed to reset password. Please request a new OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container animate-fade-in">
      <div className="auth-card glass-card">
        <div className="auth-card-header">
          <Link to="/" className="auth-brand-logo">
            <i className="fas fa-book-open text-gold"></i>
            <span>BOOK<span className="text-gold">NOOK</span></span>
          </Link>
          <h1 className="auth-title">Create New Password</h1>
          <p className="auth-subtitle">
            Enter your new secure password for <strong>{email}</strong>.
          </p>
        </div>

        {error && (
          <div className="alert-banner alert-danger">
            <i className="fas fa-triangle-exclamation"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">New Password *</label>
            <div className="input-icon-wrap">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password *</label>
            <div className="input-icon-wrap">
              <i className="fas fa-shield-halved"></i>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gold btn-lg w-full auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Resetting Password...</>
            ) : (
              <><i className="fas fa-key"></i> Set New Password</>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <Link to="/login" className="auth-switch-link text-gold font-bold">
            <i className="fas fa-arrow-left"></i> Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
