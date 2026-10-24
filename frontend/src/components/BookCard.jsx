import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function BookCard({ book }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);

  const isSaved = isInWishlist(book.id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      removeFromWishlist(null, book.id);
    } else {
      addToWishlist(book);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (book.stock <= 0) return;
    setIsAdding(true);
    try {
      await addToCart(book, 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
  
  // Calculate mock M.R.P. and discount percentage for authentic Amazon pricing
  const numericPrice = parseFloat(book.price) || 299;
  const mrp = Math.round(numericPrice * 1.4);
  const discountPercent = Math.round(((mrp - numericPrice) / mrp) * 100);

  return (
    <div className="book-card-item glass-card" id={`book-card-${book.id}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Cover Image & Overlay Badges */}
      <Link to={`/book/${book.id}`} className="book-cover-link">
        <div className="book-cover-container" style={{ position: 'relative', overflow: 'hidden', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
          <img
            src={book.imageUrl || fallbackImage}
            alt={book.title}
            className="book-cover-img"
            loading="lazy"
            style={{ maxHeight: '230px', maxWidth: '85%', objectFit: 'contain' }}
            onError={(e) => { e.target.src = fallbackImage; }}
          />

          {/* BookNook Badge */}
          <div className="book-badges-overlay" style={{ position: 'absolute', top: '10px', left: '10px' }}>
            {book.stock <= 0 ? (
              <span className="badge badge-danger">Out of Stock</span>
            ) : discountPercent >= 25 ? (
              <span className="deal-badge-red">Special Edition</span>
            ) : book.rating && book.rating >= 4.8 ? (
              <span className="badge badge-gold" style={{ background: '#0d1b2a', color: '#d4a373' }}>
                <i className="fas fa-crown"></i> Bestseller
              </span>
            ) : null}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            className={`wishlist-heart-btn ${isSaved ? 'active' : ''}`}
            onClick={handleWishlistToggle}
            title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
            aria-label="Wishlist"
          >
            <i className={`fa${isSaved ? 's' : 'r'} fa-heart`} style={{ color: isSaved ? '#c2593f' : undefined }}></i>
          </button>
        </div>
      </Link>

      {/* Book Information */}
      <div className="book-card-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '14px' }}>
        <div className="book-genre-tag" style={{ fontSize: '0.72rem', color: '#8c7a6b', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
          {book.genre || 'Literature'}
        </div>

        <Link to={`/book/${book.id}`} style={{ textDecoration: 'none' }}>
          <h3
            className="book-card-title"
            title={book.title}
            style={{ fontSize: '0.96rem', fontWeight: 700, lineHeight: 1.35, minHeight: '2.7em', color: 'var(--text-main)', margin: '4px 0 2px', fontFamily: 'var(--font-heading)' }}
          >
            {book.title}
          </h3>
        </Link>

        <p className="book-card-author" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          by <span style={{ color: '#bc8a5f', fontWeight: 600 }}>{book.author}</span>
        </p>

        {/* Rating Stars */}
        <div className="book-rating-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <div className="stars-container" style={{ color: '#d4a373', fontSize: '0.85rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`fas fa-star ${star <= Math.round(book.rating || 4.5) ? '' : 'text-muted'}`}
                style={{ opacity: star <= Math.round(book.rating || 4.5) ? 1 : 0.3 }}
              ></i>
            ))}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ({book.reviewsCount ? book.reviewsCount * 14 : 142})
          </span>
        </div>

        {/* Price Box */}
        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{numericPrice.toFixed(0)}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>
              M.R.P: ₹{mrp}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#8c2738', fontWeight: 700 }}>
              ({discountPercent}% off)
            </span>
          </div>

          {/* Delivery Promise */}
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#bc8a5f', fontWeight: 700 }}><i className="fas fa-bolt"></i> Express</span>
            <span>· Delivery by <strong>Tomorrow</strong></span>
          </div>

          {/* Amazon Yellow Add to Cart Button */}
          <div style={{ marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-amazon-yellow"
              style={{ width: '100%' }}
              onClick={handleAddToCart}
              disabled={book.stock <= 0 || isAdding}
              id={`add-cart-btn-${book.id}`}
            >
              {isAdding ? (
                <><i className="fas fa-spinner fa-spin"></i> Adding...</>
              ) : book.stock <= 0 ? (
                'Currently Unavailable'
              ) : (
                <><i className="fas fa-cart-shopping"></i> Add to Cart</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
