import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
