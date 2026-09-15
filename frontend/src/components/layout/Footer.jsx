import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">🛒 SmartMart</div>
            <p>Your trusted multi-vendor marketplace. Shop from thousands of products across hundreds of verified vendors.</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Instagram">📸</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?featured=true">Flash Deals</Link>
            <Link to="/products?category=electronics">Electronics</Link>
            <Link to="/products?category=fashion">Fashion</Link>
            <Link to="/products?category=home-kitchen">Home & Kitchen</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/profile">My Profile</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div className="footer-col">
            <h4>Sell on SmartMart</h4>
            <Link to="/register?role=vendor">Become a Vendor</Link>
            <Link to="/vendor">Vendor Dashboard</Link>
            <a href="#">Seller Guidelines</a>
            <a href="#">Help Center</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SmartMart. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
