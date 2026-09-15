import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/wishlistSlice';
import { formatPrice, getImageFallback } from '../../utils/helpers';
import toast from 'react-hot-toast';

function StarRating({ rating, count }) {
  return (
    <div className="flex gap-1" style={{ alignItems: 'center', gap: '0.375rem' }}>
      <div className="stars">
        {[1,2,3,4,5].map((s) => (
          <span key={s} className={`star ${s <= Math.round(rating) ? 'filled' : ''}`}>★</span>
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-muted">({count})</span>}
    </div>
  );
}

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const wishlistProducts = useSelector((s) => s.wishlist.products);
  const isWishlisted = wishlistProducts.some((p) => (p._id || p) === product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add to cart'); return; }
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err || 'Failed to add to cart');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to use wishlist'); return; }
    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
        toast.success('Added to wishlist!');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <div className="product-card-image">
          <img src={product.thumbnail || product.images?.[0]} alt={product.name} onError={getImageFallback} loading="lazy" />
          {product.discount > 0 && <span className="discount-badge">-{product.discount}%</span>}
          <button className={`wishlist-btn ${isWishlisted ? 'active' : ''}`} onClick={handleWishlist} title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
            {isWishlisted ? '❤️' : '🤍'}
          </button>
        </div>
        <div className="product-card-body">
          {product.brand && <div className="product-card-brand">{product.brand}</div>}
          <div className="product-card-name">{product.name}</div>
          <StarRating rating={product.ratings} count={product.reviewCount} />
          <div className="product-card-price" style={{ marginTop: '0.5rem' }}>
            <span className="current">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="original">{formatPrice(product.originalPrice)}</span>
            )}
            {product.discount > 0 && <span className="discount">{product.discount}% off</span>}
          </div>
        </div>
      </Link>
      <div style={{ padding: '0 1rem 1rem' }}>
        <button
          className="btn btn-primary btn-full btn-sm"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export { StarRating };
