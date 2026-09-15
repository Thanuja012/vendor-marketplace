import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  addAddress: (data) => api.post('/auth/addresses', data),
  updateAddress: (id, data) => api.put(`/auth/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}`),
};

export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getRecommended: (id, limit = 8) => api.get(`/products/${id}/recommended`, { params: { limit } }),
  getReviews: (id, params) => api.get(`/products/${id}/reviews`, { params }),
  createReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

export const categoryApi = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const cartApi = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post(`/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
};

export const orderApi = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
};

export const vendorApi = {
  getProfile: () => api.get('/vendor/profile'),
  updateProfile: (data) => api.put('/vendor/profile', data),
  getDashboard: () => api.get('/vendor/dashboard'),
  getProducts: (params) => api.get('/vendor/products', { params }),
  createProduct: (data) => api.post('/vendor/products', data),
  updateProduct: (id, data) => api.put(`/vendor/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/vendor/products/${id}`),
  getOrders: (params) => api.get('/vendor/orders', { params }),
  updateOrderStatus: (id, status, note) => api.put(`/vendor/orders/${id}/status`, { status, note }),
  getPublicStore: (slug, params) => api.get(`/vendor/store/${slug}`, { params }),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle`),
  getVendors: (params) => api.get('/admin/vendors', { params }),
  updateVendorStatus: (id, status) => api.put(`/admin/vendors/${id}/status`, { status }),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getProducts: (params) => api.get('/admin/products', { params }),
  toggleProductStatus: (id) => api.put(`/admin/products/${id}/toggle`),
};

export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all'),
  markOneRead: (id) => api.put(`/notifications/${id}/read`),
};
