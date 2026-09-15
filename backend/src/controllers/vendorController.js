const vendorService = require('../services/vendorService');
const productService = require('../services/productService');
const orderService = require('../services/orderService');
const Vendor = require('../models/Vendor');
const response = require('../utils/response');

exports.getProfile = async (req, res, next) => {
  try {
    const vendor = await vendorService.getVendorByUserId(req.user._id);
    response.success(res, { vendor });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const vendor = await vendorService.updateStoreProfile(req.user._id, req.body);
    response.success(res, { vendor }, 'Store profile updated');
  } catch (err) { next(err); }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return response.error(res, 'Vendor not found', 404);
    const data = await vendorService.getDashboard(vendor._id);
    response.success(res, data);
  } catch (err) { next(err); }
};

exports.getProducts = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return response.error(res, 'Vendor not found', 404);
    const result = await productService.getProducts({ ...req.query, vendor: vendor._id, status: req.query.status || 'all' });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.createProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || vendor.status !== 'approved') return response.error(res, 'Vendor not approved', 403);
    const product = await productService.createProduct(vendor._id, req.body);
    response.success(res, { product }, 'Product created', 201);
  } catch (err) { next(err); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return response.error(res, 'Vendor not found', 404);
    const product = await productService.updateProduct(req.params.id, vendor._id, req.body);
    response.success(res, { product }, 'Product updated');
  } catch (err) { next(err); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return response.error(res, 'Vendor not found', 404);
    await productService.deleteProduct(req.params.id, vendor._id);
    response.success(res, {}, 'Product deleted');
  } catch (err) { next(err); }
};

exports.getOrders = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return response.error(res, 'Vendor not found', 404);
    const result = await vendorService.getVendorOrders(vendor._id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) return response.error(res, 'Vendor not found', 404);
    const order = await orderService.updateOrderStatus(req.params.id, vendor._id, req.body.status, req.body.note);
    response.success(res, { order }, 'Order status updated');
  } catch (err) { next(err); }
};

exports.getPublicStore = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ slug: req.params.slug, status: 'approved' }).populate('user', 'name');
    if (!vendor) return response.error(res, 'Store not found', 404);
    const result = await productService.getProducts({ vendor: vendor._id, ...req.query });
    response.success(res, { vendor, ...result });
  } catch (err) { next(err); }
};
