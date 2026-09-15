const wishlistService = require('../services/wishlistService');
const response = require('../utils/response');

exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user._id);
    response.success(res, { wishlist });
  } catch (err) { next(err); }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.addToWishlist(req.user._id, req.params.productId);
    response.success(res, { wishlist }, 'Added to wishlist');
  } catch (err) { next(err); }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.removeFromWishlist(req.user._id, req.params.productId);
    response.success(res, { wishlist }, 'Removed from wishlist');
  } catch (err) { next(err); }
};
