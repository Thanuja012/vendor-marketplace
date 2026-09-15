const Order = require('../models/Order');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const { generateOrderId } = require('../utils/helpers');
const { getPagination, buildPaginationMeta } = require('../utils/helpers');
const { randomUUID } = require('crypto');

const createOrder = async (userId, { items, shippingAddress, paymentMethod }) => {
  if (!items || items.length === 0) throw Object.assign(new Error('No items in order'), { statusCode: 400 });
  if (!['cod', 'card'].includes(paymentMethod)) {
    throw Object.assign(new Error('Unsupported payment method'), { statusCode: 400 });
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw Object.assign(new Error('Item quantity must be a positive integer'), { statusCode: 400 });
    }
    const product = await Product.findById(item.productId).populate('vendor', 'storeName');
    if (!product || product.status !== 'active') throw Object.assign(new Error(`Product ${item.productId} not available`), { statusCode: 400 });
    if (product.stock < item.quantity) throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { statusCode: 400 });

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      vendor: product.vendor._id,
      name: product.name,
      image: product.thumbnail,
      price: product.price,
      quantity: item.quantity,
      selectedVariants: item.selectedVariants || {},
      vendorName: product.vendor.storeName,
    });
  }

  const shippingFee = subtotal >= 50 ? 0 : 5.99;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const totalAmount = parseFloat((subtotal + shippingFee + tax).toFixed(2));

  const order = await Order.create({
    orderId: generateOrderId(),
    user: userId,
    items: orderItems,
    shippingAddress,
    subtotal,
    shippingFee,
    tax,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'card' ? 'mock_paid' : 'pending',
    transactionReference: paymentMethod === 'card' ? `MOCK-${randomUUID()}` : '',
    statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
  });

  // Reduce stock and update vendor stats
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // Update vendor revenue
  const vendorRevenue = {};
  for (const item of orderItems) {
    const vid = item.vendor.toString();
    vendorRevenue[vid] = (vendorRevenue[vid] || 0) + item.price * item.quantity;
  }
  for (const [vendorId, revenue] of Object.entries(vendorRevenue)) {
    await Vendor.findByIdAndUpdate(vendorId, { $inc: { totalSales: 1, totalRevenue: revenue } });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: userId }, { items: [] });

  // Create notification
  await Notification.create({
    user: userId,
    title: 'Order Placed',
    message: `Your order ${order.orderId} has been placed successfully.`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  return order;
};

const getOrders = async (userId, { page = 1, limit = 10 }) => {
  const { skip, limit: lim } = getPagination(page, limit);
  const [orders, total] = await Promise.all([
    Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    Order.countDocuments({ user: userId }),
  ]);
  return { orders, pagination: buildPaginationMeta(total, page, lim) };
};

const getOrderById = async (orderId, userId, role) => {
  const query = { _id: orderId };
  if (role !== 'admin') query.user = userId;
  const order = await Order.findOne(query).populate('user', 'name email');
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  return order;
};

const cancelOrder = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  const cancellable = ['placed', 'confirmed'];
  if (!cancellable.includes(order.orderStatus)) {
    throw Object.assign(new Error('Order cannot be cancelled at this stage'), { statusCode: 400 });
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
  }

  await Notification.create({
    user: userId,
    title: 'Order Cancelled',
    message: `Your order ${order.orderId} has been cancelled.`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  return order;
};

const updateOrderStatus = async (orderId, vendorId, status, note) => {
  const order = await Order.findOne({ _id: orderId, 'items.vendor': vendorId });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
  if (status === 'shipped') order.trackingNumber = `TRK${Date.now()}`;
  await order.save();

  await Notification.create({
    user: order.user,
    title: 'Order Update',
    message: `Your order ${order.orderId} status has been updated to ${status}.`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  return order;
};

module.exports = { createOrder, getOrders, getOrderById, cancelOrder, updateOrderStatus };
