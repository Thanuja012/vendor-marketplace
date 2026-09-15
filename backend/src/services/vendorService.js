const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { getPagination, buildPaginationMeta } = require('../utils/helpers');

const getVendorByUserId = async (userId) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) throw Object.assign(new Error('Vendor profile not found'), { statusCode: 404 });
  return vendor;
};

const getDashboard = async (vendorId) => {
  const [totalProducts, orders] = await Promise.all([
    Product.countDocuments({ vendor: vendorId, status: 'active' }),
    Order.find({ 'items.vendor': vendorId }).lean(),
  ]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => ['placed', 'confirmed', 'processing'].includes(o.orderStatus)).length;
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => {
      const vendorItems = o.items.filter((i) => i.vendor.toString() === vendorId.toString());
      return sum + vendorItems.reduce((s, i) => s + i.price * i.quantity, 0);
    }, 0);

  // Monthly revenue for chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData = await Order.aggregate([
    { $match: { 'items.vendor': vendorId, createdAt: { $gte: sixMonthsAgo }, orderStatus: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $match: { 'items.vendor': vendorId } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $addToSet: '$_id' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return { totalProducts, totalOrders, pendingOrders, totalRevenue, monthlyData };
};

const getVendorOrders = async (vendorId, { page = 1, limit = 10, status }) => {
  const { skip, limit: lim } = getPagination(page, limit);
  const query = { 'items.vendor': vendorId };
  if (status) query.orderStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    Order.countDocuments(query),
  ]);

  return { orders, pagination: buildPaginationMeta(total, page, lim) };
};

const updateStoreProfile = async (userId, data) => {
  const vendor = await Vendor.findOneAndUpdate({ user: userId }, data, { new: true, runValidators: true });
  if (!vendor) throw Object.assign(new Error('Vendor not found'), { statusCode: 404 });
  return vendor;
};

module.exports = { getVendorByUserId, getDashboard, getVendorOrders, updateStoreProfile };
