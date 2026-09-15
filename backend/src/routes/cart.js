const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 */
router.use(authenticate);
router.get('/', ctrl.getCart);
router.post('/', ctrl.addToCart);
router.put('/:itemId', ctrl.updateCartItem);
router.delete('/:itemId', ctrl.removeFromCart);
router.delete('/', ctrl.clearCart);

module.exports = router;
