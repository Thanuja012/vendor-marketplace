import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../api';
import { formatPrice, formatDate } from '../utils/helpers';
import { LoadingCenter } from '../components/common';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getOrder(id).then((r) => { setOrder(r.data.data.order); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingCenter />;

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '600px', textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.5rem' }}>Order Placed!</h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: '2rem', fontSize: '1.0625rem' }}>Thank you for your purchase. Your order has been confirmed.</p>

      {order && (
        <div className="card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div><div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Order ID</div><div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>{order.orderId}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Date</div><div style={{ fontWeight: 600 }}>{formatDate(order.createdAt)}</div></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div><div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Payment</div><div style={{ fontWeight: 600 }}>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Demo card payment (mock)'}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Total</div><div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{formatPrice(order.totalAmount)}</div></div>
            </div>
            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '0.875rem' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Shipping to</div>
              <div style={{ fontWeight: 600 }}>{order.shippingAddress?.fullName}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to={`/orders/${id}`} className="btn btn-primary btn-lg">Track Order</Link>
        <Link to="/products" className="btn btn-secondary btn-lg">Continue Shopping</Link>
      </div>
    </div>
  );
}
