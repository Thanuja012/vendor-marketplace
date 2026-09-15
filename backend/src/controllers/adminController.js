const adminService = require('../services/adminService');
const productService = require('../services/productService');
const Product = require('../models/Product');
const response = require('../utils/response');

exports.getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboard();
    response.success(res, data);
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserStatus(req.params.id);
    response.success(res, { user }, 'User status updated');
  } catch (err) { next(err); }
};

exports.getVendors = async (req, res, next) => {
  try {
    const result = await adminService.getVendors(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.updateVendorStatus = async (req, res, next) => {
  try {
    const vendor = await adminService.updateVendorStatus(req.params.id, req.body.status);
    response.success(res, { vendor }, 'Vendor status updated');
  } catch (err) { next(err); }
};

exports.getOrders = async (req, res, next) => {
  try {
    const result = await adminService.getAdminOrders(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts({ ...req.query, status: req.query.status });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.toggleProductStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return response.error(res, 'Product not found', 404);
    product.status = product.status === 'active' ? 'inactive' : 'active';
    await product.save();
    response.success(res, { product }, 'Product status updated');
  } catch (err) { next(err); }
};
