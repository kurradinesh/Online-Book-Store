import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl } from '../services/api';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, moveToCart } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="container empty-cart-page glass-card animate-fade-in">
        <div className="empty-cart-illustration">
          <i className="fas fa-heart-crack fa-3x text-gold"></i>
        </div>
        <h1 className="empty-cart-heading">Your Wishlist is Empty</h1>
        <p className="empty-cart-subtext">
          Save books you want to read later by clicking the heart icon on any book card.
        </p>
        <Link to="/shop" className="btn btn-gold btn-lg">
          <i className="fas fa-compass"></i> Discover Books
        </Link>
      </div>
    );
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="wishlist-page container animate-fade-in">
      <div className="wishlist-header">
        <h1 className="page-heading">Saved Wishlist</h1>
        <p className="text-muted">You have {wishlistItems.length} books saved in your wishlist</p>
      </div>

      <div className="wishlist-grid">
        {wishlistItems.map((item) => (
          <div key={item.id} className="wishlist-card glass-card">
            <Link to={`/book/${item.productId}`}>
              <div className="wishlist-cover-box">
                <img
                  src={getImageUrl(item.productImage) || fallbackImage}
                  alt={item.productName}
                  className="wishlist-cover-img"
                  onError={(e) => { e.target.src = fallbackImage; }}
                />
              </div>
            </Link>

            <div className="wishlist-info">
              <span className="badge badge-gold">{item.productCategory || 'Book'}</span>
              <Link to={`/book/${item.productId}`}>
                <h3 className="wishlist-title">{item.productName}</h3>
              </Link>
              <p className="wishlist-author">by {item.productAuthor}</p>
              <div className="wishlist-price">₹{parseFloat(item.productPrice).toFixed(2)}</div>

              <div className="wishlist-actions">
                <button
                  type="button"
                  className="btn btn-gold btn-sm w-full"
                  onClick={() => moveToCart(item)}
                >
                  <i className="fas fa-cart-plus"></i> Move to Bag
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm text-danger"
                  onClick={() => removeFromWishlist(item.id, item.productId)}
                  title="Remove from wishlist"
                >
                  <i className="fas fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
