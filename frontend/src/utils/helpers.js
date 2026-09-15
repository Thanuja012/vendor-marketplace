export const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));

export const getOrderStatusColor = (status) => {
  const colors = {
    placed: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
    shipped: '#06b6d4', out_for_delivery: '#f97316', delivered: '#10b981', cancelled: '#ef4444',
  };
  return colors[status] || '#6b7280';
};

export const getOrderStatusLabel = (status) => {
  const labels = {
    placed: 'Order Placed', confirmed: 'Confirmed', processing: 'Processing',
    shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

export const truncate = (str, n = 60) => str?.length > n ? str.slice(0, n) + '...' : str;

export const getImageFallback = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400';
};

export const ORDER_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
