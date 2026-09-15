const productService = require('../services/productService');
const response = require('../utils/response');

exports.getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    response.success(res, { product });
  } catch (err) { next(err); }
};

exports.getFeatured = async (req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts();
    response.success(res, { products });
  } catch (err) { next(err); }
};

exports.getRecommended = async (req, res, next) => {
  try {
    const products = await productService.getRecommended(req.params.id, req.query.limit);
    response.success(res, { products });
  } catch (err) { next(err); }
};

exports.createProduct = async (req, res, next) => {
  try {
    const Vendor = require('../models/Vendor');
    const vendor = req.user.role === 'admin'
      ? await Vendor.findById(req.body.vendor)
      : await Vendor.findOne({ user: req.user._id });
    if (!vendor || vendor.status !== 'approved') {
      return response.error(
        res,
        req.user.role === 'admin' ? 'Approved vendor is required' : 'Vendor account not approved',
        req.user.role === 'admin' ? 400 : 403
      );
    }
    const product = await productService.createProduct(vendor._id, req.body);
    response.success(res, { product }, 'Product created', 201);
  } catch (err) { next(err); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    let vendorId;
    if (req.user.role === 'vendor') {
      const Vendor = require('../models/Vendor');
      const vendor = await Vendor.findOne({ user: req.user._id });
      if (!vendor) return response.error(res, 'Vendor not found', 404);
      vendorId = vendor._id;
    }
    const product = await productService.updateProduct(req.params.id, vendorId, req.body);
    response.success(res, { product }, 'Product updated');
  } catch (err) { next(err); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    let vendorId;
    if (req.user.role === 'vendor') {
      const Vendor = require('../models/Vendor');
      const vendor = await Vendor.findOne({ user: req.user._id });
      if (!vendor) return response.error(res, 'Vendor not found', 404);
      vendorId = vendor._id;
    }
    await productService.deleteProduct(req.params.id, vendorId);
    response.success(res, {}, 'Product deleted');
  } catch (err) { next(err); }
};
