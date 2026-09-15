const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const getWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({ user: userId })
    .populate({ path: 'products', populate: { path: 'vendor', select: 'storeName slug' } });
  return wishlist || { products: [] };
};

const addToWishlist = async (userId, productId) => {
  const product = await Product.findById(productId);
  if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $addToSet: { products: productId } },
    { upsert: true, new: true }
  ).populate({ path: 'products', populate: { path: 'vendor', select: 'storeName slug' } });

  return wishlist;
};

const removeFromWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $pull: { products: productId } },
    { new: true }
  ).populate({ path: 'products', populate: { path: 'vendor', select: 'storeName slug' } });

  return wishlist || { products: [] };
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
