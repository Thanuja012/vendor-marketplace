import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vendorApi, categoryApi } from '../../api';
import { LoadingCenter } from '../../components/common';
import toast from 'react-hot-toast';

const EMPTY = { name:'', description:'', price:'', originalPrice:'', brand:'', stock:'', sku:'', category:'', images:[''], thumbnail:'', tags:'', featured:false, status:'active' };

export default function VendorAddProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    categoryApi.getCategories().then((r)=>setCategories(r.data.data.categories||[]));
    if (id) {
      vendorApi.getProducts({ limit:100 }).then((r)=>{
        const p = r.data.products?.find((x)=>x._id===id);
        if (p) setForm({ ...p, tags:p.tags?.join(', ')||'', images:p.images?.length?p.images:[''], category:p.category?._id||p.category||'' });
      }).finally(()=>setFetching(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, price:parseFloat(form.price), originalPrice:parseFloat(form.originalPrice)||0, stock:parseInt(form.stock), images:form.images.filter(Boolean), tags:form.tags.split(',').map((t)=>t.trim()).filter(Boolean) };
      if (id) await vendorApi.updateProduct(id, payload);
      else await vendorApi.createProduct(payload);
      toast.success(id?'Product updated!':'Product created!');
      navigate('/vendor/products');
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  const addImage = () => setForm((f)=>({ ...f, images:[...f.images,''] }));
  const updateImage = (i,v) => setForm((f)=>{ const imgs=[...f.images]; imgs[i]=v; return { ...f, images:imgs }; });
  const removeImage = (i) => setForm((f)=>({ ...f, images:f.images.filter((_,idx)=>idx!==i) }));

  if (fetching) return <LoadingCenter />;

  return (
    <div style={{ maxWidth:800 }}>
      <h1 style={{ fontSize:'1.5rem', fontWeight:700, marginBottom:'1.5rem' }}>{id?'Edit Product':'Add New Product'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div className="card-header"><h3 style={{ fontWeight:700 }}>Basic Information</h3></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Product Name *</label><input className="form-control" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></div>
            <div className="form-group"><label className="form-label">Description *</label><textarea className="form-control" rows={4} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} required /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Category *</label>
                <select className="form-control" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} required>
                  <option value="">Select category</option>
                  {categories.map((c)=><option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Brand</label><input className="form-control" value={form.brand} onChange={(e)=>setForm({...form,brand:e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Price ($) *</label><input className="form-control" type="number" step="0.01" min="0" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Original Price ($)</label><input className="form-control" type="number" step="0.01" min="0" value={form.originalPrice} onChange={(e)=>setForm({...form,originalPrice:e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Stock *</label><input className="form-control" type="number" min="0" value={form.stock} onChange={(e)=>setForm({...form,stock:e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">SKU</label><input className="form-control" value={form.sku} onChange={(e)=>setForm({...form,sku:e.target.value})} /></div>
            </div>
            <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-control" value={form.tags} onChange={(e)=>setForm({...form,tags:e.target.value})} placeholder="electronics, phone, apple" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}>
                  <option value="active">Active</option><option value="inactive">Inactive</option><option value="draft">Draft</option>
                </select>
              </div>
              <div className="form-group" style={{ display:'flex', alignItems:'center', paddingTop:'1.75rem' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer' }}>
                  <input type="checkbox" checked={form.featured} onChange={(e)=>setForm({...form,featured:e.target.checked})} />
                  <span>Featured Product</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div className="card-header"><h3 style={{ fontWeight:700 }}>Images</h3></div>
          <div className="card-body">
            {form.images.map((img,i)=>(
              <div key={i} style={{ display:'flex', gap:'0.75rem', marginBottom:'0.75rem', alignItems:'center' }}>
                <input className="form-control" value={img} onChange={(e)=>updateImage(i,e.target.value)} placeholder="https://images.unsplash.com/..." />
                {img && <img src={img} alt="" style={{ width:48, height:48, objectFit:'cover', borderRadius:'var(--radius-sm)', flexShrink:0 }} onError={(e)=>{e.target.style.display='none';}} />}
                {form.images.length>1 && <button type="button" className="btn btn-ghost btn-sm" style={{ color:'var(--danger)', flexShrink:0 }} onClick={()=>removeImage(i)}>✕</button>}
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={addImage}>+ Add Image URL</button>
          </div>
        </div>
        <div style={{ display:'flex', gap:'1rem' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading?'Saving...':id?'Update Product':'Create Product'}</button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={()=>navigate('/vendor/products')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
