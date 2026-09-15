const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const register = async ({ name, email, password, phone, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });

  const allowedRoles = ['customer', 'vendor'];
  const userRole = allowedRoles.includes(role) ? role : 'customer';

  const user = await User.create({ name, email, password, phone, role: userRole });

  if (userRole === 'vendor') {
    await Vendor.create({ user: user._id, storeName: `${name}'s Store` });
  }

  const token = generateToken(user._id);
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const token = generateToken(user._id);
  const userObj = user.toJSON();
  return { user: userObj, token };
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user;
};

module.exports = { register, login, getMe };
