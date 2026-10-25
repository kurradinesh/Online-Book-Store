import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api, getImageUrl } from '../services/api';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Sync dark mode class on body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
    setShowSearchDropdown(false);
  }, [location.pathname]);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const params = { search: searchQuery.trim(), size: 5 };
        if (selectedCategory && selectedCategory !== 'All') {
          params.genre = selectedCategory;
        }
        const res = await api.books.getAll(params);
        if (res.data && res.data.content) {
          setSearchResults(res.data.content);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSearchDropdown(false);
    let url = '/shop';
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All') params.set('genre', selectedCategory);
    if (params.toString()) url += `?${params.toString()}`;
    navigate(url);
  };

  return (
    <header className="amazon-header-wrapper">
      {/* 1. Main Top Navigation Bar */}
      <nav className="amazon-top-nav" id="main-amazon-nav">
        {/* Amazon-style Brand Logo */}
        <Link to="/" className="amazon-brand-link" id="nav-brand-logo">
          <div className="amazon-brand-logo">
            <i className="fas fa-book-bookmark text-gold" style={{ marginRight: '6px' }}></i>
            <span>booknook</span>
            <span className="amazon-brand-dot">.in</span>
          </div>
          <span className="amazon-brand-sub">Bookstore</span>
        </Link>

        {/* Deliver To Location Selector */}
        <div className="amazon-location-btn desktop-only" onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}>
          <i className="fas fa-location-dot amazon-loc-pin"></i>
          <div className="amazon-loc-text">
            <span className="amazon-loc-top">
              Deliver to {user?.name ? user.name.split(' ')[0] : 'India'}
            </span>
            <span className="amazon-loc-bottom">
              {isAuthenticated ? 'Hyderabad 500081' : 'Select address'}
            </span>
          </div>
        </div>

        {/* Amazon-style Unified Search Bar */}
        <div className="amazon-search-container" ref={searchRef}>
          <select
            className="amazon-search-cat-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Select Search Department"
          >
            <option value="All">All Books</option>
            <option value="Fiction">Fiction</option>
            <option value="Self-help">Self-Help</option>
            <option value="Programming">Programming</option>
            <option value="Finance">Finance</option>
            <option value="Textbook">Textbooks</option>
            <option value="Biography">Biography</option>
            <option value="Scripture">Scripture</option>
            <option value="History">History</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="amazon-search-input-box" id="nav-search-form">
            <input
              type="text"
              id="nav-search-input"
              className="amazon-search-input"
              placeholder="Search BookNook by title, author, genre, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </form>

          <button
            type="button"
            className="amazon-search-submit-btn"
            onClick={handleSearchSubmit}
            aria-label="Submit Search"
          >
            <i className="fas fa-magnifying-glass"></i>
          </button>

          {/* Autocomplete Results Dropdown */}
          {showSearchDropdown && (
            <div className="search-dropdown glass-card" style={{ top: '44px', width: '100%' }}>
              {isSearching ? (
                <div className="search-status"><i className="fas fa-spinner fa-spin"></i> Searching catalog...</div>
              ) : searchResults.length > 0 ? (
                <div className="search-results-list">
                  {searchResults.map((book) => (
                    <Link
                      key={book.id}
                      to={`/book/${book.id}`}
                      className="search-item"
                      onClick={() => setShowSearchDropdown(false)}
                    >
                      <img
                        src={getImageUrl(book.imageUrl) || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80'}
                        alt={book.title}
                        className="search-item-img"
                      />
                      <div className="search-item-info">
                        <div className="search-item-title">{book.title}</div>
                        <div className="search-item-author">by {book.author}</div>
                        <div className="search-item-price">
                          ₹{book.price} <span className="badge badge-gold">{book.genre}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <button className="view-all-results-btn" onClick={handleSearchSubmit}>
                    View all matching results <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              ) : (
                <div className="search-status text-muted">No books found for "{searchQuery}".</div>
              )}
            </div>
          )}
        </div>

        {/* Region & Language Selector */}
        <div className="amazon-nav-item desktop-only" title="Region: India | English">
          <span className="amazon-nav-line1">🇮🇳 IN</span>
          <span className="amazon-nav-line2">EN <i className="fas fa-caret-down text-muted" style={{ fontSize: '0.7rem' }}></i></span>
        </div>

        {/* Hello, Sign In / Account & Lists Dropdown */}
        <div
          className="nav-user-menu-wrapper"
          ref={userMenuRef}
          onMouseEnter={() => setIsUserMenuOpen(true)}
          onMouseLeave={() => setIsUserMenuOpen(false)}
        >
          <div
            className="amazon-nav-item"
            id="nav-account-btn"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
              } else {
                setIsUserMenuOpen(!isUserMenuOpen);
              }
            }}
          >
            <span className="amazon-nav-line1">
              Hello, {isAuthenticated ? (user?.name?.split(' ')[0] || 'User') : 'sign in'}
            </span>
            <span className="amazon-nav-line2">
              Account & Lists <i className="fas fa-caret-down" style={{ fontSize: '0.7rem' }}></i>
            </span>
          </div>

          {isUserMenuOpen && (
            <div className="user-dropdown-menu animate-fade-in" id="nav-user-dropdown-popup">
              {!isAuthenticated ? (
                <div className="dropdown-auth-box">
                  <Link
                    to="/login"
                    className="dropdown-signin-action-btn"
                    id="dropdown-signin-btn"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <i className="fas fa-sign-in-alt"></i> Sign in
                  </Link>
                  <p className="dropdown-register-hint">
                    New customer?{' '}
                    <Link
                      to="/register"
                      className="dropdown-register-link"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Start here.
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="dropdown-user-header">
                  <div className="dropdown-user-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="dropdown-user-details">
                    <div className="dropdown-user-name">{user?.name}</div>
                    <div className="dropdown-user-email">{user?.email}</div>
                    {isAdmin && (
                      <span className="dropdown-admin-badge">
                        <i className="fas fa-shield"></i> Store Admin
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="dropdown-section-title">YOUR ACCOUNT</div>

              <div className="user-menu-items">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="user-menu-link admin-link"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <i className="fas fa-gauge-high"></i> Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="user-menu-link"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <i className="fas fa-user-gear"></i> Your Account
                </Link>
                <Link
                  to="/orders"
                  className="user-menu-link"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <i className="fas fa-box-open"></i> Your Orders
                </Link>
                <Link
                  to="/wishlist"
                  className="user-menu-link"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <i className="fas fa-heart"></i> Your Wishlist ({wishlistCount})
                </Link>
                <Link
                  to="/help"
                  className="user-menu-link"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <i className="fas fa-headset"></i> Customer Service
                </Link>

                {/* Dark Mode toggle item */}
                <div
                  className="user-menu-link"
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  <span><i className={`fas ${isDarkMode ? 'fa-sun text-gold' : 'fa-moon'}`}></i> Theme</span>
                  <span className="theme-switch-pill">{isDarkMode ? 'Dark' : 'Light'}</span>
                </div>

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="user-menu-logout-btn"
                    id="dropdown-signout-btn"
                  >
                    <i className="fas fa-arrow-right-from-bracket"></i> Sign Out
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Returns & Orders (Amazon Signature Direct Link) */}
        <Link to="/orders" className="amazon-nav-item desktop-only" id="nav-returns-orders">
          <span className="amazon-nav-line1">Returns</span>
          <span className="amazon-nav-line2">& Orders</span>
        </Link>

        {/* Amazon Shopping Cart */}
        <div
          className="amazon-cart-link"
          id="nav-cart-btn"
          onClick={() => setIsCartOpen(true)}
          title="Shopping Cart"
        >
          <div className="amazon-cart-icon-box">
            <i className="fas fa-cart-shopping"></i>
            <span className="amazon-cart-badge">{totalCount}</span>
          </div>
          <span className="amazon-cart-text desktop-only">Cart</span>
        </div>
      </nav>

      {/* 2. Amazon Sub-Navbar (All, Today's Deals, Categories, Admin) */}
      <div className="amazon-subnav">
        <Link to="/shop" className="amazon-subnav-link">
          <i className="fas fa-bars"></i> All Books
        </Link>
        <Link to="/shop?sort=price_asc" className="amazon-subnav-link">
          <i className="fas fa-tag text-gold"></i> Today's Deals
        </Link>
        <Link to="/shop?sort=rating_desc" className="amazon-subnav-link">
          <i className="fas fa-crown text-gold"></i> Bestsellers
        </Link>
        <Link to="/shop?sort=newest" className="amazon-subnav-link">
          New Releases
        </Link>
        <Link to="/shop?genre=Self-help" className="amazon-subnav-link">
          Self-Help
        </Link>
        <Link to="/shop?genre=Programming" className="amazon-subnav-link">
          Coding & Tech
        </Link>
        <Link to="/shop?genre=Fiction" className="amazon-subnav-link">
          Fiction
        </Link>
        <Link to="/shop?genre=Textbook" className="amazon-subnav-link">
          Textbooks
        </Link>
        <Link to="/help" className="amazon-subnav-link">
          Customer Service
        </Link>

        {isAdmin && (
          <Link to="/admin" className="amazon-subnav-link admin-pill" style={{ marginLeft: 'auto' }}>
            <i className="fas fa-lock"></i> Seller / Admin Central
          </Link>
        )}
      </div>
    </header>
  );
}
