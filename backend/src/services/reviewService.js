const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { getPagination, buildPaginationMeta } = require('../utils/helpers');

const getProductReviews = async (productId, { page = 1, limit = 10 }) => {
  const { skip, limit: lim } = getPagination(page, limit);
  const [reviews, total] = await Promise.all([
    Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .lean(),
    Review.countDocuments({ product: productId }),
  ]);

  const distribution = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(productId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);

  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distribution.forEach((d) => { dist[d._id] = d.count; });

  return { reviews, distribution: dist, pagination: buildPaginationMeta(total, page, lim) };
};

const createReview = async (userId, productId, { rating, title, comment, images, orderId }) => {
  const existing = await Review.findOne({ user: userId, product: productId });
  if (existing) throw Object.assign(new Error('You have already reviewed this product'), { statusCode: 409 });

  // Verify delivered order
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
    'items.product': productId,
    orderStatus: 'delivered',
  });
  if (!order) throw Object.assign(new Error('You can only review products from delivered orders'), { statusCode: 403 });

  const review = await Review.create({
    user: userId,
    product: productId,
    order: orderId,
    rating,
    title,
    comment,
    images: images || [],
    isVerified: true,
  });

  // Update product rating
  const stats = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(productId) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratings: parseFloat(stats[0].avgRating.toFixed(1)),
      reviewCount: stats[0].count,
    });
  }

  return review.populate('user', 'name avatar');
};

module.exports = { getProductReviews, createReview };
