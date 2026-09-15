import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const NAV = [
  { to:'/vendor', label:'📊 Dashboard', end:true },
  { to:'/vendor/products', label:'📦 Products' },
  { to:'/vendor/products/new', label:'➕ Add Product' },
  { to:'/vendor/orders', label:'🛒 Orders' },
  { to:'/vendor/profile', label:'🏪 Store Profile' },
];

export default function VendorLayout() {
  const { user } = useSelector((s)=>s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', minHeight:'100vh' }}>
      <aside style={{ background:'var(--gray-900)', color:'white', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize:'1.125rem', fontWeight:800, color:'white' }}>🏪 Vendor Panel</div>
          <div style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.5)', marginTop:'0.25rem' }}>{user?.name}</div>
        </div>
        <nav style={{ flex:1, padding:'1rem 0' }}>
          {NAV.map((n)=>(
            <NavLink key={n.to} to={n.to} end={n.end} style={({ isActive })=>({ display:'block', padding:'0.75rem 1.5rem', color:isActive?'white':'rgba(255,255,255,0.6)', background:isActive?'rgba(255,255,255,0.1)':'transparent', borderLeft:`3px solid ${isActive?'var(--primary)':'transparent'}`, fontSize:'0.9375rem', fontWeight:isActive?600:400, transition:'var(--transition)' })}>
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
