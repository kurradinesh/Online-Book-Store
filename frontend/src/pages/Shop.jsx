import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { api } from '../services/api';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter State synced with URL parameters
  const selectedGenre = searchParams.get('genre') || '';
  const searchQuery = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const inStockOnly = searchParams.get('inStock') === 'true';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Custom price range inputs
  const [customMaxPrice, setCustomMaxPrice] = useState(maxPrice);

  // Load distinct categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.books.getCategories();
        if (res.data) setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch books whenever filters change
  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const res = await api.books.getAll({
          genre: selectedGenre,
          search: searchQuery,
          sort: sort,
          page: page,
          size: 12,
          inStockOnly: inStockOnly,
          maxPrice: maxPrice || undefined,
        });

        if (res.data) {
          setBooks(res.data.content || []);
          setTotalPages(res.data.totalPages || 0);
          setTotalElements(res.data.totalElements || 0);
        }
      } catch (err) {
        console.error("Failed to load books:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [selectedGenre, searchQuery, sort, page, inStockOnly, maxPrice]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    if (key !== 'page') {
      nextParams.set('page', '0');
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setCustomMaxPrice('');
  };

  return (
    <div className="container" style={{ padding: '16px 0 60px' }}>
      {/* 1. Amazon Top Search Summary & Sorting Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '12px 18px', borderRadius: '4px', border: '1px solid #e7e7e7', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '0.9rem', color: '#565959' }}>
            Showing <strong>1-{books.length}</strong> of <strong>{totalElements}</strong> results
            {searchQuery && <> for "<span style={{ color: '#c45500', fontWeight: 700 }}>{searchQuery}</span>"</>}
            {selectedGenre && <> in <span style={{ color: '#007185', fontWeight: 600 }}>{selectedGenre}</span></>}
          </span>
        </div>

        {/* Amazon Sort By Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="shop-sort-select" style={{ fontSize: '0.85rem', color: '#565959' }}>Sort by:</label>
          <select
            id="shop-sort-select"
            className="form-select"
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #d5d9d9', background: '#f0f2f2' }}
          >
            <option value="newest">Featured / Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Avg. Customer Review</option>
          </select>
        </div>
      </div>

      {/* 2. Amazon Sidebar + Results Layout */}
      <div className="shop-layout" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
        {/* Left Column: Amazon Filter Facets */}
        <aside className="shop-filters-sidebar" style={{ background: '#ffffff', borderRadius: '8px', padding: '18px', border: '1px solid #e7e7e7', height: 'fit-content' }}>
          {/* Active Filters / Reset */}
          {(selectedGenre || searchQuery || inStockOnly || maxPrice) && (
            <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e7e7e7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Active Filters</span>
                <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', color: '#007185', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                  Clear all
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedGenre && (
                  <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                    {selectedGenre} <i className="fas fa-times" style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => updateParam('genre', '')}></i>
                  </span>
                )}
                {maxPrice && (
                  <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                    Under ₹{maxPrice} <i className="fas fa-times" style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => updateParam('maxPrice', '')}></i>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Department / Category Filter */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>Department</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span
                onClick={() => updateParam('genre', '')}
                style={{
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: selectedGenre === '' ? 700 : 400,
                  color: selectedGenre === '' ? '#c45500' : '#007185',
                }}
              >
                All Departments
              </span>
              {(categories.length > 0 ? categories : ['Self-help', 'Programming', 'Fiction', 'Finance', 'Textbook', 'Biography', 'Science']).map((cat) => (
                <span
                  key={cat}
                  onClick={() => updateParam('genre', cat)}
                  style={{
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: selectedGenre === cat ? 700 : 500,
                    color: selectedGenre === cat ? '#bc8a5f' : 'var(--text-muted)',
                    marginLeft: '8px',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>Customer Reviews</h4>
            {[4, 3, 2].map((stars) => (
              <div
                key={stars}
                onClick={() => updateParam('sort', 'rating_desc')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#bc8a5f', cursor: 'pointer', marginBottom: '6px' }}
              >
                <div style={{ color: '#d4a373' }}>
                  {[...Array(stars)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                  {[...Array(5 - stars)].map((_, i) => <i key={i} className="far fa-star text-muted"></i>)}
                </div>
                <span style={{ color: 'var(--text-muted)' }}>& Up</span>
              </div>
            ))}
          </div>

          {/* Price Range Presets */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>Price</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <span onClick={() => updateParam('maxPrice', '300')} style={{ cursor: 'pointer', color: maxPrice === '300' ? '#bc8a5f' : 'var(--text-muted)', fontWeight: maxPrice === '300' ? 700 : 400 }}>
                Under ₹300
              </span>
              <span onClick={() => updateParam('maxPrice', '500')} style={{ cursor: 'pointer', color: maxPrice === '500' ? '#bc8a5f' : 'var(--text-muted)', fontWeight: maxPrice === '500' ? 700 : 400 }}>
                ₹300 - ₹500
              </span>
              <span onClick={() => updateParam('maxPrice', '1000')} style={{ cursor: 'pointer', color: maxPrice === '1000' ? '#bc8a5f' : 'var(--text-muted)', fontWeight: maxPrice === '1000' ? 700 : 400 }}>
                ₹500 - ₹1,000
              </span>
              <span onClick={() => updateParam('maxPrice', '')} style={{ cursor: 'pointer', color: maxPrice === '' ? '#bc8a5f' : 'var(--text-muted)', fontWeight: maxPrice === '' ? 700 : 400 }}>
                All Prices
              </span>
            </div>

            {/* Custom Max Price Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); updateParam('maxPrice', customMaxPrice); }}
              style={{ display: 'flex', gap: '6px', marginTop: '10px' }}
            >
              <input
                type="number"
                placeholder="Max ₹"
                value={customMaxPrice}
                onChange={(e) => setCustomMaxPrice(e.target.value)}
                style={{ width: '80px', padding: '4px 8px', fontSize: '0.8rem', border: '1px solid #d5d9d9', borderRadius: '4px' }}
              />
              <button type="submit" className="btn btn-amazon-yellow" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                Go
              </button>
            </form>
          </div>

          {/* Availability */}
          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Availability</h4>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Right Column: Book Grid Results */}
        <main>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <i className="fas fa-spinner fa-spin fa-2x" style={{ color: '#febd69', marginBottom: '12px' }}></i>
              <p>Searching BookNook Library...</p>
            </div>
          ) : books.length === 0 ? (
            <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e7e7e7' }}>
              <i className="fas fa-book-open fa-3x" style={{ color: '#ccc', marginBottom: '16px' }}></i>
              <h3>No matching books found</h3>
              <p style={{ color: '#565959', marginBottom: '16px' }}>
                We couldn't find any results matching your search or active filters.
              </p>
              <button onClick={clearAllFilters} className="btn btn-amazon-yellow">
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="books-grid">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* Amazon Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '36px' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page <= 0}
                    onClick={() => updateParam('page', page - 1)}
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>

                  <span style={{ fontSize: '0.85rem', color: '#565959', padding: '0 8px' }}>
                    Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
                  </span>

                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => updateParam('page', page + 1)}
                  >
                    Next <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
