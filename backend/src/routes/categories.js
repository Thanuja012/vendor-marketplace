const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', ctrl.getCategories);
router.post('/', authenticate, authorize('admin'), ctrl.createCategory);
router.put('/:id', authenticate, authorize('admin'), ctrl.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteCategory);

module.exports = router;
