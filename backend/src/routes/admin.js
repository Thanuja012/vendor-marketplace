const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const productCtrl = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));
router.get('/dashboard', ctrl.getDashboard);
router.get('/users', ctrl.getUsers);
router.put('/users/:id/toggle', ctrl.toggleUserStatus);
router.get('/vendors', ctrl.getVendors);
router.put('/vendors/:id/status', ctrl.updateVendorStatus);
router.get('/orders', ctrl.getOrders);
router.get('/products', ctrl.getProducts);
router.post('/products', productCtrl.createProduct);
router.put('/products/:id', productCtrl.updateProduct);
router.delete('/products/:id', productCtrl.deleteProduct);
router.put('/products/:id/toggle', ctrl.toggleProductStatus);

module.exports = router;
