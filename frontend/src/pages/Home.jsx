import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { api } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = [
    {
      badge: 'GREAT INDIAN BOOK FESTIVAL',
      title: 'Up to 50% Off on Top Bestsellers',
      desc: 'Explore award-winning fiction, life-transforming self-help, and essential competitive exam guides delivered to your doorstep.',
      buttonText: 'Shop the Festival Deals',
      link: '/shop?sort=price_asc',
      bgGrad: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 60%, #28384d 100%)',
      featuredImg: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80',
    },
    {
      badge: 'ACADEMIC & COMPETITIVE EXAMS',
      title: 'Flat 30% Off on Curated Textbooks',
      desc: 'Complete NCERT series, engineering reference manuals, medical guides, and general studies with guaranteed next-day delivery.',
      buttonText: 'Explore Exam Books',
      link: '/shop?genre=Textbook',
      bgGrad: 'linear-gradient(135deg, #182230 0%, #23344a 60%, #324a68 100%)',
      featuredImg: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=80',
    },
    {
      badge: 'TECH & PROGRAMMING HUB',
      title: 'Master Modern Architecture & Code',
      desc: 'From Clean Code and System Design to Cloud Computing and AI. Elevate your software craftsmanship today.',
      buttonText: 'Explore Tech Titles',
      link: '/shop?genre=Programming',
      bgGrad: 'linear-gradient(135deg, #101c28 0%, #1f2f40 60%, #2e4359 100%)',
      featuredImg: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80',
    },
  ];

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [featRes, newRes] = await Promise.all([
          api.books.getFeatured(),
          api.books.getNewArrivals(),
        ]);
        if (featRes.data) setFeaturedBooks(featRes.data);
        if (newRes.data) setNewArrivals(newRes.data);
      } catch (err) {
        console.error("Home data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // Auto-rotate hero banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="home-page animate-fade-in" style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* 1. Amazon Hero Banner Carousel */}
      <section className="amazon-hero-banner" style={{ background: heroSlides[activeSlide].bgGrad, transition: 'background 0.5s ease' }}>
        <div className="amazon-hero-slide">
          <div className="amazon-hero-copy">
            <span className="amazon-deal-tag">{heroSlides[activeSlide].badge}</span>
            <h1 className="amazon-hero-heading">{heroSlides[activeSlide].title}</h1>
            <p className="amazon-hero-desc">{heroSlides[activeSlide].desc}</p>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <Link to={heroSlides[activeSlide].link} className="btn btn-amazon-yellow btn-lg">
                {heroSlides[activeSlide].buttonText}
              </Link>
              <Link to="/shop" className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>
                All Books
              </Link>
            </div>
          </div>

          <div className="desktop-only" style={{ maxWidth: '340px' }}>
            <img
              src={heroSlides[activeSlide].featuredImg}
              alt="Featured Book"
              style={{ width: '100%', height: '360px', objectFit: 'contain', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))' }}
            />
          </div>
        </div>

        {/* Carousel indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              style={{
                width: activeSlide === i ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: activeSlide === i ? '#febd69' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              aria-label={`Slide ${i + 1}`}
            ></button>
          ))}
        </div>
      </section>

      {/* 2. Amazon 4-Quadrant Home Grid Overlapping Hero */}
      <div className="container">
        <div className="amazon-quad-grid">
          {/* Card 1: Academic & Textbooks */}
          <div className="amazon-quad-box">
            <h3 className="amazon-quad-title">Academic & Textbooks | Up to 40% off</h3>
            <div className="amazon-quad-thumbs">
              <Link to="/shop?genre=Textbook" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=300&q=80" alt="History" className="amazon-quad-img" />
                <span className="amazon-quad-caption">NCERT History</span>
              </Link>
              <Link to="/shop?genre=Textbook" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=300&q=80" alt="Geography" className="amazon-quad-img" />
                <span className="amazon-quad-caption">Geography Class 11</span>
              </Link>
              <Link to="/shop?genre=Textbook" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=300&q=80" alt="Biology" className="amazon-quad-img" />
                <span className="amazon-quad-caption">Life Sciences</span>
              </Link>
              <Link to="/shop?genre=Textbook" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=300&q=80" alt="Primary" className="amazon-quad-img" />
                <span className="amazon-quad-caption">School Workbooks</span>
              </Link>
            </div>
            <Link to="/shop?genre=Textbook" className="amazon-quad-footer-link">
              See all academic books
            </Link>
          </div>

          {/* Card 2: Self-Help & Personal Growth */}
          <div className="amazon-quad-box">
            <h3 className="amazon-quad-title">Bestselling Self-Help & Motivation</h3>
            <div className="amazon-quad-thumbs">
              <Link to="/shop?genre=Self-help" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80" alt="Atomic Habits" className="amazon-quad-img" />
                <span className="amazon-quad-caption">Atomic Habits</span>
              </Link>
              <Link to="/shop?genre=Self-help" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80" alt="Ikigai" className="amazon-quad-img" />
                <span className="amazon-quad-caption">Ikigai: Long Life</span>
              </Link>
              <Link to="/shop?genre=Self-help" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=300&q=80" alt="Rich Dad" className="amazon-quad-img" />
                <span className="amazon-quad-caption">Rich Dad Poor Dad</span>
              </Link>
              <Link to="/shop?genre=Self-help" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80" alt="Think & Grow" className="amazon-quad-img" />
                <span className="amazon-quad-caption">Think & Grow Rich</span>
              </Link>
            </div>
            <Link to="/shop?genre=Self-help" className="amazon-quad-footer-link">
              Explore self-mastery shelf
            </Link>
          </div>

          {/* Card 3: Fiction & Literature */}
          <div className="amazon-quad-box">
            <h3 className="amazon-quad-title">Trending Fiction & Stories | Under ₹499</h3>
            <div className="amazon-quad-thumbs">
              <Link to="/shop?genre=Fiction" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80" alt="Harry Potter" className="amazon-quad-img" />
                <span className="amazon-quad-caption">Harry Potter Saga</span>
              </Link>
              <Link to="/shop?genre=Fiction" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80" alt="The Alchemist" className="amazon-quad-img" />
                <span className="amazon-quad-caption">The Alchemist</span>
              </Link>
              <Link to="/shop?genre=Fiction" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=300&q=80" alt="Literature" className="amazon-quad-img" />
                <span className="amazon-quad-caption">Wings of Fire</span>
              </Link>
              <Link to="/shop?genre=Fiction" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&q=80" alt="Monk Ferrari" className="amazon-quad-img" />
                <span className="amazon-quad-caption">The Monk's Journey</span>
              </Link>
            </div>
            <Link to="/shop?genre=Fiction" className="amazon-quad-footer-link">
              Browse all novels
            </Link>
          </div>

          {/* Card 4: Tech & Computer Science */}
          <div className="amazon-quad-box">
            <h3 className="amazon-quad-title">Computer Science & Coding Handbooks</h3>
            <div className="amazon-quad-thumbs">
              <Link to="/shop?genre=Programming" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80" alt="Clean Code" className="amazon-quad-img" />
                <span className="amazon-quad-caption">Clean Code</span>
              </Link>
              <Link to="/shop?genre=Programming" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80" alt="Head First Java" className="amazon-quad-img" />
                <span className="amazon-quad-caption">Head First Java</span>
              </Link>
              <Link to="/shop?genre=Programming" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80" alt="System Design" className="amazon-quad-img" />
                <span className="amazon-quad-caption">System Design</span>
              </Link>
              <Link to="/shop?genre=Programming" className="amazon-quad-thumb-item">
                <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=300&q=80" alt="Effective Java" className="amazon-quad-img" />
                <span className="amazon-quad-caption">Effective Java</span>
              </Link>
            </div>
            <Link to="/shop?genre=Programming" className="amazon-quad-footer-link">
              See programming titles
            </Link>
          </div>
        </div>

        {/* 3. Amazon Today's Deals Horizontal Strip */}
        <div className="amazon-strip-section">
          <div className="amazon-strip-header">
            <div>
              <h2 className="amazon-strip-title">Today's Deals — Up to 50% Off</h2>
              <p style={{ fontSize: '0.85rem', color: '#565959', margin: '2px 0 0' }}>Limited time lightning deals on hand-picked titles</p>
            </div>
            <Link to="/shop?sort=price_asc" className="amazon-quad-footer-link" style={{ margin: 0 }}>
              See all deals <i className="fas fa-chevron-right"></i>
            </Link>
          </div>

          <div className="amazon-strip-scroll">
            {(featuredBooks.length > 0 ? featuredBooks : [
              { id: 1, title: 'Atomic Habits', author: 'James Clear', price: 499, genre: 'Self-help', stock: 45, rating: 4.9, reviewsCount: 1420 },
              { id: 2, title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', price: 399, genre: 'Self-help', stock: 50, rating: 4.8, reviewsCount: 980 },
              { id: 3, title: 'The Psychology of Money', author: 'Morgan Housel', price: 399, genre: 'Finance', stock: 38, rating: 4.9, reviewsCount: 850 },
              { id: 7, title: 'Harry Potter & Chamber of Secrets', author: 'J.K. Rowling', price: 1344, genre: 'Fiction', stock: 15, rating: 4.9, reviewsCount: 2100 },
              { id: 11, title: 'Ikigai: The Japanese Secret', author: 'Hector Garcia', price: 350, genre: 'Self-help', stock: 60, rating: 4.8, reviewsCount: 1150 },
            ]).map((book) => (
              <div key={book.id} style={{ minWidth: '220px', maxWidth: '240px' }}>
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </div>

        {/* 4. Best-Sellers Grid */}
        <div className="amazon-strip-section">
          <div className="amazon-strip-header">
            <div>
              <h2 className="amazon-strip-title">Best Sellers in Books</h2>
              <p style={{ fontSize: '0.85rem', color: '#565959', margin: '2px 0 0' }}>Our most popular products based on sales. Updated hourly.</p>
            </div>
            <Link to="/shop?sort=rating_desc" className="amazon-quad-footer-link" style={{ margin: 0 }}>
              See top 100 <i className="fas fa-chevron-right"></i>
            </Link>
          </div>

          <div className="books-grid">
            {(newArrivals.length > 0 ? newArrivals : featuredBooks).slice(0, 8).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>

        {/* 5. Amazon Trust & Delivery Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <i className="fas fa-truck-fast fa-2x" style={{ color: '#febd69' }}></i>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Fast & Free Delivery</h4>
              <p style={{ fontSize: '0.8rem', color: '#565959' }}>Free shipping on eligible orders above ₹499</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <i className="fas fa-money-bill-wave fa-2x" style={{ color: '#febd69' }}></i>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Pay on Delivery</h4>
              <p style={{ fontSize: '0.8rem', color: '#565959' }}>Cash or UPI available at your doorstep</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <i className="fas fa-rotate-left fa-2x" style={{ color: '#febd69' }}></i>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Easy 7-Day Returns</h4>
              <p style={{ fontSize: '0.8rem', color: '#565959' }}>Hassle-free replacement for any damaged book</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <i className="fas fa-shield-halved fa-2x" style={{ color: '#febd69' }}></i>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>100% Genuine Editions</h4>
              <p style={{ fontSize: '0.8rem', color: '#565959' }}>Directly sourced from trusted publishers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
