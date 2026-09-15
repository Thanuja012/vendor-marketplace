const router = require('express').Router();
const ctrl = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getWishlist);
router.post('/:productId', ctrl.addToWishlist);
router.delete('/:productId', ctrl.removeFromWishlist);

module.exports = router;
