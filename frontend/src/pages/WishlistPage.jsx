import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import { formatPrice, getImageFallback } from '../utils/helpers';
import { LoadingCenter, EmptyState } from '../components/common';
import { StarRating } from '../components/product/ProductCard';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((s) => s.wishlist);
  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  const handleRemove = async (productId) => {
    try { await dispatch(removeFromWishlist(productId)).unwrap(); toast.success('Removed'); } catch { toast.error('Failed'); }
  };
  const handleMoveToCart = async (product) => {
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      await dispatch(removeFromWishlist(product._id)).unwrap();
      toast.success('Moved to cart!');
    } catch (err) { toast.error(err || 'Failed'); }
  };

  if (loading) return <LoadingCenter />;
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>My Wishlist <span style={{ color: 'var(--gray-500)', fontSize: '1.125rem' }}>({products.length})</span></h1>
      {products.length === 0 ? (
        <EmptyState icon="🤍" title="Your wishlist is empty" message="Save products you love." action={<Link to="/products" className="btn btn-primary">Browse Products</Link>} />
      ) : (
        <div className="grid grid-4">
          {products.map((p) => (
            <div key={p._id} className="product-card">
              <Link to={`/products/${p._id}`}>
                <div className="product-card-image">
                  <img src={p.thumbnail} alt={p.name} onError={getImageFallback} loading="lazy" />
                  {p.discount > 0 && <span className="discount-badge">-{p.discount}%</span>}
                </div>
                <div className="product-card-body">
                  {p.brand && <div className="product-card-brand">{p.brand}</div>}
                  <div className="product-card-name">{p.name}</div>
                  <StarRating rating={p.ratings} count={p.reviewCount} />
                  <div className="product-card-price" style={{ marginTop: '0.5rem' }}>
                    <span className="current">{formatPrice(p.price)}</span>
                    {p.originalPrice > p.price && <span className="original">{formatPrice(p.originalPrice)}</span>}
                  </div>
                </div>
              </Link>
              <div style={{ padding: '0 1rem 1rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleMoveToCart(p)} disabled={p.stock === 0}>{p.stock === 0 ? 'Out of Stock' : '🛒 Move to Cart'}</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleRemove(p._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
