import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productApi, categoryApi } from '../api';
import ProductCard from '../components/product/ProductCard';
import { SkeletonGrid, EmptyState } from '../components/common';
import { getImageFallback } from '../utils/helpers';

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, trendRes, catRes] = await Promise.all([
          productApi.getFeatured(),
          productApi.getProducts({ sort: 'popular', limit: 8 }),
          categoryApi.getCategories(),
        ]);
        setFeatured(featRes.data.data.products || []);
        setTrending(trendRes.data.products || []);
        setCategories(catRes.data.data.categories || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">🎉 New arrivals every day</div>
            <h1 className="hero-title">Discover Products From<br /><span>Trusted Sellers</span></h1>
            <p className="hero-subtitle">Shop from thousands of verified vendors. Best prices, fast delivery, and easy returns.</p>
            <form className="hero-search" onSubmit={handleSearch}>
              <input type="text" placeholder="Search for products, brands, categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-lg">Search</button>
            </form>
            <div className="hero-stats">
              <div className="hero-stat"><strong>50K+</strong><span>Products</span></div>
              <div className="hero-stat"><strong>500+</strong><span>Vendors</span></div>
              <div className="hero-stat"><strong>1M+</strong><span>Customers</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <div><h2 className="section-title">Shop by Category</h2><p className="section-subtitle">Find exactly what you're looking for</p></div>
            <Link to="/products" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="categories-grid">
            {categories.slice(0, 10).map((cat) => (
              <Link key={cat._id} to={`/products?category=${cat.slug}`} className="category-card">
                <div className="category-img">
                  <img src={cat.image} alt={cat.name} onError={getImageFallback} loading="lazy" />
                </div>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">⚡ Flash Deals</h2>
              <p className="section-subtitle">Limited time offers — grab them before they're gone</p>
            </div>
            <Link to="/products?featured=true" className="btn btn-outline btn-sm">See All Deals</Link>
          </div>
          {loading ? <SkeletonGrid count={4} /> : (
            <div className="grid grid-4">
              {featured.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Trending */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <div><h2 className="section-title">🔥 Trending Now</h2><p className="section-subtitle">Most popular products this week</p></div>
            <Link to="/products?sort=popular" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {loading ? <SkeletonGrid count={8} /> : (
            <div className="grid grid-4">
              {trending.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-grid">
            <div className="promo-card promo-blue">
              <div className="promo-content">
                <h3>Free Shipping</h3>
                <p>On orders over $50</p>
                <Link to="/products" className="btn btn-primary btn-sm">Shop Now</Link>
              </div>
              <div className="promo-icon">🚚</div>
            </div>
            <div className="promo-card promo-orange">
              <div className="promo-content">
                <h3>Become a Vendor</h3>
                <p>Start selling today</p>
                <Link to="/register?role=vendor" className="btn btn-secondary btn-sm">Get Started</Link>
              </div>
              <div className="promo-icon">🏪</div>
            </div>
            <div className="promo-card promo-green">
              <div className="promo-content">
                <h3>Secure Payments</h3>
                <p>100% safe checkout</p>
                <Link to="/products" className="btn btn-success btn-sm">Shop Safely</Link>
              </div>
              <div className="promo-icon">🔒</div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div><h2 className="section-title">⭐ Best Sellers</h2><p className="section-subtitle">Top-rated products loved by customers</p></div>
            <Link to="/products?sort=rating" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {loading ? <SkeletonGrid count={4} /> : (
            <div className="grid grid-4">
              {featured.slice(4, 8).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .hero { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); color: white; padding: 5rem 0; }
        .hero-content { max-width: 700px; }
        .hero-badge { display: inline-flex; align-items: center; background: rgba(255,255,255,0.15); padding: 0.375rem 1rem; border-radius: 999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; }
        .hero-title { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.15; margin-bottom: 1rem; }
        .hero-title span { color: #fbbf24; }
        .hero-subtitle { font-size: 1.125rem; opacity: 0.85; margin-bottom: 2rem; max-width: 500px; }
        .hero-search { display: flex; gap: 0.75rem; max-width: 560px; margin-bottom: 2rem; }
        .hero-search input { flex: 1; padding: 0.875rem 1.25rem; border-radius: var(--radius-sm); border: none; font-size: 1rem; outline: none; }
        .hero-stats { display: flex; gap: 2.5rem; }
        .hero-stat { display: flex; flex-direction: column; }
        .hero-stat strong { font-size: 1.5rem; font-weight: 800; }
        .hero-stat span { font-size: 0.875rem; opacity: 0.75; }
        .categories-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; }
        .category-card { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1.25rem 0.75rem; border-radius: var(--radius); background: var(--gray-50); border: 1.5px solid var(--gray-200); transition: var(--transition); text-align: center; font-size: 0.875rem; font-weight: 600; color: var(--gray-700); }
        .category-card:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .category-img { width: 64px; height: 64px; border-radius: var(--radius-sm); overflow: hidden; }
        .category-img img { width: 100%; height: 100%; object-fit: cover; }
        .promo-section { padding: 3rem 0; background: var(--gray-100); }
        .promo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .promo-card { border-radius: var(--radius-lg); padding: 2rem; display: flex; align-items: center; justify-content: space-between; overflow: hidden; position: relative; }
        .promo-blue { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; }
        .promo-orange { background: linear-gradient(135deg, #c2410c, #f97316); color: white; }
        .promo-green { background: linear-gradient(135deg, #065f46, #10b981); color: white; }
        .promo-content h3 { font-size: 1.375rem; font-weight: 700; margin-bottom: 0.375rem; }
        .promo-content p { opacity: 0.85; margin-bottom: 1rem; }
        .promo-icon { font-size: 4rem; opacity: 0.3; }
        @media (max-width: 1024px) { .categories-grid { grid-template-columns: repeat(4, 1fr); } .promo-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .categories-grid { grid-template-columns: repeat(3, 1fr); } .hero-search { flex-direction: column; } .hero-stats { gap: 1.5rem; } }
        @media (max-width: 480px) { .categories-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
