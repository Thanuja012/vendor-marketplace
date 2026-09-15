import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi, productApi } from '../api';
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel, getImageFallback, ORDER_STATUSES } from '../utils/helpers';
import { LoadingCenter } from '../components/common';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReview, setShowReview] = useState(null);
  const [review, setReview] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    orderApi.getOrder(id).then((r) => setOrder(r.data.data.order)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const r = await orderApi.cancelOrder(id);
      setOrder(r.data.data.order);
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
    finally { setCancelling(false); }
  };

  const handleReview = async (productId) => {
    try {
      await productApi.createReview(productId, { ...review, orderId: id });
      toast.success('Review submitted!');
      setShowReview(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <LoadingCenter />;
  if (!order) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Order not found. <Link to="/orders">Back</Link></div>;

  const statusSteps = ['placed','confirmed','processing','shipped','out_for_delivery','delivered'];
  const statusIndex = statusSteps.indexOf(order.orderStatus);
  const isCancellable = ['placed','confirmed'].includes(order.orderStatus);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <Link to="/orders" style={{ color:'var(--gray-500)', fontSize:'0.875rem' }}>← My Orders</Link>
          <h1 style={{ fontSize:'1.5rem', fontWeight:700, marginTop:'0.25rem' }}>Order {order.orderId}</h1>
          <div style={{ fontSize:'0.875rem', color:'var(--gray-500)' }}>Placed on {formatDate(order.createdAt)}</div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
          <span style={{ padding:'0.5rem 1rem', borderRadius:'999px', fontWeight:700, background:getOrderStatusColor(order.orderStatus)+'20', color:getOrderStatusColor(order.orderStatus) }}>{getOrderStatusLabel(order.orderStatus)}</span>
          {isCancellable && <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling}>{cancelling?'Cancelling...':'Cancel Order'}</button>}
        </div>
      </div>

      {order.orderStatus !== 'cancelled' && (
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div className="card-header"><h3 style={{ fontWeight:700 }}>Order Tracking</h3></div>
          <div className="card-body">
            <div style={{ display:'flex', alignItems:'center', overflowX:'auto', paddingBottom:'0.5rem' }}>
              {statusSteps.map((s, i) => (
                <div key={s} style={{ display:'flex', alignItems:'center', flex:1, minWidth:80 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:i<=statusIndex?'var(--primary)':'var(--gray-200)', color:i<=statusIndex?'white':'var(--gray-400)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.875rem' }}>{i<statusIndex?'✓':i+1}</div>
                    <span style={{ fontSize:'0.6875rem', marginTop:'0.375rem', textAlign:'center', color:i<=statusIndex?'var(--primary)':'var(--gray-400)', fontWeight:i===statusIndex?700:400 }}>{getOrderStatusLabel(s)}</span>
                  </div>
                  {i<5 && <div style={{ flex:1, height:2, background:i<statusIndex?'var(--primary)':'var(--gray-200)', marginBottom:'1.25rem', minWidth:20 }} />}
                </div>
              ))}
            </div>
            {order.trackingNumber && <div style={{ marginTop:'1rem', fontSize:'0.875rem', color:'var(--gray-600)' }}>Tracking #: <strong>{order.trackingNumber}</strong></div>}
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.5rem', alignItems:'start' }}>
        <div>
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <div className="card-header"><h3 style={{ fontWeight:700 }}>Items ({order.items?.length})</h3></div>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display:'flex', gap:'1rem', padding:'1rem', borderBottom:'1px solid var(--gray-100)' }}>
                <img src={item.image} alt={item.name} onError={getImageFallback} style={{ width:72, height:72, objectFit:'cover', borderRadius:'var(--radius-sm)' }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600 }}>{item.name}</div>
                  <div style={{ fontSize:'0.8125rem', color:'var(--gray-500)' }}>by {item.vendorName} · Qty: {item.quantity}</div>
                  {order.orderStatus==='delivered' && <button className="btn btn-ghost btn-sm" style={{ marginTop:'0.375rem', color:'var(--primary)', padding:'0.25rem 0' }} onClick={()=>setShowReview(item.product)}>✍️ Write Review</button>}
                </div>
                <div style={{ fontWeight:700 }}>{formatPrice(item.price*item.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><h3 style={{ fontWeight:700 }}>Shipping Address</h3></div>
            <div className="card-body">
              <div style={{ fontWeight:600 }}>{order.shippingAddress?.fullName}</div>
              <div style={{ color:'var(--gray-600)' }}>{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 style={{ fontWeight:700 }}>Summary</h3></div>
          <div className="card-body">
            {[['Subtotal',formatPrice(order.subtotal)],['Shipping',order.shippingFee===0?'FREE':formatPrice(order.shippingFee)],['Tax',formatPrice(order.tax)]].map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.75rem' }}><span style={{ color:'var(--gray-600)' }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span></div>
            ))}
            <div style={{ height:1, background:'var(--gray-200)', margin:'0.75rem 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:700 }}>Total</span><span style={{ fontWeight:800, fontSize:'1.25rem', color:'var(--primary)' }}>{formatPrice(order.totalAmount)}</span></div>
            <div style={{ marginTop:'1rem', padding:'0.75rem', background:'var(--gray-50)', borderRadius:'var(--radius-sm)', fontSize:'0.875rem' }}>
              <div style={{ color:'var(--gray-500)' }}>Payment</div>
              <div style={{ fontWeight:600 }}>{order.paymentMethod==='cod'?'Cash on Delivery':'Demo card payment (mock)'} · <span style={{ color:['paid','mock_paid'].includes(order.paymentStatus)?'var(--success)':'var(--warning)' }}>{order.paymentStatus?.toUpperCase()}</span></div>
            </div>
          </div>
        </div>
      </div>

      {showReview && (
        <div className="modal-overlay" onClick={()=>setShowReview(null)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header"><h3>Write a Review</h3><button className="btn btn-ghost btn-sm" onClick={()=>setShowReview(null)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Rating</label>
                <div style={{ display:'flex', gap:'0.5rem' }}>{[1,2,3,4,5].map((s)=><button key={s} style={{ fontSize:'1.5rem', background:'none', border:'none', color:s<=review.rating?'#f59e0b':'var(--gray-300)', cursor:'pointer' }} onClick={()=>setReview({...review,rating:s})}>★</button>)}</div>
              </div>
              <div className="form-group"><label className="form-label">Title</label><input className="form-control" value={review.title} onChange={(e)=>setReview({...review,title:e.target.value})} placeholder="Summary" /></div>
              <div className="form-group"><label className="form-label">Comment</label><textarea className="form-control" value={review.comment} onChange={(e)=>setReview({...review,comment:e.target.value})} placeholder="Your experience..." /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setShowReview(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>handleReview(showReview)} disabled={!review.comment}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
