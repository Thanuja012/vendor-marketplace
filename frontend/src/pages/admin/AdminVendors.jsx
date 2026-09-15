import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { formatDate, getImageFallback } from '../../utils/helpers';
import { LoadingCenter, EmptyState, Pagination } from '../../components/common';
import toast from 'react-hot-toast';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const load = (p=1,s='') => {
    setLoading(true);
    adminApi.getVendors({ page:p, limit:15, status:s }).then((r)=>{ setVendors(r.data.vendors||[]); setPagination(r.data.pagination); }).finally(()=>setLoading(false));
  };

  useEffect(()=>load(page,statusFilter),[page,statusFilter]);

  const handleStatus = async (id, status) => {
    try {
      const r = await adminApi.updateVendorStatus(id, status);
      setVendors((v)=>v.map((x)=>x._id===id?r.data.data.vendor:x));
      toast.success(`Vendor ${status}`);
    } catch { toast.error('Failed'); }
  };

  const statusColor = { pending:'badge-warning', approved:'badge-success', rejected:'badge-danger', suspended:'badge-gray' };

  return (
    <div>
      <h1 style={{ fontSize:'1.5rem', fontWeight:700, marginBottom:'1.5rem' }}>Vendors</h1>
      <div className="card">
        <div className="card-header">
          <select className="form-control" style={{ width:200 }} value={statusFilter} onChange={(e)=>{ setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {['pending','approved','rejected','suspended'].map((s)=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
        {loading ? <LoadingCenter /> : vendors.length===0 ? <EmptyState icon="🏪" title="No vendors" message="No vendors found." /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Store</th><th>Owner</th><th>Email</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {vendors.map((v)=>(
                  <tr key={v._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        {v.logo && <img src={v.logo} alt="" onError={getImageFallback} style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover' }} />}
                        <span style={{ fontWeight:600 }}>{v.storeName}</span>
                      </div>
                    </td>
                    <td>{v.user?.name||'—'}</td>
                    <td>{v.user?.email||v.businessEmail||'—'}</td>
                    <td>{formatDate(v.createdAt)}</td>
                    <td><span className={`badge ${statusColor[v.status]||'badge-gray'}`}>{v.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:'0.5rem' }}>
                        {v.status==='pending' && <>
                          <button className="btn btn-success btn-sm" onClick={()=>handleStatus(v._id,'approved')}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>handleStatus(v._id,'rejected')}>Reject</button>
                        </>}
                        {v.status==='approved' && <button className="btn btn-secondary btn-sm" onClick={()=>handleStatus(v._id,'suspended')}>Suspend</button>}
                        {(v.status==='rejected'||v.status==='suspended') && <button className="btn btn-success btn-sm" onClick={()=>handleStatus(v._id,'approved')}>Approve</button>}
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
    </div>
  );
}
