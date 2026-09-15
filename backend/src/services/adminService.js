const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { getPagination, buildPaginationMeta } = require('../utils/helpers');

const getDashboard = async () => {
  const [totalUsers, totalVendors, totalProducts, totalOrders, pendingVendors, revenueData] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Vendor.countDocuments(),
    Product.countDocuments({ status: 'active' }),
    Order.countDocuments(),
    Vendor.countDocuments({ status: 'pending' }),
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  const totalRevenue = revenueData[0]?.total || 0;

  const monthlyOrders = await Order.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return { totalUsers, totalVendors, totalProducts, totalOrders, pendingVendors, totalRevenue, monthlyOrders };
};

const getUsers = async ({ page = 1, limit = 20, search, role }) => {
  const { skip, limit: lim } = getPagination(page, limit);
  const query = {};
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  if (role) query.role = role;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    User.countDocuments(query),
  ]);
  return { users, pagination: buildPaginationMeta(total, page, lim) };
};

const getVendors = async ({ page = 1, limit = 20, status }) => {
  const { skip, limit: lim } = getPagination(page, limit);
  const query = {};
  if (status) query.status = status;

  const [vendors, total] = await Promise.all([
    Vendor.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    Vendor.countDocuments(query),
  ]);
  return { vendors, pagination: buildPaginationMeta(total, page, lim) };
};

const updateVendorStatus = async (vendorId, status) => {
  const vendor = await Vendor.findByIdAndUpdate(vendorId, { status }, { new: true }).populate('user', 'name email');
  if (!vendor) throw Object.assign(new Error('Vendor not found'), { statusCode: 404 });

  await Notification.create({
    user: vendor.user._id,
    title: `Vendor Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your vendor account has been ${status}.`,
    type: 'vendor',
  });

  return vendor;
};

const toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  user.isActive = !user.isActive;
  await user.save();
  return user;
};

const getAdminOrders = async ({ page = 1, limit = 20, status }) => {
  const { skip, limit: lim } = getPagination(page, limit);
  const query = {};
  if (status) query.orderStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    Order.countDocuments(query),
  ]);
  return { orders, pagination: buildPaginationMeta(total, page, lim) };
};

module.exports = { getDashboard, getUsers, getVendors, updateVendorStatus, toggleUserStatus, getAdminOrders };
