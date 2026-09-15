const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId })
    .populate({ path: 'items.product', populate: { path: 'vendor', select: 'storeName slug' } });
  return cart || { items: [], total: 0 };
};

const addToCart = async (userId, { productId, quantity = 1, selectedVariants = {} }) => {
  const product = await Product.findById(productId);
  if (!product || product.status !== 'active') throw Object.assign(new Error('Product not available'), { statusCode: 404 });
  if (product.stock < quantity) throw Object.assign(new Error('Insufficient stock'), { statusCode: 400 });

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });

  const existingIdx = cart.items.findIndex(
    (item) => item.product.toString() === productId &&
      JSON.stringify(Object.fromEntries(item.selectedVariants)) === JSON.stringify(selectedVariants)
  );

  if (existingIdx > -1) {
    const newQty = cart.items[existingIdx].quantity + quantity;
    if (newQty > product.stock) throw Object.assign(new Error('Insufficient stock'), { statusCode: 400 });
    cart.items[existingIdx].quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity, selectedVariants, price: product.price });
  }

  await cart.save();
  return getCart(userId);
};

const updateCartItem = async (userId, itemId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw Object.assign(new Error('Cart not found'), { statusCode: 404 });

  const item = cart.items.id(itemId);
  if (!item) throw Object.assign(new Error('Item not found'), { statusCode: 404 });

  const product = await Product.findById(item.product);
  if (quantity > product.stock) throw Object.assign(new Error('Insufficient stock'), { statusCode: 400 });

  if (quantity <= 0) {
    cart.items.pull(itemId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  return getCart(userId);
};

const removeFromCart = async (userId, itemId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw Object.assign(new Error('Cart not found'), { statusCode: 404 });
  cart.items.pull(itemId);
  await cart.save();
  return getCart(userId);
};

const clearCart = async (userId) => {
  await Cart.findOneAndUpdate({ user: userId }, { items: [] });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
