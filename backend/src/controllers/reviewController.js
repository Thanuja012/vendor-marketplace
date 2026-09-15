const reviewService = require('../services/reviewService');
const response = require('../utils/response');

exports.getReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getProductReviews(req.params.id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user._id, req.params.id, req.body);
    response.success(res, { review }, 'Review submitted', 201);
  } catch (err) { next(err); }
};
