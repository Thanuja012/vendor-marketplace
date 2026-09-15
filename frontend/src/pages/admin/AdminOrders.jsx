import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';
import { LoadingCenter, EmptyState, Pagination } from '../../components/common';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const load = (p=1,s='') => {
    setLoading(true);
    adminApi.getOrders({ page:p, limit:15, status:s }).then((r)=>{ setOrders(r.data.orders||[]); setPagination(r.data.pagination); }).finally(()=>setLoading(false));
  };

  useEffect(()=>load(page,statusFilter),[page,statusFilter]);

  return (
    <div>
      <h1 style={{ fontSize:'1.5rem', fontWeight:700, marginBottom:'1.5rem' }}>Orders</h1>
      <div className="card">
        <div className="card-header">
          <select className="form-control" style={{ width:200 }} value={statusFilter} onChange={(e)=>{ setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {['placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled'].map((s)=>(
              <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
            ))}
          </select>
        </div>
        {loading ? <LoadingCenter /> : orders.length===0 ? <EmptyState icon="🛒" title="No orders" message="No orders found." /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map((o)=>(
                  <tr key={o._id}>
                    <td style={{ fontWeight:700, color:'var(--primary)' }}>{o.orderId}</td>
                    <td>{o.user?.name||'—'}<div style={{ fontSize:'0.8125rem', color:'var(--gray-500)' }}>{o.user?.email}</div></td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>{o.items?.length}</td>
                    <td style={{ fontWeight:700 }}>{formatPrice(o.totalAmount)}</td>
                    <td><span className={`badge ${['paid','mock_paid'].includes(o.paymentStatus)?'badge-success':'badge-warning'}`}>{o.paymentStatus === 'mock_paid' ? 'MOCK PAID' : o.paymentStatus}</span></td>
                    <td><span style={{ padding:'0.25rem 0.75rem', borderRadius:'999px', fontSize:'0.8125rem', fontWeight:700, background:getOrderStatusColor(o.orderStatus)+'20', color:getOrderStatusColor(o.orderStatus) }}>{getOrderStatusLabel(o.orderStatus)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="card-footer"><Pagination pagination={pagination} onPageChange={setPage} /></div>
      </div>
    </div>
  );
}
