import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api';
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from '../utils/helpers';
import { LoadingCenter, EmptyState, Pagination } from '../components/common';
import { getImageFallback } from '../utils/helpers';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    orderApi.getOrders({ page, limit: 10 }).then((r) => {
      setOrders(r.data.orders || []);
      setPagination(r.data.pagination);
    }).finally(() => setLoading(false));
  }, [page]);

  if (loading) return <LoadingCenter />;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" message="Start shopping to see your orders here." action={<Link to="/products" className="btn btn-primary">Shop Now</Link>} />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order) => (
              <div key={order._id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.0625rem' }}>{order.orderId}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{formatDate(order.createdAt)}</div>
                    </div>
                    <span style={{ padding: '0.375rem 0.875rem', borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 700, background: getOrderStatusColor(order.orderStatus) + '20', color: getOrderStatusColor(order.orderStatus) }}>
                      {getOrderStatusLabel(order.orderStatus)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', overflowX: 'auto' }}>
                    {order.items?.slice(0, 4).map((item, i) => (
                      <img key={i} src={item.image} alt={item.name} onError={getImageFallback} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                    ))}
                    {order.items?.length > 4 && <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }}>+{order.items.length - 4}</div>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Demo card payment'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>{formatPrice(order.totalAmount)}</span>
                      <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">View Details</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
