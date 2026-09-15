import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { vendorApi } from '../api';
import ProductCard from '../components/product/ProductCard';
import { LoadingCenter, EmptyState, Pagination } from '../components/common';
import { getImageFallback } from '../utils/helpers';

export default function VendorStorePage() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    vendorApi.getPublicStore(slug, { page, limit: 12 }).then((r) => {
      setVendor(r.data.data.vendor);
      setProducts(r.data.data.products || []);
      setPagination(r.data.data.pagination);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, [slug, page]);

  if (loading) return <LoadingCenter />;
  if (!vendor) return <EmptyState icon="🏪" title="Store not found" message="This store may not exist or is not active." />;

  return (
    <div>
      <div style={{ background:'linear-gradient(135deg, #1e3a8a, #2563eb)', color:'white', padding:'3rem 0' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', gap:'2rem' }}>
          <img src={vendor.logo} alt={vendor.storeName} onError={getImageFallback} style={{ width:100, height:100, borderRadius:'50%', objectFit:'cover', border:'4px solid rgba(255,255,255,0.3)' }} />
          <div>
            <h1 style={{ fontSize:'2rem', fontWeight:800 }}>{vendor.storeName}</h1>
            <p style={{ opacity:0.85, marginTop:'0.5rem', maxWidth:500 }}>{vendor.description}</p>
            <div style={{ display:'flex', gap:'2rem', marginTop:'1rem' }}>
              {vendor.rating>0 && <div><strong>⭐ {vendor.rating}</strong><span style={{ opacity:0.75, marginLeft:'0.25rem' }}>Rating</span></div>}
              <div><strong>{pagination?.total||0}</strong><span style={{ opacity:0.75, marginLeft:'0.25rem' }}>Products</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="container" style={{ padding:'2rem 1rem' }}>
        <h2 style={{ fontSize:'1.375rem', fontWeight:700, marginBottom:'1.5rem' }}>Products</h2>
        {products.length===0 ? <EmptyState icon="📦" title="No products" message="This store has no products yet." /> : (
          <>
            <div className="grid grid-4">{products.map((p)=><ProductCard key={p._id} product={p} />)}</div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
