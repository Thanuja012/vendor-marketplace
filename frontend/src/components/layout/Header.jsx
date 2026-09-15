import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { selectCartCount } from '../../store/cartSlice';
import { fetchNotifications, markAllRead } from '../../store/notificationSlice';
import { formatDate } from '../../utils/helpers';
import './Header.css';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const { unreadCount, items: notifications } = useSelector((s) => s.notifications);
  const wishlistCount = useSelector((s) => s.wishlist.products.length);

  const [search, setSearch] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    if (user) dispatch(fetchNotifications());
  }, [user, dispatch]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'vendor') return '/vendor';
    return '/profile';
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">🛒</span>
            <span className="logo-text">SmartMart</span>
          </Link>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>

          <div className="header-actions">
            {user ? (
              <>
                <Link to="/wishlist" className="header-icon-btn" title="Wishlist">
                  <span>🤍</span>
                  {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
                </Link>

                <div className="notif-wrapper" ref={notifRef}>
                  <button className="header-icon-btn" onClick={() => { setShowNotif(!showNotif); if (!showNotif) dispatch(markAllRead()); }}>
                    <span>🔔</span>
                    {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
                  </button>
                  {showNotif && (
                    <div className="dropdown notif-dropdown">
                      <div className="dropdown-header">Notifications</div>
                      {notifications.length === 0 ? (
                        <div className="dropdown-empty">No notifications</div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-msg">{n.message}</div>
                            <div className="notif-time">{formatDate(n.createdAt)}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <Link to="/cart" className="header-icon-btn cart-btn" title="Cart">
                  <span>🛒</span>
                  {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
                </Link>

                <div className="user-wrapper" ref={userRef}>
                  <button className="user-btn" onClick={() => setShowUser(!showUser)}>
                    <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                    <span className="user-name">{user.name?.split(' ')[0]}</span>
                    <span>▾</span>
                  </button>
                  {showUser && (
                    <div className="dropdown user-dropdown">
                      <div className="dropdown-header">{user.name}</div>
                      <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setShowUser(false)}>
                        {user.role === 'admin' ? '⚙️ Admin Dashboard' : user.role === 'vendor' ? '🏪 Vendor Dashboard' : '👤 My Profile'}
                      </Link>
                      {user.role === 'customer' && (
                        <>
                          <Link to="/orders" className="dropdown-item" onClick={() => setShowUser(false)}>📦 My Orders</Link>
                          <Link to="/wishlist" className="dropdown-item" onClick={() => setShowUser(false)}>🤍 Wishlist</Link>
                        </>
                      )}
                      <div className="dropdown-divider" />
                      <button className="dropdown-item danger" onClick={handleLogout}>🚪 Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/cart" className="header-icon-btn cart-btn">
                  <span>🛒</span>
                  {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
                </Link>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
            <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
          </div>
        </div>
      </div>

      <nav className={`header-nav ${mobileMenu ? 'open' : ''}`}>
        <div className="container nav-inner">
          <Link to="/products" className="nav-link" onClick={() => setMobileMenu(false)}>All Products</Link>
          <Link to="/products?category=electronics" className="nav-link" onClick={() => setMobileMenu(false)}>Electronics</Link>
          <Link to="/products?category=mens-clothing" className="nav-link" onClick={() => setMobileMenu(false)}>Men's</Link>
          <Link to="/products?category=womens-clothing" className="nav-link" onClick={() => setMobileMenu(false)}>Women's</Link>
          <Link to="/products?category=shoes" className="nav-link" onClick={() => setMobileMenu(false)}>Shoes</Link>
          <Link to="/products?category=home-kitchen" className="nav-link" onClick={() => setMobileMenu(false)}>Home</Link>
          <Link to="/products?category=beauty" className="nav-link" onClick={() => setMobileMenu(false)}>Beauty</Link>
          <Link to="/products?category=sports" className="nav-link" onClick={() => setMobileMenu(false)}>Sports</Link>
          <Link to="/products?featured=true" className="nav-link featured" onClick={() => setMobileMenu(false)}>⚡ Flash Deals</Link>
        </div>
      </nav>
    </header>
  );
}
