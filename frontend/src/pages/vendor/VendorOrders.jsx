import { useEffect, useState } from 'react';
import { vendorApi } from '../../api';
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from '../../utils/helpers';
import { LoadingCenter, EmptyState, Pagination } from '../../components/common';
import toast from 'react-hot-toast';

const STATUSES = ['confirmed','processing','shipped','out_for_delivery','delivered'];

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = (p=1, s='') => {
    setLoading(true);
    vendorApi.getOrders({ page:p, limit:10, status:s }).then((r)=>{
      setOrders(r.data.orders||[]);
      setPagination(r.data.pagination);
    }).finally(()=>setLoading(false));
  };

  useEffect(()=>{ load(page, statusFilter); }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await vendorApi.updateOrderStatus(orderId, status);
      toast.success('Status updated');
      load(page, statusFilter);
      setSelected(null);
    } catch { toast.error('Failed'); }
    finally { setUpdating(null); }
  };

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
        {loading ? <LoadingCenter /> : orders.length===0 ? <EmptyState icon="📦" title="No orders" message="No orders found." /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map((o)=>(
                  <tr key={o._id}>
                    <td style={{ fontWeight:700, color:'var(--primary)' }}>{o.orderId}</td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>{o.user?.name||'—'}</td>
                    <td style={{ fontWeight:600 }}>{formatPrice(o.totalAmount)}</td>
                    <td><span style={{ padding:'0.25rem 0.75rem', borderRadius:'999px', fontSize:'0.8125rem', fontWeight:700, background:getOrderStatusColor(o.orderStatus)+'20', color:getOrderStatusColor(o.orderStatus) }}>{getOrderStatusLabel(o.orderStatus)}</span></td>
                    <td>
                      {o.orderStatus!=='cancelled' && o.orderStatus!=='delivered' && (
                        <select className="form-control" style={{ width:160, fontSize:'0.8125rem', padding:'0.375rem 0.5rem' }}
                          value="" onChange={(e)=>{ if(e.target.value) handleStatusUpdate(o._id, e.target.value); }}
                          disabled={updating===o._id}>
                          <option value="">Update status</option>
                          {STATUSES.filter((s)=>STATUSES.indexOf(s)>STATUSES.indexOf(o.orderStatus)||o.orderStatus==='placed').map((s)=>(
                            <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
                          ))}
                        </select>
                      )}
                    </td>
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
