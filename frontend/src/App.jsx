import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';
import MainLayout from './components/layout/MainLayout';
import { ProtectedRoute, GuestRoute } from './components/layout/ProtectedRoute';
import AppInit from './components/layout/AppInit';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VendorStorePage from './pages/VendorStorePage';
import NotFoundPage from './pages/NotFoundPage';

import VendorLayout from './pages/vendor/VendorLayout';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorAddProduct from './pages/vendor/VendorAddProduct';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorProfile from './pages/vendor/VendorProfile';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVendors from './pages/admin/AdminVendors';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInit />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/vendor/store/:slug" element={<VendorStorePage />} />

            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:id" element={<OrderSuccessPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['vendor']} />}>
            <Route path="/vendor" element={<VendorLayout />}>
              <Route index element={<VendorDashboard />} />
              <Route path="products" element={<VendorProducts />} />
              <Route path="products/new" element={<VendorAddProduct />} />
              <Route path="products/:id/edit" element={<VendorAddProduct />} />
              <Route path="orders" element={<VendorOrders />} />
              <Route path="profile" element={<VendorProfile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="vendors" element={<AdminVendors />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
