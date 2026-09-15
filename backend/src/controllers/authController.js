const authService = require('../services/authService');
const response = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    response.success(res, { user, token }, 'Registration successful', 201);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    response.success(res, { user, token }, 'Login successful');
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    response.success(res, { user });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true });
    response.success(res, { user }, 'Profile updated');
  } catch (err) { next(err); }
};

exports.addAddress = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }
    user.addresses.push(req.body);
    await user.save();
    response.success(res, { addresses: user.addresses }, 'Address added');
  } catch (err) { next(err); }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return response.error(res, 'Address not found', 404);
    if (req.body.isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
    Object.assign(addr, req.body);
    await user.save();
    response.success(res, { addresses: user.addresses }, 'Address updated');
  } catch (err) { next(err); }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.addressId);
    await user.save();
    response.success(res, { addresses: user.addresses }, 'Address deleted');
  } catch (err) { next(err); }
};
