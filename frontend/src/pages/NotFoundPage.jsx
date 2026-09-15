import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'2rem' }}>
      <div>
        <div style={{ fontSize:'6rem', marginBottom:'1rem' }}>404</div>
        <h1 style={{ fontSize:'2rem', fontWeight:800, marginBottom:'0.5rem' }}>Page Not Found</h1>
        <p style={{ color:'var(--gray-500)', marginBottom:'2rem' }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
      </div>
    </div>
  );
}
