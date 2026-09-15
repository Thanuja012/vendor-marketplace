import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { formatPrice, getImageFallback } from '../../utils/helpers';
import { LoadingCenter, EmptyState, Pagination } from '../../components/common';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = (p=1) => {
    setLoading(true);
    adminApi.getProducts({ page:p, limit:15 }).then((r)=>{ setProducts(r.data.products||[]); setPagination(r.data.pagination); }).finally(()=>setLoading(false));
  };

  useEffect(()=>load(page),[page]);

  const handleToggle = async (id) => {
    try {
      const r = await adminApi.toggleProductStatus(id);
      setProducts((p)=>p.map((x)=>x._id===id?r.data.data.product:x));
      toast.success('Product status updated');
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <h1 style={{ fontSize:'1.5rem', fontWeight:700, marginBottom:'1.5rem' }}>Products</h1>
      <div className="card">
        {loading ? <LoadingCenter /> : products.length===0 ? <EmptyState icon="📦" title="No products" message="No products found." /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Product</th><th>Vendor</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {products.map((p)=>(
                  <tr key={p._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        <img src={p.thumbnail} alt={p.name} onError={getImageFallback} style={{ width:44, height:44, objectFit:'cover', borderRadius:'var(--radius-sm)' }} />
                        <div><div style={{ fontWeight:600 }}>{p.name}</div><div style={{ fontSize:'0.8125rem', color:'var(--gray-500)' }}>{p.brand}</div></div>
                      </div>
                    </td>
                    <td>{p.vendor?.storeName||'—'}</td>
                    <td style={{ fontWeight:600 }}>{formatPrice(p.price)}</td>
                    <td><span style={{ color:p.stock<10?'var(--danger)':'var(--success)', fontWeight:600 }}>{p.stock}</span></td>
                    <td><span className={`badge ${p.status==='active'?'badge-success':'badge-danger'}`}>{p.status}</span></td>
                    <td><button className={`btn btn-sm ${p.status==='active'?'btn-danger':'btn-success'}`} onClick={()=>handleToggle(p._id)}>{p.status==='active'?'Deactivate':'Activate'}</button></td>
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
