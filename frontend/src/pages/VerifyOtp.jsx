import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailParam = searchParams.get('email') || '';
  const otpParam = searchParams.get('otp') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(otpParam);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.auth.verifyOtp({ email: email.trim(), otp: otp.trim() });
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}&otp=${encodeURIComponent(otp.trim())}`);
    } catch (err) {
      setError(err.message || "Invalid or expired OTP. Please try again.");
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
          <h1 className="auth-title">Verify 6-Digit Code</h1>
          <p className="auth-subtitle">
            Please enter the 6-digit verification code sent to <strong>{email || 'your email'}</strong>.
          </p>
        </div>

        {error && (
          <div className="alert-banner alert-danger">
            <i className="fas fa-triangle-exclamation"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">6-Digit OTP</label>
            <input
              type="text"
              maxLength="6"
              className="form-input otp-large-input"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-gold btn-lg w-full auth-submit-btn"
            disabled={loading || otp.length < 6}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Verifying Code...</>
            ) : (
              <><i className="fas fa-check"></i> Verify & Proceed</>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <Link to="/forgot-password" className="auth-switch-link text-muted">
            Didn't receive code? Request another OTP
          </Link>
        </div>
      </div>
    </div>
  );
}
