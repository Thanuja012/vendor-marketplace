const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many requests' } });

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string, minLength: 6 }
 *               role: { type: string, enum: [customer, vendor] }
 *     responses:
 *       201: { description: User registered }
 *       409: { description: Email already exists }
 */
router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, ctrl.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     security: []
 */
router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validate, ctrl.login);

router.get('/me', authenticate, ctrl.getMe);
router.put('/profile', authenticate, ctrl.updateProfile);
router.post('/addresses', authenticate, ctrl.addAddress);
router.put('/addresses/:addressId', authenticate, ctrl.updateAddress);
router.delete('/addresses/:addressId', authenticate, ctrl.deleteAddress);

module.exports = router;
