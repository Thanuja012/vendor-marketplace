import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';

const NAV = [
  { to:'/admin', label:'📊 Dashboard', end:true },
  { to:'/admin/users', label:'👥 Users' },
  { to:'/admin/vendors', label:'🏪 Vendors' },
  { to:'/admin/products', label:'📦 Products' },
  { to:'/admin/orders', label:'🛒 Orders' },
];

export default function AdminLayout() {
  const { user } = useSelector((s)=>s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', minHeight:'100vh' }}>
      <aside style={{ background:'#0f172a', color:'white', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize:'1.125rem', fontWeight:800, color:'white' }}>⚙️ Admin Panel</div>
          <div style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.5)', marginTop:'0.25rem' }}>{user?.name}</div>
        </div>
        <nav style={{ flex:1, padding:'1rem 0' }}>
          {NAV.map((n)=>(
            <NavLink key={n.to} to={n.to} end={n.end} style={({ isActive })=>({ display:'block', padding:'0.75rem 1.5rem', color:isActive?'white':'rgba(255,255,255,0.6)', background:isActive?'rgba(255,255,255,0.1)':'transparent', borderLeft:`3px solid ${isActive?'#f59e0b':'transparent'}`, fontSize:'0.9375rem', fontWeight:isActive?600:400, transition:'var(--transition)' })}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:'0.9375rem' }}>🚪 Logout</button>
        </div>
      </aside>
      <main style={{ background:'var(--gray-50)', padding:'2rem', overflowY:'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
