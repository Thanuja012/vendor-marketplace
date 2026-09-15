import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/authSlice';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: params.get('role') || 'customer' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(registerUser(form)).unwrap();
      toast.success('Account created successfully!');
      if (result.user.role === 'vendor') navigate('/vendor');
      else navigate('/');
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div className="card">
          <div className="card-body">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create your account</h1>
              <p className="text-muted text-sm">Join SmartMart today</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" className="form-control" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input name="password" type="password" className="form-control" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone (optional)</label>
                <input name="phone" className="form-control" placeholder="+1-555-0000" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select name="role" className="form-control" value={form.role} onChange={handleChange}>
                  <option value="customer">Customer — Shop products</option>
                  <option value="vendor">Vendor — Sell products</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
