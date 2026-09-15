const router = require('express').Router();
const ctrl = require('../controllers/vendorController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/store/:slug', ctrl.getPublicStore);

router.use(authenticate, authorize('vendor'));
router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.get('/dashboard', ctrl.getDashboard);
router.get('/products', ctrl.getProducts);
router.post('/products', ctrl.createProduct);
router.put('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);
router.get('/orders', ctrl.getOrders);
router.put('/orders/:id/status', ctrl.updateOrderStatus);

module.exports = router;
