const cartService = require('../services/cartService');
const response = require('../utils/response');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    response.success(res, { cart });
  } catch (err) { next(err); }
};

exports.addToCart = async (req, res, next) => {
  try {
    const cart = await cartService.addToCart(req.user._id, req.body);
    response.success(res, { cart }, 'Added to cart');
  } catch (err) { next(err); }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const cart = await cartService.updateCartItem(req.user._id, req.params.itemId, req.body.quantity);
    response.success(res, { cart }, 'Cart updated');
  } catch (err) { next(err); }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await cartService.removeFromCart(req.user._id, req.params.itemId);
    response.success(res, { cart }, 'Item removed');
  } catch (err) { next(err); }
};

exports.clearCart = async (req, res, next) => {
  try {
    await cartService.clearCart(req.user._id);
    response.success(res, {}, 'Cart cleared');
  } catch (err) { next(err); }
};
