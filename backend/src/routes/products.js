const router = require('express').Router();
const ctrl = require('../controllers/productController');
const reviewCtrl = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price_asc, price_desc, rating, newest, popular] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 */
router.get('/', ctrl.getProducts);
router.get('/featured', ctrl.getFeatured);
router.get('/:id/recommended', ctrl.getRecommended);
router.get('/:id/reviews', reviewCtrl.getReviews);
router.post('/:id/reviews', authenticate, authorize('customer'), reviewCtrl.createReview);
router.get('/:id', ctrl.getProduct);
router.post('/', authenticate, authorize('vendor', 'admin'), ctrl.createProduct);
router.put('/:id', authenticate, authorize('vendor', 'admin'), ctrl.updateProduct);
router.delete('/:id', authenticate, authorize('vendor', 'admin'), ctrl.deleteProduct);

module.exports = router;
