import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { formatDate } from '../../utils/helpers';
import { LoadingCenter, EmptyState, Pagination } from '../../components/common';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const load = (p=1,s='') => {
    setLoading(true);
    adminApi.getUsers({ page:p, limit:15, search:s }).then((r)=>{ setUsers(r.data.users||[]); setPagination(r.data.pagination); }).finally(()=>setLoading(false));
  };

  useEffect(()=>load(page,search),[page]);

  const handleToggle = async (id) => {
    try {
      const r = await adminApi.toggleUserStatus(id);
      setUsers((u)=>u.map((x)=>x._id===id?r.data.data.user:x));
      toast.success('User status updated');
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <h1 style={{ fontSize:'1.5rem', fontWeight:700, marginBottom:'1.5rem' }}>Users</h1>
      <div className="card">
        <div className="card-header">
          <form onSubmit={(e)=>{ e.preventDefault(); load(1,search); }} style={{ display:'flex', gap:'0.75rem' }}>
            <input className="form-control" style={{ width:260 }} placeholder="Search by name or email..." value={search} onChange={(e)=>setSearch(e.target.value)} />
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
          </form>
        </div>
        {loading ? <LoadingCenter /> : users.length===0 ? <EmptyState icon="👥" title="No users" message="No users found." /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {users.map((u)=>(
                  <tr key={u._id}>
                    <td style={{ fontWeight:600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role==='admin'?'badge-danger':u.role==='vendor'?'badge-info':'badge-gray'}`}>{u.role}</span></td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td><span className={`badge ${u.isActive?'badge-success':'badge-danger'}`}>{u.isActive?'Active':'Suspended'}</span></td>
                    <td><button className={`btn btn-sm ${u.isActive?'btn-danger':'btn-success'}`} onClick={()=>handleToggle(u._id)}>{u.isActive?'Suspend':'Activate'}</button></td>
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
