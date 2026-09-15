import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { orderApi } from '../api';
import { formatPrice, getImageFallback } from '../utils/helpers';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Review Order', 'Payment', 'Confirm'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ fullName: user?.name || '', phone: user?.phone || '', street: '', city: '', state: '', zipCode: '', country: 'US' });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingFee + tax;

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
    const saved = user?.addresses?.find((a) => a.isDefault);
    if (saved) setAddress({ fullName: saved.fullName || user.name, phone: saved.phone || user.phone || '', street: saved.street, city: saved.city, state: saved.state, zipCode: saved.zipCode, country: saved.country || 'US' });
  }, []);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({ productId: i.product._id, quantity: i.quantity, selectedVariants: i.selectedVariants || {} }));
      const res = await orderApi.createOrder({ items: orderItems, shippingAddress: address, paymentMethod });
      toast.success('Order placed successfully!');
      navigate(`/order-success/${res.data.data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const addrValid = address.fullName && address.street && address.city && address.state && address.zipCode;

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Checkout</h1>

      {/* Steps */}
      <div style={{ display: 'flex', marginBottom: '2.5rem' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: i <= step ? 'var(--primary)' : 'var(--gray-200)', color: i <= step ? 'white' : 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>{i < step ? '✓' : i + 1}</div>
              <span style={{ fontSize: '0.75rem', marginTop: '0.375rem', fontWeight: i === step ? 700 : 400, color: i === step ? 'var(--primary)' : 'var(--gray-500)' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--primary)' : 'var(--gray-200)', marginBottom: '1.25rem' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
        <div>
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="card">
              <div className="card-header"><h3 style={{ fontWeight: 700 }}>Shipping Address</h3></div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Street Address</label><input className="form-control" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">City</label><input className="form-control" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">State</label><input className="form-control" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">ZIP Code</label><input className="form-control" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Country</label><input className="form-control" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} /></div>
                </div>
                <button className="btn btn-primary btn-full" onClick={() => setStep(1)} disabled={!addrValid}>Continue to Review →</button>
              </div>
            </div>
          )}

          {/* Step 1: Review */}
          {step === 1 && (
            <div className="card">
              <div className="card-header"><h3 style={{ fontWeight: 700 }}>Review Your Order</h3></div>
              <div className="card-body" style={{ padding: 0 }}>
                {items.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--gray-100)' }}>
                    <img src={item.product?.thumbnail} alt={item.product?.name} onError={getImageFallback} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
                <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(2)}>Continue to Payment →</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card">
              <div className="card-header"><h3 style={{ fontWeight: 700 }}>Payment Method</h3></div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[{ value: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' }, { value: 'card', label: '💳 Credit / Debit Card', desc: 'Secure card payment' }].map((opt) => (
                    <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: `2px solid ${paymentMethod === opt.value ? 'var(--primary)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: paymentMethod === opt.value ? 'var(--primary-light)' : 'white' }}>
                      <input type="radio" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} />
                      <div><div style={{ fontWeight: 600 }}>{opt.label}</div><div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{opt.desc}</div></div>
                    </label>
                  ))}
                </div>
                {paymentMethod === 'card' && (
                  <div style={{ padding: '1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#9a3412', marginBottom: '0.375rem' }}>Demo card payment</div>
                    <p style={{ fontSize: '0.8125rem', color: '#9a3412', margin: 0 }}>
                      This is a mock payment for portfolio demonstration only. No card details are requested, processed, or stored, and no real charge will be made.
                    </p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>Review & Confirm →</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="card">
              <div className="card-header"><h3 style={{ fontWeight: 700 }}>Confirm Order</h3></div>
              <div className="card-body">
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📍 Shipping to:</div>
                  <div style={{ color: 'var(--gray-600)', fontSize: '0.9375rem' }}>{address.fullName}, {address.street}, {address.city}, {address.state} {address.zipCode}</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>💳 Payment:</div>
                  <div style={{ color: 'var(--gray-600)' }}>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Demo card payment (mock)'}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-success btn-lg" style={{ flex: 1 }} onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? 'Placing Order...' : '✅ Place Order'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card" style={{ position: 'sticky', top: '80px' }}>
          <div className="card-header"><h3 style={{ fontWeight: 700 }}>Summary</h3></div>
          <div className="card-body">
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>Final totals are recalculated securely by the server.</div>
            {[['Subtotal estimate', formatPrice(subtotal)], ['Shipping estimate', shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)], ['Tax estimate (8%)', formatPrice(tax)]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--gray-600)' }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--gray-200)', margin: '0.75rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Estimated total</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
