import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      if (user.role?.toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectUrl === 'checkout' ? '/checkout' : '/');
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const fillCustomerDemo = () => {
    setEmail('customer@booknook.com');
    setPassword('Customer@123');
  };

  const fillAdminDemo = () => {
    setEmail('admin@booknook.com');
    setPassword('Admin@123');
  };

  return (
    <div className="auth-page-container animate-fade-in">
      <div className="auth-card glass-card">
        {/* Brand Header */}
        <div className="auth-card-header">
          <Link to="/" className="auth-brand-logo">
            <i className="fas fa-book-open text-gold"></i>
            <span>BOOK<span className="text-gold">NOOK</span></span>
          </Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your bookstore account to access your bag, orders, and wishlist.</p>
        </div>

        {error && (
          <div className="alert-banner alert-danger">
            <i className="fas fa-triangle-exclamation"></i> {error}
          </div>
        )}

        {/* Demo Credentials Quick-Fill Bar */}
        <div className="demo-credentials-bar glass-card">
          <span className="demo-label"><i className="fas fa-key text-gold"></i> Quick Demo Login:</span>
          <div className="demo-buttons">
            <button type="button" onClick={fillCustomerDemo} className="btn-demo">
              Fill Customer
            </button>
            <button type="button" onClick={fillAdminDemo} className="btn-demo admin">
              Fill Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="input-icon-wrap">
              <i className="fas fa-envelope"></i>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-label-row">
              <label className="form-label" htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>
            <div className="input-icon-wrap">
              <i className="fas fa-lock"></i>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gold btn-lg w-full auth-submit-btn"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Authenticating...</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i> Sign In</>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-switch-link font-bold text-gold">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
