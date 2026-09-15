import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    try {
      const result = await dispatch(loginUser(form)).unwrap();
      toast.success(`Welcome back, ${result.user.name}!`);
      if (result.user.role === 'admin') navigate('/admin');
      else if (result.user.role === 'vendor') navigate('/vendor');
      else navigate('/');
    } catch (err) {
      toast.error(err || 'Login failed');
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@smartmart.com', password: 'Demo@1234' },
      vendor: { email: 'vendor@smartmart.com', password: 'Demo@1234' },
      customer: { email: 'customer@smartmart.com', password: 'Demo@1234' },
    };
    setForm(creds[role]);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div className="card">
          <div className="card-body">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome back</h1>
              <p className="text-muted text-sm">Sign in to your SmartMart account</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['customer', 'vendor', 'admin'].map((role) => (
                <button key={role} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '0.75rem' }} onClick={() => fillDemo(role)}>
                  Demo {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input name="password" type="password" className="form-control" placeholder="••••••••" value={form.password} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
