const orderService = require('../services/orderService');
const response = require('../utils/response');

exports.createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user._id, req.body);
    response.success(res, { order }, 'Order placed successfully', 201);
  } catch (err) { next(err); }
};

exports.getOrders = async (req, res, next) => {
  try {
    const result = await orderService.getOrders(req.user._id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
    response.success(res, { order });
  } catch (err) { next(err); }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user._id);
    response.success(res, { order }, 'Order cancelled');
  } catch (err) { next(err); }
};
