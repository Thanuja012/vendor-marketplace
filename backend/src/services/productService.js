const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const { getCache, setCache, delCachePattern } = require('../config/redis');
const { getPagination, buildPaginationMeta } = require('../utils/helpers');

const buildQuery = async (queryParams) => {
  const { search, category, brand, minPrice, maxPrice, rating, inStock, featured, vendor, status } = queryParams;
  const query = status === 'all' ? {} : { status: status || 'active' };

  if (search) query.$text = { $search: search };
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      const categoryDoc = await Category.findOne({
        $or: [{ slug: category }, { name: category }],
        isActive: true,
      }).select('_id').lean();
      query.category = categoryDoc?._id || new mongoose.Types.ObjectId();
    }
  }
  if (brand) query.brand = new RegExp(brand, 'i');
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  if (rating) query.ratings = { $gte: parseFloat(rating) };
  if (inStock === 'true') query.stock = { $gt: 0 };
  if (featured === 'true') query.featured = true;
  if (vendor) query.vendor = vendor;

  return query;
};

const buildSort = (sortParam) => {
  const sorts = {
    'price_asc': { price: 1 },
    'price_desc': { price: -1 },
    'rating': { ratings: -1 },
    'newest': { createdAt: -1 },
    'popular': { soldCount: -1 },
  };
  return sorts[sortParam] || { createdAt: -1 };
};

const getProducts = async (queryParams) => {
  const { page = 1, limit = 12, sort } = queryParams;
  const { skip, limit: lim } = getPagination(page, limit);
  const query = await buildQuery(queryParams);
  const sortObj = buildSort(sort);

  const cacheKey = `products:${JSON.stringify({ query, sort, page, limit })}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('vendor', 'storeName slug logo')
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(lim)
      .lean(),
    Product.countDocuments(query),
  ]);

  const result = { products, pagination: buildPaginationMeta(total, page, lim) };
  await setCache(cacheKey, result, 120);
  return result;
};

const getProductById = async (id) => {
  const cacheKey = `product:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const product = await Product.findById(id)
    .populate('vendor', 'storeName slug logo rating totalSales')
    .populate('category', 'name slug')
    .lean();

  if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  await setCache(cacheKey, product, 300);
  return product;
};

const createProduct = async (vendorId, data) => {
  const product = await Product.create({ ...data, vendor: vendorId });
  await delCachePattern('products:*');
  return product;
};

const updateProduct = async (productId, vendorId, data) => {
  const query = { _id: productId };
  if (vendorId) query.vendor = vendorId;

  const product = await Product.findOneAndUpdate(
    query,
    data,
    { new: true, runValidators: true }
  );
  if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  await delCachePattern('products:*');
  await delCachePattern(`product:${productId}`);
  return product;
};

const deleteProduct = async (productId, vendorId) => {
  const query = { _id: productId };
  if (vendorId) query.vendor = vendorId;

  const product = await Product.findOneAndDelete(query);
  if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  await delCachePattern('products:*');
  await delCachePattern(`product:${productId}`);
};

const getFeaturedProducts = async () => {
  const cacheKey = 'products:featured';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const products = await Product.find({ featured: true, status: 'active' })
    .populate('vendor', 'storeName slug')
    .populate('category', 'name slug')
    .sort({ soldCount: -1 })
    .limit(12)
    .lean();

  await setCache(cacheKey, products, 300);
  return products;
};

const getRecommended = async (productId, limit = 8) => {
  const product = await Product.findById(productId).lean();
  if (!product) return [];

  const products = await Product.find({
    _id: { $ne: productId },
    status: 'active',
    $or: [
      { category: product.category },
      { brand: product.brand },
      { price: { $gte: product.price * 0.7, $lte: product.price * 1.3 } },
    ],
  })
    .populate('vendor', 'storeName slug')
    .populate('category', 'name slug')
    .sort({ ratings: -1, soldCount: -1 })
    .limit(limit)
    .lean();

  return products;
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getFeaturedProducts, getRecommended };
