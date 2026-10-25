import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('Paperback');

  // Review Form state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadBookData() {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const [bookRes, reviewRes, relatedRes] = await Promise.all([
          api.books.getById(id),
          api.books.getReviews(id),
          api.books.getRelated(id),
        ]);
        if (bookRes.data) setBook(bookRes.data);
        if (reviewRes.data) setReviews(reviewRes.data);
        if (relatedRes.data) setRelatedBooks(relatedRes.data);
      } catch (err) {
        console.error("Failed to load book details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookData();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin fa-3x" style={{ color: '#febd69', marginBottom: '16px' }}></i>
        <h2>Loading Amazon Book Details...</h2>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Book Not Found</h2>
        <p className="text-muted">The product you are looking for is no longer in the catalog.</p>
        <Link to="/shop" className="btn btn-amazon-yellow" style={{ marginTop: '16px' }}>
          Back to Bookstore
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(book.id);
  const price = parseFloat(book.price) || 299;
  const mrp = Math.round(price * 1.4);
  const discountPercent = Math.round(((mrp - price) / mrp) * 100);

  // Format pricing
  const formatPrices = {
    'Paperback': price,
    'Hardcover': price + 350,
    'Kindle Edition': Math.round(price * 0.55),
  };
  const activePrice = formatPrices[selectedFormat] || price;

  const handleAddToCart = async () => {
    if (book.stock <= 0) return;
    setIsAdding(true);
    try {
      await addToCart(book, quantity);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (book.stock <= 0) return;
    setIsAdding(true);
    try {
      await addToCart(book, quantity);
      navigate('/checkout');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.books.addReview(book.id, {
        rating: ratingInput,
        comment: commentInput.trim(),
      });
      if (res.data) {
        setReviews([res.data, ...reviews]);
        setCommentInput('');
        alert("Thank you! Your verified review has been posted.");
      }
    } catch (err) {
      alert("Error submitting review: " + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="container" style={{ padding: '20px 0 60px' }}>
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav" style={{ marginBottom: '18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <Link to="/" style={{ color: '#bc8a5f' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link to="/shop" style={{ color: '#bc8a5f' }}>Books</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link to={`/shop?genre=${encodeURIComponent(book.genre || '')}`} style={{ color: '#bc8a5f' }}>{book.genre || 'Literature'}</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{book.title}</span>
      </nav>

      {/* 3-Column Product Layout */}
      <div className="amazon-product-grid">
        {/* Column 1: Book Cover Gallery */}
        <div className="amazon-product-gallery">
          <div className="amazon-main-image-wrap">
            <img
              src={getImageUrl(book.imageUrl) || fallbackImage}
              alt={book.title}
              className="amazon-main-image"
              onError={(e) => { e.target.src = fallbackImage; }}
            />
          </div>
          <div style={{ marginTop: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            <i className="fas fa-magnifying-glass-plus"></i> Roll over cover to zoom
          </div>
        </div>

        {/* Column 2: Center Book Information & Specs */}
        <div className="amazon-center-column">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '8px', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            {book.title}
          </h1>

          <div style={{ fontSize: '0.92rem', marginBottom: '12px' }}>
            by <Link to={`/shop?search=${encodeURIComponent(book.author)}`} style={{ color: '#bc8a5f', fontWeight: 600 }}>{book.author}</Link>
          </div>

          {/* Ratings & Bestseller Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: '#d4a373' }}>{book.rating || '4.8'}</span>
              <div style={{ color: '#d4a373', fontSize: '0.85rem' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <i key={s} className="fas fa-star"></i>
                ))}
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ({reviews.length ? reviews.length * 15 : 184} ratings)
              </span>
            </div>

            <span className="badge badge-gold" style={{ background: '#0d1b2a', color: '#d4a373', fontSize: '0.75rem' }}>
              <i className="fas fa-crown"></i> Bestseller in {book.genre || 'Books'}
            </span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e7e7e7', margin: '14px 0' }} />

          {/* Pricing Box */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ color: '#8c2738', fontSize: '1.8rem', fontWeight: 300 }}>-{discountPercent}%</span>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                <span style={{ fontSize: '1.2rem', verticalAlign: 'super', marginRight: '2px' }}>₹</span>
                {activePrice.toFixed(0)}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{(mrp + (selectedFormat === 'Hardcover' ? 350 : 0))}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>
              Inclusive of all taxes
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              EMI starts at ₹{Math.round(activePrice / 3)}/month. <span style={{ color: '#bc8a5f', cursor: 'pointer' }}>EMI options</span>
            </div>
          </div>

          {/* Edition / Format Selector Pills */}
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Available Formats:</span>
            <div className="amazon-format-pills">
              {['Paperback', 'Hardcover', 'Kindle Edition'].map((fmt) => (
                <div
                  key={fmt}
                  className={`amazon-format-card ${selectedFormat === fmt ? 'active' : ''}`}
                  onClick={() => setSelectedFormat(fmt)}
                >
                  <div className="format-title">{fmt}</div>
                  <div className="format-price">₹{formatPrices[fmt]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Book Specifications Table */}
          <div style={{ margin: '20px 0', border: '1px solid #e7e7e7', borderRadius: '8px', padding: '16px', background: 'var(--bg-main)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Product Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div><strong>Publisher:</strong> BookNook India</div>
              <div><strong>Language:</strong> English</div>
              <div><strong>Print Length:</strong> 340 pages</div>
              <div><strong>Genre:</strong> {book.genre}</div>
              <div><strong>ISBN-10:</strong> 9353068945</div>
              <div><strong>Dimensions:</strong> 13.97 x 2.1 x 20.3 cm</div>
            </div>
          </div>

          {/* Synopsis */}
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Book Synopsis</h3>
            <p style={{ lineHeight: '1.7', color: 'var(--text-main)', fontSize: '0.95rem' }}>
              {book.description || 'A timeless and engaging edition from our curated bookstore. Written with depth, insight, and mastery of the subject.'}
            </p>
          </div>
        </div>

        {/* Column 3: Amazon Buy Box */}
        <div className="amazon-buy-box">
          <div className="buybox-price">
            ₹{activePrice.toFixed(2)}
          </div>

          {/* Delivery Promise */}
          <div className="buybox-delivery">
            <span style={{ color: '#bc8a5f', fontWeight: 700 }}>FREE delivery</span> <strong>Tomorrow, 2:00 PM</strong>.<br />
            Order within <span style={{ color: '#15803d', fontWeight: 600 }}>4 hrs 32 mins</span>.
          </div>

          <div className="buybox-location" onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}>
            <i className="fas fa-location-dot"></i>
            <span>Deliver to {user?.name ? user.name.split(' ')[0] : 'India'} - Hyderabad 500081</span>
          </div>

          {/* Stock Indicator */}
          {book.stock <= 0 ? (
            <div className="buybox-stock-out">Currently Unavailable</div>
          ) : book.stock < 10 ? (
            <div className="buybox-stock-low">Only {book.stock} left in stock - order soon.</div>
          ) : (
            <div className="buybox-stock-in">In Stock</div>
          )}

          {/* Quantity Selector */}
          {book.stock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: '#565959' }}>Quantity:</label>
              <select
                className="buybox-qty-select"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              >
                {[...Array(Math.min(book.stock, 10)).keys()].map((n) => (
                  <option key={n + 1} value={n + 1}>{n + 1}</option>
                ))}
              </select>
            </div>
          )}

          {/* Amazon Yellow "Add to Cart" */}
          {book.stock > 0 && (
            <button
              type="button"
              className="btn btn-amazon-yellow"
              style={{ width: '100%', padding: '10px 0' }}
              onClick={handleAddToCart}
              disabled={isAdding}
              id="details-add-to-cart-btn"
            >
              {isAdding ? <><i className="fas fa-spinner fa-spin"></i> Adding...</> : 'Add to Cart'}
            </button>
          )}

          {/* Amazon Orange "Buy Now" */}
          {book.stock > 0 && (
            <button
              type="button"
              className="btn btn-amazon-orange"
              style={{ width: '100%', padding: '10px 0' }}
              onClick={handleBuyNow}
              disabled={isAdding}
              id="details-buy-now-btn"
            >
              Buy Now
            </button>
          )}

          {/* Buy Box Security & Metadata */}
          <table className="buybox-meta-table">
            <tbody>
              <tr>
                <td>Payment</td>
                <td style={{ color: '#007185' }}>Secure transaction</td>
              </tr>
              <tr>
                <td>Ships from</td>
                <td>BookNook Logistics</td>
              </tr>
              <tr>
                <td>Sold by</td>
                <td>BookNook Retail</td>
              </tr>
              <tr>
                <td>Returns</td>
                <td style={{ color: '#007185' }}>7 days Replacement / Refundable</td>
              </tr>
            </tbody>
          </table>

          <hr style={{ border: 'none', borderTop: '1px solid #e7e7e7' }} />

          {/* Wishlist Button */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ width: '100%' }}
            onClick={() => isSaved ? removeFromWishlist(null, book.id) : addToWishlist(book)}
          >
            <i className={`fa${isSaved ? 's' : 'r'} fa-heart`} style={{ color: isSaved ? '#cc0c39' : undefined }}></i> {isSaved ? 'In your Wish List' : 'Add to Wish List'}
          </button>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <section className="amazon-reviews-section glass-card" style={{ padding: '28px', marginTop: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>Customer Reviews</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {/* Review Summary Breakdown */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ color: '#de7921', fontSize: '1.1rem' }}>
                {[1, 2, 3, 4, 5].map((s) => <i key={s} className="fas fa-star"></i>)}
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>4.8 out of 5</span>
            </div>
            <div style={{ color: '#565959', fontSize: '0.88rem', marginBottom: '16px' }}>
              {reviews.length ? reviews.length * 12 : 240} global ratings
            </div>

            {/* Star Distribution Bars */}
            {[
              { star: '5 star', percent: 78 },
              { star: '4 star', percent: 14 },
              { star: '3 star', percent: 5 },
              { star: '2 star', percent: 2 },
              { star: '1 star', percent: 1 },
            ].map((row) => (
              <div key={row.star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ width: '45px', color: '#007185' }}>{row.star}</span>
                <div style={{ flex: 1, height: '18px', background: '#e3e6e6', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${row.percent}%`, height: '100%', background: '#ffa41c', borderRadius: '4px' }}></div>
                </div>
                <span style={{ width: '35px', textAlign: 'right', color: '#565959' }}>{row.percent}%</span>
              </div>
            ))}
          </div>

          {/* Write a Product Review Form */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>Review this product</h3>
            <p style={{ fontSize: '0.88rem', color: '#565959', marginBottom: '14px' }}>
              Share your thoughts with other customers to help them make the right choice.
            </p>

            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Overall Rating</label>
                  <select
                    className="form-select"
                    value={ratingInput}
                    onChange={(e) => setRatingInput(parseInt(e.target.value, 10))}
                    style={{ width: '100%', maxWidth: '200px' }}
                  >
                    <option value="5">★★★★★ (5 - Excellent)</option>
                    <option value="4">★★★★☆ (4 - Good)</option>
                    <option value="3">★★★☆☆ (3 - Average)</option>
                    <option value="2">★★☆☆☆ (2 - Below Average)</option>
                    <option value="1">★☆☆☆☆ (1 - Poor)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Written Review</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="What did you like or dislike? How was the content, print quality, and delivery?"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-amazon-yellow"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</> : 'Submit Customer Review'}
                </button>
              </form>
            ) : (
              <div style={{ padding: '16px', border: '1px solid #e7e7e7', borderRadius: '8px', background: 'var(--bg-main)' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Please sign in to write a review.</p>
                <Link to="/login" className="btn btn-amazon-yellow btn-sm">
                  Sign in to Review
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Existing Reviews List */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Top Customer Reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-muted">No written reviews yet. Be the first customer to review this book!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{ borderBottom: '1px solid #e7e7e7', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <i className="fas fa-circle-user fa-lg" style={{ color: '#565959' }}></i>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rev.userName || 'Verified Reader'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ color: '#de7921', fontSize: '0.85rem' }}>
                      {[...Array(rev.rating || 5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                    </div>
                    <span style={{ color: '#c45500', fontSize: '0.8rem', fontWeight: 700 }}>Verified Purchase</span>
                    <span style={{ color: '#565959', fontSize: '0.78rem' }}>
                      Reviewed on {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Books Ribbon */}
      {relatedBooks.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '16px' }}>Customers who bought this also bought</h2>
          <div className="books-grid">
            {relatedBooks.slice(0, 4).map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
