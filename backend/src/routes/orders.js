const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 */
router.use(authenticate);
router.post('/', ctrl.createOrder);
router.get('/', ctrl.getOrders);
router.get('/:id', ctrl.getOrder);
router.post('/:id/cancel', ctrl.cancelOrder);

module.exports = router;
