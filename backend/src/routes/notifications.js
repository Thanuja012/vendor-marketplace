const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getNotifications);
router.put('/read-all', ctrl.markRead);
router.put('/:id/read', ctrl.markOneRead);

module.exports = router;
