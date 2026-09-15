import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi, categoryApi } from '../api';
import ProductCard from '../components/product/ProductCard';
import { SkeletonGrid, EmptyState, Pagination } from '../components/common';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') || '',
    featured: searchParams.get('featured') || '',
    sort: searchParams.get('sort') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    categoryApi.getCategories().then((r) => setCategories(r.data.data.categories || []));
  }, []);

  const fetchProducts = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '' && v !== null));
      const res = await productApi.getProducts(params);
      setProducts(res.data.products || []);
      setPagination(res.data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params, { replace: true });
  }, [filters, fetchProducts]);

  const updateFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  const clearFilters = () => setFilters({ search: '', category: '', brand: '', minPrice: '', maxPrice: '', rating: '', inStock: '', featured: '', sort: '', page: 1 });

  const activeFilterCount = [filters.category, filters.brand, filters.minPrice, filters.maxPrice, filters.rating, filters.inStock, filters.featured].filter(Boolean).length;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* Sidebar Filters */}
        <aside className="card" style={{ position: 'sticky', top: '80px' }}>
          <div className="card-header">
            <span style={{ fontWeight: 700 }}>Filters {activeFilterCount > 0 && <span className="badge badge-primary">{activeFilterCount}</span>}</span>
            {activeFilterCount > 0 && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all</button>}
          </div>
          <div className="card-body" style={{ padding: '1rem' }}>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price Range</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="form-control" type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} />
                <input className="form-control" type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Min Rating</label>
              <select className="form-control" value={filters.rating} onChange={(e) => updateFilter('rating', e.target.value)}>
                <option value="">Any Rating</option>
                <option value="4">4★ & above</option>
                <option value="3">3★ & above</option>
                <option value="2">2★ & above</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={filters.inStock === 'true'} onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')} />
                <span className="form-label" style={{ margin: 0 }}>In Stock Only</span>
              </label>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={filters.featured === 'true'} onChange={(e) => updateFilter('featured', e.target.checked ? 'true' : '')} />
                <span className="form-label" style={{ margin: 0 }}>Featured / Deals</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>
                {filters.search ? `Results for "${filters.search}"` : filters.category ? categories.find((c) => c.slug === filters.category)?.name || 'Products' : 'All Products'}
              </h1>
              {pagination && <p className="text-muted text-sm">{pagination.total} products found</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input className="form-control" style={{ width: '200px' }} placeholder="Search brand..." value={filters.brand} onChange={(e) => updateFilter('brand', e.target.value)} />
              <select className="form-control" style={{ width: '180px' }} value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? <SkeletonGrid count={8} /> : products.length === 0 ? (
            <EmptyState icon="🔍" title="No products found" message="Try adjusting your filters or search terms." action={<button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>} />
          ) : (
            <>
              <div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination pagination={pagination} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div { grid-template-columns: 1fr !important; }
          aside { position: static !important; }
        }
      `}</style>
    </div>
  );
}
