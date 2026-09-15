const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRE = '1h';
process.env.BCRYPT_ROUNDS = '4';
process.env.REDIS_URL = 'redis://localhost:6379';

const app = require('../src/app');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Review = require('../src/models/Review');

jest.setTimeout(60000);

let mongo;
let category;
let product;
let customer;
let vendorUser;
let vendor;
let secondVendorUser;
let secondVendor;
let secondVendorToken;
let admin;
let customerToken;
let vendorToken;
let adminToken;

const address = {
  fullName: 'Test Customer',
  phone: '5555555555',
  street: '1 Test Street',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  country: 'US',
};

const register = async (user) => {
  const response = await request(app).post('/api/auth/register').send(user);
  expect(response.status).toBe(201);
  return response.body.data;
};

const login = async (email, password) => {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  expect(response.status).toBe(200);
  return response.body.data.token;
};

const createOrder = async (token) => {
  const response = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      items: [{ productId: product._id.toString(), quantity: 1 }],
      shippingAddress: address,
      paymentMethod: 'cod',
    });
  expect(response.status).toBe(201);
  return response.body.data.order;
};

const createPaymentOrder = async (token, paymentMethod, extra = {}) => {
  const response = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      items: [{ productId: product._id.toString(), quantity: 1 }],
      shippingAddress: address,
      paymentMethod,
      ...extra,
    });
  return response;
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  category = await Category.create({
    name: 'Test Category',
    slug: 'test-category',
    description: 'Category used by automated tests',
  });

  const customerResult = await register({
    name: 'Test Customer',
    email: 'customer@example.com',
    password: 'Password1!',
    phone: '5555555555',
  });
  customer = customerResult.user;
  customerToken = customerResult.token;

  const vendorResult = await register({
    name: 'Test Vendor',
    email: 'vendor@example.com',
    password: 'Password1!',
    role: 'vendor',
  });
  vendorUser = vendorResult.user;
  vendorToken = vendorResult.token;
  vendor = await Vendor.findOne({ user: vendorUser._id });

  const secondVendorResult = await register({
    name: 'Second Vendor',
    email: 'second-vendor@example.com',
    password: 'Password1!',
    role: 'vendor',
  });
  secondVendorUser = secondVendorResult.user;
  secondVendorToken = secondVendorResult.token;
  secondVendor = await Vendor.findOneAndUpdate(
    { user: secondVendorUser._id },
    { status: 'approved' },
    { new: true }
  );

  admin = await User.create({
    name: 'Test Admin',
    email: 'admin@example.com',
    password: 'Password1!',
    role: 'admin',
  });
  adminToken = await login('admin@example.com', 'Password1!');

  product = await Product.create({
    vendor: vendor._id,
    category: category._id,
    name: 'Test Product',
    description: 'Product used by automated tests',
    price: 25,
    originalPrice: 30,
    stock: 20,
    images: ['https://example.com/test-product.jpg'],
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

describe('authentication and authorization', () => {
  test('registers a customer', async () => {
    const result = await register({
      name: 'Another Customer',
      email: 'another@example.com',
      password: 'Password1!',
    });

    expect(result.user.role).toBe('customer');
    expect(result.token).toEqual(expect.any(String));
  });

  test('logs a user in', async () => {
    const token = await login('customer@example.com', 'Password1!');
    expect(token).toEqual(expect.any(String));
  });

  test('protects authenticated routes with JWT authentication', async () => {
    const unauthenticated = await request(app).get('/api/auth/me');
    expect(unauthenticated.status).toBe(401);

    const authenticated = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(authenticated.status).toBe(200);
    expect(authenticated.body.data.user.email).toBe('customer@example.com');
  });

  test('enforces customer, vendor, and admin RBAC', async () => {
    const customerAdmin = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);
    const vendorAdmin = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${vendorToken}`);
    const customerVendor = await request(app)
      .get('/api/vendor/profile')
      .set('Authorization', `Bearer ${customerToken}`);
    const adminVendor = await request(app)
      .get('/api/vendor/profile')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(customerAdmin.status).toBe(403);
    expect(vendorAdmin.status).toBe(403);
    expect(customerVendor.status).toBe(403);
    expect(adminVendor.status).toBe(403);
  });
});

describe('products, cart, and wishlist', () => {
  test('allows public product access', async () => {
    const list = await request(app).get('/api/products');
    const detail = await request(app).get(`/api/products/${product._id}`);

    expect(list.status).toBe(200);
    expect(list.body.products).toEqual(expect.arrayContaining([
      expect.objectContaining({ _id: product._id.toString() }),
    ]));
    expect(detail.status).toBe(200);
    expect(detail.body.data.product.name).toBe('Test Product');
  });

  test('filters products by category slug', async () => {
    const response = await request(app).get('/api/products?category=test-category');

    expect(response.status).toBe(200);
    expect(response.body.products).toEqual(expect.arrayContaining([
      expect.objectContaining({ _id: product._id.toString() }),
    ]));
  });

  test('supports cart add, update, and remove operations', async () => {
    const added = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: product._id, quantity: 2 });
    expect(added.status).toBe(200);
    expect(added.body.data.cart.items).toHaveLength(1);
    expect(added.body.data.cart.items[0].quantity).toBe(2);

    const itemId = added.body.data.cart.items[0]._id;
    const updated = await request(app)
      .put(`/api/cart/${itemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 1 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.cart.items[0].quantity).toBe(1);

    const removed = await request(app)
      .delete(`/api/cart/${itemId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(removed.status).toBe(200);
    expect(removed.body.data.cart.items).toHaveLength(0);
  });

  test('supports wishlist add and remove operations', async () => {
    const added = await request(app)
      .post(`/api/wishlist/${product._id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(added.status).toBe(200);
    expect(added.body.data.wishlist.products).toHaveLength(1);

    const removed = await request(app)
      .delete(`/api/wishlist/${product._id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(removed.status).toBe(200);
    expect(removed.body.data.wishlist.products).toHaveLength(0);
  });
});

describe('product management authorization', () => {
  test('prevents customers from creating, updating, or deleting products', async () => {
    const create = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ vendor: vendor._id, category: category._id, name: 'Customer Product' });
    const update = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Customer Update' });
    const remove = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(create.status).toBe(403);
    expect(update.status).toBe(403);
    expect(remove.status).toBe(403);
  });

  test('prevents vendors from modifying another vendor product', async () => {
    const update = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${secondVendorToken}`)
      .send({ name: 'Cross Vendor Update' });
    const remove = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${secondVendorToken}`);

    expect(update.status).toBe(404);
    expect(remove.status).toBe(404);
    expect((await Product.findById(product._id)).name).toBe('Test Product');
  });

  test('allows admins to create, update, and delete products across vendors', async () => {
    const create = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vendor: secondVendor._id,
        category: category._id,
        name: 'Admin Product',
        description: 'Created by an administrator',
        price: 15,
        stock: 5,
      });
    expect(create.status).toBe(201);
    const adminProductId = create.body.data.product._id;
    expect(create.body.data.product.vendor.toString()).toBe(secondVendor._id.toString());

    const update = await request(app)
      .put(`/api/admin/products/${adminProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Admin Updated Product', price: 20 });
    expect(update.status).toBe(200);
    expect(update.body.data.product.name).toBe('Admin Updated Product');

    const remove = await request(app)
      .delete(`/api/admin/products/${adminProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(remove.status).toBe(200);
    expect(await Product.findById(adminProductId)).toBeNull();
  });
});

describe('orders and reviews', () => {
  test('creates an order for an authenticated customer', async () => {
    const order = await createOrder(customerToken);
    expect(order.user.toString()).toBe(customer._id.toString());
    expect(order.items[0].product.toString()).toBe(product._id.toString());
    expect(order.orderStatus).toBe('placed');
  });

  test('creates a COD order with pending payment and server-calculated totals', async () => {
    const response = await createPaymentOrder(customerToken, 'cod', {
      subtotal: 0,
      shippingFee: 0,
      tax: 0,
      totalAmount: 0,
    });
    expect(response.status).toBe(201);

    const order = response.body.data.order;
    expect(order.paymentMethod).toBe('cod');
    expect(order.paymentStatus).toBe('pending');
    expect(order.transactionReference).toBe('');
    expect(order.subtotal).toBe(25);
    expect(order.shippingFee).toBe(5.99);
    expect(order.tax).toBe(2);
    expect(order.totalAmount).toBe(32.99);
  });

  test('records demo card metadata without storing or claiming a real payment', async () => {
    const response = await createPaymentOrder(customerToken, 'card', {
      cardNumber: '4111111111111111',
      cvv: '123',
      expiry: '12/30',
      subtotal: 999999,
      totalAmount: 999999,
    });
    expect(response.status).toBe(201);

    const order = response.body.data.order;
    expect(order.paymentMethod).toBe('card');
    expect(order.paymentStatus).toBe('mock_paid');
    expect(order.transactionReference).toMatch(/^MOCK-/);
    expect(order.subtotal).toBe(25);
    expect(order.totalAmount).toBe(32.99);
    expect(order.cardNumber).toBeUndefined();
    expect(order.cvv).toBeUndefined();
    expect(order.expiry).toBeUndefined();
    expect(order.transactionReference).not.toContain('4111111111111111');

    const storedOrder = await Order.findById(order._id).lean();
    expect(storedOrder.paymentStatus).toBe('mock_paid');
    expect(storedOrder).not.toHaveProperty('cardNumber');
    expect(storedOrder).not.toHaveProperty('cvv');
    expect(storedOrder).not.toHaveProperty('expiry');
  });

  test('rejects unsupported payment methods and invalid quantities', async () => {
    const unsupported = await createPaymentOrder(customerToken, 'bank_transfer');
    const invalidQuantity = await createPaymentOrder(customerToken, 'cod', {
      items: [{ productId: product._id.toString(), quantity: -1 }],
    });

    expect(unsupported.status).toBe(400);
    expect(invalidQuantity.status).toBe(400);
  });

  test('cancels a cancellable customer order', async () => {
    const order = await createOrder(customerToken);
    const response = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.order.orderStatus).toBe('cancelled');
  });

  test('allows reviews only for products in delivered orders', async () => {
    const order = await createOrder(customerToken);
    const reviewData = {
      rating: 5,
      title: 'Great product',
      comment: 'Delivered as expected',
      orderId: order._id,
    };

    const beforeDelivery = await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send(reviewData);
    expect(beforeDelivery.status).toBe(403);

    await Order.findByIdAndUpdate(order._id, { orderStatus: 'delivered' });
    const afterDelivery = await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send(reviewData);
    expect(afterDelivery.status).toBe(201);
    expect(afterDelivery.body.data.review.isVerified).toBe(true);
    expect(await Review.countDocuments({ order: order._id })).toBe(1);
  });
});

describe('vendor and admin authorization', () => {
  test('prevents an unapproved vendor from creating products', async () => {
    const response = await request(app)
      .post('/api/vendor/products')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        category: category._id,
        name: 'Unauthorized Product',
        description: 'Should not be created',
        price: 10,
        stock: 2,
      });

    expect(response.status).toBe(403);
  });

  test('allows an admin to access the admin dashboard', async () => {
    const response = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining({
      totalProducts: expect.any(Number),
      totalOrders: expect.any(Number),
    }));
  });

  test('prevents customers from accessing admin endpoints', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(403);
  });
});
