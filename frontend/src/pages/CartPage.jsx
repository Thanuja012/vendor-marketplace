import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/cartSlice';
import { addToWishlist } from '../store/wishlistSlice';
import { formatPrice, getImageFallback } from '../utils/helpers';
import { LoadingCenter, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { items, loading } = useSelector((s) => s.cart);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user, dispatch]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingFee + tax;

  const handleQty = async (itemId, qty) => {
    try {
      await dispatch(updateCartItem({ itemId, quantity: qty })).unwrap();
    } catch (err) { toast.error(err || 'Failed to update'); }
  };

  const handleRemove = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      toast.success('Item removed');
    } catch { toast.error('Failed to remove'); }
  };

  const handleMoveToWishlist = async (item) => {
    if (!user) { toast.error('Please login'); return; }
    try {
      await dispatch(addToWishlist(item.product._id)).unwrap();
      await dispatch(removeFromCart(item._id)).unwrap();
      toast.success('Moved to wishlist');
    } catch { toast.error('Failed'); }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all items from cart?')) return;
    await dispatch(clearCart());
    toast.success('Cart cleared');
  };

  if (loading) return <LoadingCenter />;

  if (!user) return (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <EmptyState icon="🛒" title="Your cart is empty" message="Login to view your cart and start shopping." action={<Link to="/login" className="btn btn-primary">Login</Link>} />
    </div>
  );

  if (items.length === 0) return (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <EmptyState icon="🛒" title="Your cart is empty" message="Looks like you haven't added anything yet." action={<Link to="/products" className="btn btn-primary">Start Shopping</Link>} />
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Shopping Cart <span style={{ color: 'var(--gray-500)', fontSize: '1.125rem' }}>({items.length} items)</span></h1>
        <button className="btn btn-ghost btn-sm" onClick={handleClear}>🗑️ Clear Cart</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item) => (
            <div key={item._id} className="card">
              <div className="card-body" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <Link to={`/products/${item.product?._id}`}>
                  <img src={item.product?.thumbnail} alt={item.product?.name} onError={getImageFallback} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                </Link>
                <div style={{ flex: 1 }}>
                  <Link to={`/products/${item.product?._id}`} style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--gray-800)' }}>{item.product?.name}</Link>
                  {item.product?.vendor && <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>by {item.product.vendor.storeName}</div>}
                  {item.selectedVariants && Object.entries(item.selectedVariants).length > 0 && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                      {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleQty(item._id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                      <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleQty(item._id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleMoveToWishlist(item)}>🤍 Save</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleRemove(item._id)}>🗑️ Remove</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{formatPrice(item.price * item.quantity)}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{formatPrice(item.price)} each</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card" style={{ position: 'sticky', top: '80px' }}>
          <div className="card-header"><h3 style={{ fontWeight: 700 }}>Order Summary</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-600)' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-600)' }}>Shipping</span>
                <span style={{ fontWeight: 600, color: shippingFee === 0 ? 'var(--success)' : 'inherit' }}>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-600)' }}>Tax (8%)</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(tax)}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--gray-200)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{formatPrice(total)}</span>
              </div>
            </div>
            {shippingFee > 0 && <div style={{ fontSize: '0.8125rem', color: 'var(--success)', marginBottom: '1rem', background: '#d1fae5', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>Add {formatPrice(50 - subtotal)} more for free shipping!</div>}
            <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
            <Link to="/products" className="btn btn-secondary btn-full" style={{ marginTop: '0.75rem' }}>← Continue Shopping</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div:last-of-type { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
