import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { productApi } from '../api';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { formatPrice, getImageFallback, formatDate } from '../utils/helpers';
import { StarRating } from '../components/product/ProductCard';
import ProductCard from '../components/product/ProductCard';
import { LoadingCenter, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const wishlistProducts = useSelector((s) => s.wishlist.products);
  const isWishlisted = wishlistProducts.some((p) => (p._id || p) === id);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewDist, setReviewDist] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, rRes, recRes] = await Promise.all([
          productApi.getProduct(id),
          productApi.getReviews(id),
          productApi.getRecommended(id),
        ]);
        setProduct(pRes.data.data.product);
        setReviews(rRes.data.reviews || []);
        setReviewDist(rRes.data.distribution || {});
        setRecommended(recRes.data.data.products || []);
        setActiveImage(0);
        setQuantity(1);
        setSelectedVariants({});
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async (buyNow = false) => {
    if (!user) { toast.error('Please login to add to cart'); navigate('/login'); return; }
    setAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: id, quantity, selectedVariants })).unwrap();
      toast.success('Added to cart!');
      if (buyNow) navigate('/cart');
    } catch (err) {
      toast.error(err || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); return; }
    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(id)).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await dispatch(addToWishlist(id)).unwrap();
        toast.success('Added to wishlist!');
      }
    } catch { toast.error('Failed'); }
  };

  if (loading) return <LoadingCenter />;
  if (!product) return <EmptyState icon="😕" title="Product not found" message="This product may have been removed." action={<Link to="/products" className="btn btn-primary">Browse Products</Link>} />;

  const images = product.images?.length ? product.images : [product.thumbnail];
  const totalReviews = Object.values(reviewDist).reduce((a, b) => a + b, 0);

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
        <Link to="/">Home</Link> › <Link to="/products">Products</Link> › <Link to={`/products?category=${product.category?.slug}`}>{product.category?.name}</Link> › <span style={{ color: 'var(--gray-800)' }}>{product.name}</span>
      </nav>

      {/* Main Product */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--gray-100)', aspectRatio: '1', marginBottom: '1rem' }}>
            <img src={images[activeImage]} alt={product.name} onError={getImageFallback} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: `2px solid ${i === activeImage ? 'var(--primary)' : 'var(--gray-200)'}`, flexShrink: 0, background: 'none', padding: 0 }}>
                  <img src={img} alt="" onError={getImageFallback} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{product.brand}</div>}
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.75rem' }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <StarRating rating={product.ratings} count={product.reviewCount} />
            <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{product.soldCount} sold</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)' }}>{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span style={{ fontSize: '1.125rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>{formatPrice(product.originalPrice)}</span>
                <span className="badge badge-danger">{product.discount}% OFF</span>
              </>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: product.stock > 0 ? '#d1fae5' : '#fee2e2', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 600, color: product.stock > 0 ? '#065f46' : '#991b1b' }}>
            {product.stock > 0 ? `✅ In Stock (${product.stock} available)` : '❌ Out of Stock'}
          </div>

          {/* Variants */}
          {product.variants?.map((variant) => (
            <div key={variant.name} className="form-group">
              <label className="form-label">{variant.name}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {variant.options.map((opt) => (
                  <button key={opt} onClick={() => setSelectedVariants((v) => ({ ...v, [variant.name]: opt }))}
                    style={{ padding: '0.375rem 0.875rem', borderRadius: 'var(--radius-sm)', border: `2px solid ${selectedVariants[variant.name] === opt ? 'var(--primary)' : 'var(--gray-300)'}`, background: selectedVariants[variant.name] === opt ? 'var(--primary-light)' : 'white', color: selectedVariants[variant.name] === opt ? 'var(--primary)' : 'var(--gray-700)', fontWeight: 600, fontSize: '0.875rem', transition: 'var(--transition)' }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 700, fontSize: '1.125rem' }}>{quantity}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>+</button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => handleAddToCart(false)} disabled={addingToCart || product.stock === 0}>
              {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
            </button>
            <button className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => handleAddToCart(true)} disabled={product.stock === 0}>
              ⚡ Buy Now
            </button>
            <button className={`btn btn-lg ${isWishlisted ? 'btn-danger' : 'btn-secondary'}`} onClick={handleWishlist} title="Wishlist">
              {isWishlisted ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Vendor */}
          {product.vendor && (
            <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Sold by</div>
              <Link to={`/vendor/store/${product.vendor.slug}`} style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                🏪 {product.vendor.storeName}
              </Link>
              {product.vendor.rating > 0 && <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>⭐ {product.vendor.rating} vendor rating</div>}
            </div>
          )}

          {/* Delivery */}
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>🚚 <strong>Free shipping</strong> on orders over $50</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>↩️ <strong>30-day returns</strong> — hassle free</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>🔒 <strong>Secure checkout</strong> — 256-bit SSL</div>
          </div>
        </div>
      </div>

      {/* Description & Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card">
          <div className="card-header"><h3 style={{ fontWeight: 700 }}>Description</h3></div>
          <div className="card-body"><p style={{ lineHeight: 1.8, color: 'var(--gray-700)' }}>{product.description}</p></div>
        </div>
        {product.specifications?.length > 0 && (
          <div className="card">
            <div className="card-header"><h3 style={{ fontWeight: 700 }}>Specifications</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  {product.specifications.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--gray-600)', width: '40%', padding: '0.75rem 1rem', background: i % 2 === 0 ? 'var(--gray-50)' : 'white' }}>{s.key}</td>
                      <td style={{ padding: '0.75rem 1rem', background: i % 2 === 0 ? 'var(--gray-50)' : 'white' }}>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="card" style={{ marginBottom: '3rem' }}>
        <div className="card-header">
          <h3 style={{ fontWeight: 700 }}>Customer Reviews ({product.reviewCount})</h3>
        </div>
        <div className="card-body">
          {product.reviewCount > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{product.ratings}</div>
                <StarRating rating={product.ratings} />
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>{product.reviewCount} reviews</div>
              </div>
              <div>
                {[5,4,3,2,1].map((star) => {
                  const count = reviewDist[star] || 0;
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.8125rem', width: '30px', textAlign: 'right' }}>{star}★</span>
                      <div style={{ flex: 1, height: '8px', background: 'var(--gray-200)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: '999px' }} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', width: '30px' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <EmptyState icon="💬" title="No reviews yet" message="Be the first to review this product after purchase." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {reviews.map((r) => (
                <div key={r._id} style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {r.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{r.user?.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{formatDate(r.createdAt)}</div>
                    </div>
                    {r.isVerified && <span className="badge badge-success" style={{ marginLeft: 'auto' }}>✓ Verified Purchase</span>}
                  </div>
                  <StarRating rating={r.rating} />
                  {r.title && <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>{r.title}</div>}
                  <p style={{ color: 'var(--gray-700)', marginTop: '0.375rem', lineHeight: 1.7 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <section>
          <div className="section-header"><h2 className="section-title">You May Also Like</h2></div>
          <div className="grid grid-4">
            {recommended.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 768px) {
          .container > div:first-of-type { grid-template-columns: 1fr !important; }
          .container > div:nth-of-type(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
