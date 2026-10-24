import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
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
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Join thousands of readers discovering exceptional literature.</p>
        </div>

        {error && (
          <div className="alert-banner alert-danger">
            <i className="fas fa-triangle-exclamation"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name *</label>
            <div className="input-icon-wrap">
              <i className="fas fa-user"></i>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address *</label>
            <div className="input-icon-wrap">
              <i className="fas fa-envelope"></i>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password *</label>
            <div className="input-icon-wrap">
              <i className="fas fa-lock"></i>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm-password">Confirm Password *</label>
            <div className="input-icon-wrap">
              <i className="fas fa-shield-halved"></i>
              <input
                id="reg-confirm-password"
                type="password"
                className="form-input"
                placeholder="Re-enter password"
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
            id="register-submit-btn"
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Creating Account...</>
            ) : (
              <><i className="fas fa-user-plus"></i> Complete Registration</>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link font-bold text-gold">
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
