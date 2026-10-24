import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpHint, setOtpHint] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.auth.forgotPassword(email);
      // For local testing convenience, if OTP is returned in response data
      if (res.data) {
        setOtpHint(res.data);
      }
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}&otp=${res.data || ''}`);
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to send reset code. Please try again.");
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
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your registered email address and we'll dispatch a 6-digit verification code.
          </p>
        </div>

        {error && (
          <div className="alert-banner alert-danger">
            <i className="fas fa-triangle-exclamation"></i> {error}
          </div>
        )}

        {otpHint && (
          <div className="alert-banner alert-success">
            <i className="fas fa-check-circle"></i> OTP dispatched! (Local Sandbox Code: <strong>{otpHint}</strong>). Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="forgot-email">Account Email Address *</label>
            <div className="input-icon-wrap">
              <i className="fas fa-envelope"></i>
              <input
                id="forgot-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <><i className="fas fa-spinner fa-spin"></i> Generating OTP...</>
            ) : (
              <><i className="fas fa-paper-plane"></i> Send Verification Code</>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <Link to="/login" className="auth-switch-link text-gold font-bold">
            <i className="fas fa-arrow-left"></i> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
