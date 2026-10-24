import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        {/* Features / Value Proposition Banner */}
        <div className="value-banner glass-card">
          <div className="value-item">
            <div className="value-icon"><i className="fas fa-truck-fast"></i></div>
            <div className="value-info">
              <h4>Free Express Delivery</h4>
              <p>On all domestic book orders above ₹499</p>
            </div>
          </div>
          <div className="value-item">
            <div className="value-icon"><i className="fas fa-shield-halved"></i></div>
            <div className="value-info">
              <h4>100% Genuine Books</h4>
              <p>Sourced directly from verified publishers</p>
            </div>
          </div>
          <div className="value-item">
            <div className="value-icon"><i className="fas fa-hand-holding-dollar"></i></div>
            <div className="value-info">
              <h4>Cash on Delivery</h4>
              <p>Pay conveniently at your doorstep</p>
            </div>
          </div>
          <div className="value-item">
            <div className="value-icon"><i className="fas fa-rotate-left"></i></div>
            <div className="value-info">
              <h4>Hassle-Free Returns</h4>
              <p>7-day replacement guarantee on defects</p>
            </div>
          </div>
        </div>

        {/* 4-Column Footer Navigation */}
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <div className="brand-logo footer-logo">
              <i className="fas fa-book-open text-gold"></i>
              <span className="brand-name">BOOK<span className="text-gold">NOOK</span></span>
            </div>
            <p className="footer-desc">
              Your premier destination for literature, self-mastery, competitive exams, textbooks, and timeless wisdom. Designed for book lovers, built for lifelong learners.
            </p>
            <div className="footer-social-links">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="social-link"><i className="fab fa-x-twitter"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-link"><i className="fab fa-instagram"></i></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-link"><i className="fab fa-linkedin-in"></i></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="social-link"><i className="fab fa-github"></i></a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Top Categories</h4>
            <ul className="footer-links">
              <li><Link to="/shop?genre=Self-help">Personal Growth & Habits</Link></li>
              <li><Link to="/shop?genre=Programming">Computer Science & Coding</Link></li>
              <li><Link to="/shop?genre=Fiction">Fiction & Modern Novels</Link></li>
              <li><Link to="/shop?genre=Finance">Wealth & Value Investing</Link></li>
              <li><Link to="/shop?genre=Textbook">NCERT School Textbooks</Link></li>
              <li><Link to="/shop?genre=Scripture">Spiritual Scriptures & Classics</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Customer Service</h4>
            <ul className="footer-links">
              <li><Link to="/orders">Track Your Order</Link></li>
              <li><Link to="/help">Help Center & Support Desk</Link></li>
              <li><Link to="/profile">Shipping Address Manager</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy & GDPR</Link></li>
            </ul>
          </div>

          <div className="footer-col newsletter-col">
            <h4 className="footer-heading">BookNook Gazette</h4>
            <p className="footer-desc">
              Subscribe to receive weekly curated reading lists, author interviews, and exclusive discount codes.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing to BookNook Gazette!"); }} className="newsletter-form">
              <input type="email" placeholder="Enter your email..." required className="newsletter-input" />
              <button type="submit" className="btn btn-gold btn-sm"><i className="fas fa-paper-plane"></i></button>
            </form>
            <div className="payment-badges">
              <span>Accepted Payments:</span>
              <div className="payment-icons">
                <i className="fab fa-cc-visa"></i>
                <i className="fab fa-cc-mastercard"></i>
                <i className="fas fa-money-bill-wave" title="Cash on Delivery"></i>
                <i className="fas fa-mobile-screen-button" title="UPI & QR"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} BOOKNOOK E-Commerce. All rights reserved.</p>
          <p className="footer-tech-stack">Powered by React 18, Vite & Spring Boot REST APIs</p>
        </div>
      </div>
    </footer>
  );
}
