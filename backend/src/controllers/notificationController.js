const Notification = require('../models/Notification');
const response = require('../utils/response');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
    response.success(res, { notifications, unreadCount });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    response.success(res, {}, 'Notifications marked as read');
  } catch (err) { next(err); }
};

exports.markOneRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    response.success(res, {}, 'Notification marked as read');
  } catch (err) { next(err); }
};
