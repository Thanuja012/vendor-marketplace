import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorApi } from '../../api';
import { formatPrice, getImageFallback } from '../../utils/helpers';
import { LoadingCenter, EmptyState, Pagination, ConfirmDialog } from '../../components/common';
import toast from 'react-hot-toast';

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = (p=1, s='') => {
    setLoading(true);
    vendorApi.getProducts({ page:p, limit:10, search:s }).then((r)=>{
      setProducts(r.data.products||[]);
      setPagination(r.data.pagination);
    }).finally(()=>setLoading(false));
  };

  useEffect(()=>{ load(page, search); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); load(1, search); };

  const handleDelete = async () => {
    try {
      await vendorApi.deleteProduct(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      load(page, search);
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:700 }}>My Products</h1>
        <Link to="/vendor/products/new" className="btn btn-primary">+ Add Product</Link>
      </div>
      <div className="card">
        <div className="card-header">
          <form onSubmit={handleSearch} style={{ display:'flex', gap:'0.75rem' }}>
            <input className="form-control" style={{ width:260 }} placeholder="Search products..." value={search} onChange={(e)=>setSearch(e.target.value)} />
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
          </form>
        </div>
        {loading ? <LoadingCenter /> : products.length===0 ? <EmptyState icon="📦" title="No products" message="Add your first product." /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map((p)=>(
                  <tr key={p._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        <img src={p.thumbnail} alt={p.name} onError={getImageFallback} style={{ width:48, height:48, objectFit:'cover', borderRadius:'var(--radius-sm)' }} />
                        <div><div style={{ fontWeight:600 }}>{p.name}</div><div style={{ fontSize:'0.8125rem', color:'var(--gray-500)' }}>{p.brand}</div></div>
                      </div>
                    </td>
                    <td style={{ fontWeight:600 }}>{formatPrice(p.price)}</td>
                    <td><span style={{ color:p.stock<10?'var(--danger)':'var(--success)', fontWeight:600 }}>{p.stock}</span></td>
                    <td><span className={`badge ${p.status==='active'?'badge-success':'badge-gray'}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        <Link to={`/vendor/products/${p._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={()=>setDeleteId(p._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="card-footer"><Pagination pagination={pagination} onPageChange={setPage} /></div>
      </div>
      {deleteId && <ConfirmDialog title="Delete Product" message="Are you sure you want to delete this product?" onConfirm={handleDelete} onCancel={()=>setDeleteId(null)} />}
    </div>
  );
}
