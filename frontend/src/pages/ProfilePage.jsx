import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { authApi } from '../api';
import { updateUser } from '../store/authSlice';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', avatar: user?.avatar||'' });
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState(user?.addresses||[]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label:'Home', fullName:'', phone:'', street:'', city:'', state:'', zipCode:'', country:'US', isDefault:false });

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authApi.updateProfile(form);
      dispatch(updateUser(r.data.data.user));
      toast.success('Profile updated!');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const r = await authApi.addAddress(addrForm);
      setAddresses(r.data.data.addresses);
      dispatch(updateUser({ addresses: r.data.data.addresses }));
      setShowAddrForm(false);
      toast.success('Address added!');
    } catch { toast.error('Failed'); }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const r = await authApi.deleteAddress(addrId);
      setAddresses(r.data.data.addresses);
      dispatch(updateUser({ addresses: r.data.data.addresses }));
      toast.success('Address deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="container" style={{ padding:'2rem 1rem', maxWidth:'800px' }}>
      <h1 style={{ fontSize:'1.75rem', fontWeight:700, marginBottom:'2rem' }}>My Account</h1>
      <div className="tabs">
        {['profile','addresses'].map((t)=><button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t==='profile'?'👤 Profile':'📍 Addresses'}</button>)}
      </div>

      {tab==='profile' && (
        <div className="card">
          <div className="card-body">
            <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2rem' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--primary)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:700 }}>{user?.name?.charAt(0).toUpperCase()}</div>
              <div><div style={{ fontWeight:700, fontSize:'1.25rem' }}>{user?.name}</div><div style={{ color:'var(--gray-500)' }}>{user?.email}</div><div style={{ fontSize:'0.8125rem', color:'var(--gray-400)', marginTop:'0.25rem' }}>Member since {formatDate(user?.createdAt)}</div></div>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} /></div>
              </div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={user?.email} disabled style={{ background:'var(--gray-50)' }} /></div>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
            </form>
          </div>
        </div>
      )}

      {tab==='addresses' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowAddrForm(true)}>+ Add Address</button>
          </div>
          {addresses.length===0 ? <div style={{ textAlign:'center', padding:'3rem', color:'var(--gray-500)' }}>No addresses saved yet.</div> : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {addresses.map((a)=>(
                <div key={a._id} className="card">
                  <div className="card-body" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.5rem' }}>
                        <span style={{ fontWeight:700 }}>{a.label}</span>
                        {a.isDefault && <span className="badge badge-primary">Default</span>}
                      </div>
                      <div style={{ fontWeight:600 }}>{a.fullName}</div>
                      <div style={{ color:'var(--gray-600)', fontSize:'0.9375rem' }}>{a.street}, {a.city}, {a.state} {a.zipCode}, {a.country}</div>
                      {a.phone && <div style={{ color:'var(--gray-500)', fontSize:'0.875rem' }}>{a.phone}</div>}
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)' }} onClick={()=>handleDeleteAddress(a._id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAddrForm && (
            <div className="modal-overlay" onClick={()=>setShowAddrForm(false)}>
              <div className="modal" onClick={(e)=>e.stopPropagation()}>
                <div className="modal-header"><h3>Add Address</h3><button className="btn btn-ghost btn-sm" onClick={()=>setShowAddrForm(false)}>✕</button></div>
                <form onSubmit={handleAddAddress}>
                  <div className="modal-body">
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Label</label><input className="form-control" value={addrForm.label} onChange={(e)=>setAddrForm({...addrForm,label:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={addrForm.fullName} onChange={(e)=>setAddrForm({...addrForm,fullName:e.target.value})} required /></div>
                    </div>
                    <div className="form-group"><label className="form-label">Street</label><input className="form-control" value={addrForm.street} onChange={(e)=>setAddrForm({...addrForm,street:e.target.value})} required /></div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">City</label><input className="form-control" value={addrForm.city} onChange={(e)=>setAddrForm({...addrForm,city:e.target.value})} required /></div>
                      <div className="form-group"><label className="form-label">State</label><input className="form-control" value={addrForm.state} onChange={(e)=>setAddrForm({...addrForm,state:e.target.value})} required /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">ZIP</label><input className="form-control" value={addrForm.zipCode} onChange={(e)=>setAddrForm({...addrForm,zipCode:e.target.value})} required /></div>
                      <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={addrForm.phone} onChange={(e)=>setAddrForm({...addrForm,phone:e.target.value})} /></div>
                    </div>
                    <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer' }}>
                      <input type="checkbox" checked={addrForm.isDefault} onChange={(e)=>setAddrForm({...addrForm,isDefault:e.target.checked})} />
                      <span>Set as default</span>
                    </label>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={()=>setShowAddrForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Address</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
