import { useEffect, useState } from 'react';
import { vendorApi } from '../../api';
import { LoadingCenter } from '../../components/common';
import toast from 'react-hot-toast';

export default function VendorProfile() {
  const [form, setForm] = useState({ storeName:'', description:'', businessEmail:'', phone:'', logo:'', banner:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    vendorApi.getProfile().then((r)=>{
      const v = r.data.data.vendor;
      setForm({ storeName:v.storeName||'', description:v.description||'', businessEmail:v.businessEmail||'', phone:v.phone||'', logo:v.logo||'', banner:v.banner||'' });
    }).finally(()=>setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await vendorApi.updateProfile(form);
      toast.success('Store profile updated!');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingCenter />;

  return (
    <div style={{ maxWidth:700 }}>
      <h1 style={{ fontSize:'1.5rem', fontWeight:700, marginBottom:'1.5rem' }}>Store Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-body">
            <div className="form-group"><label className="form-label">Store Name *</label><input className="form-control" value={form.storeName} onChange={(e)=>setForm({...form,storeName:e.target.value})} required /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Business Email</label><input className="form-control" type="email" value={form.businessEmail} onChange={(e)=>setForm({...form,businessEmail:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} /></div>
            </div>
            <div className="form-group"><label className="form-label">Logo URL</label><input className="form-control" value={form.logo} onChange={(e)=>setForm({...form,logo:e.target.value})} placeholder="https://..." /></div>
            <div className="form-group"><label className="form-label">Banner URL</label><input className="form-control" value={form.banner} onChange={(e)=>setForm({...form,banner:e.target.value})} placeholder="https://..." /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
