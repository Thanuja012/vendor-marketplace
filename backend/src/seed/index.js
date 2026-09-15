require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const slugify = require('slugify');

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');

const categoriesData = require('./categories');
const vendorsData = require('./vendors');
const getProducts1 = require('./products1');
const getProducts2 = require('./products2');
const getProducts3 = require('./products3');

const DEMO_PASSWORD = 'Demo@1234';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear all collections
  await Promise.all([
    User.deleteMany({}), Vendor.deleteMany({}), Category.deleteMany({}),
    Product.deleteMany({}), Order.deleteMany({}), Review.deleteMany({}),
    Cart.deleteMany({}), Wishlist.deleteMany({}), Notification.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'Admin User', email: 'admin@smartmart.com',
    password: DEMO_PASSWORD, role: 'admin', isActive: true,
  });
  console.log('Admin created:', admin.email);

  // Create customer
  const customer = await User.create({
    name: 'John Customer', email: 'customer@smartmart.com',
    password: DEMO_PASSWORD, role: 'customer', isActive: true,
    phone: '+1-555-9999',
    addresses: [{
      label: 'Home', fullName: 'John Customer', phone: '+1-555-9999',
      street: '123 Main Street', city: 'New York', state: 'NY',
      zipCode: '10001', country: 'US', isDefault: true,
    }],
  });
  console.log('Customer created:', customer.email);

  // Create categories
  const categories = await Category.insertMany(categoriesData);
  const categoryMap = {};
  categories.forEach((c) => { categoryMap[c.slug] = c._id; });
  console.log(`Created ${categories.length} categories`);

  // Create vendor users and vendor profiles
  const vendorMap = {};
  for (const vd of vendorsData) {
    const user = await User.create({
      name: vd.name, email: vd.email,
      password: DEMO_PASSWORD, role: 'vendor', isActive: true,
    });
    const slug = slugify(vd.storeName, { lower: true, strict: true }) + '-' + Date.now();
    const vendor = await Vendor.create({
      user: user._id, storeName: vd.storeName, slug,
      description: vd.description, logo: vd.logo, banner: vd.banner,
      businessEmail: vd.businessEmail, phone: vd.phone,
      status: 'approved', rating: vd.rating,
    });
    vendorMap[vd.storeName] = vendor._id;
  }
  // Also create the demo vendor account
  const demoVendorUser = await User.create({
    name: 'Demo Vendor', email: 'vendor@smartmart.com',
    password: DEMO_PASSWORD, role: 'vendor', isActive: true,
  });
  const demoVendorSlug = 'demo-vendor-store-' + Date.now();
  const demoVendor = await Vendor.create({
    user: demoVendorUser._id, storeName: 'Demo Vendor Store', slug: demoVendorSlug,
    description: 'Demo vendor store for testing purposes.',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
    businessEmail: 'vendor@smartmart.com', phone: '+1-555-0200',
    status: 'approved', rating: 4.5,
  });
  vendorMap['Demo Vendor Store'] = demoVendor._id;
  console.log(`Created ${Object.keys(vendorMap).length} vendors`);

  // Create products
  const allProductDefs = [
    ...getProducts1(), ...getProducts2(), ...getProducts3(),
  ];

  const createdProducts = [];
  for (const pd of allProductDefs) {
    const vendorId = vendorMap[pd.vendorKey];
    const categoryId = categoryMap[pd.categoryKey];
    if (!vendorId || !categoryId) {
      console.warn(`Skipping product ${pd.name}: vendor or category not found`);
      continue;
    }
    const slug = slugify(pd.name, { lower: true, strict: true }) + '-' + Date.now() + Math.floor(Math.random() * 1000);
    const product = await Product.create({
      vendor: vendorId, category: categoryId,
      name: pd.name, slug, description: pd.description,
      price: pd.price, originalPrice: pd.originalPrice,
      discount: Math.round(((pd.originalPrice - pd.price) / pd.originalPrice) * 100),
      images: pd.images, thumbnail: pd.thumbnail,
      brand: pd.brand, stock: pd.stock, sku: pd.sku,
      ratings: pd.ratings, reviewCount: pd.reviewCount,
      featured: pd.featured, specifications: pd.specifications,
      variants: pd.variants, tags: pd.tags, status: 'active',
    });
    createdProducts.push(product);
  }

  const demoProducts = [
    {
      categoryKey: 'electronics',
      name: 'Demo Wireless Earbuds',
      description: 'Compact wireless earbuds with active noise cancellation and a charging case.',
      price: 89, originalPrice: 119, brand: 'SmartMart Audio', stock: 60, sku: 'DEMO-EARBUDS-001',
      ratings: 4.6, featured: true,
      images: [
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800',
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
        'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800',
      ],
      tags: ['earbuds', 'wireless', 'audio'],
    },
    {
      categoryKey: 'home-kitchen',
      name: 'Demo Ceramic Pour-Over Set',
      description: 'A modern ceramic pour-over coffee set for a smooth daily brew.',
      price: 34, originalPrice: 49, brand: 'SmartMart Home', stock: 35, sku: 'DEMO-COFFEE-001',
      ratings: 4.5, featured: false,
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
      ],
      tags: ['coffee', 'kitchen', 'ceramic'],
    },
  ];

  for (const pd of demoProducts) {
    const categoryId = categoryMap[pd.categoryKey];
    const slug = slugify(pd.name, { lower: true, strict: true }) + '-' + Date.now() + Math.floor(Math.random() * 1000);
    const product = await Product.create({
      vendor: demoVendor._id,
      category: categoryId,
      name: pd.name,
      slug,
      description: pd.description,
      price: pd.price,
      originalPrice: pd.originalPrice,
      discount: Math.round(((pd.originalPrice - pd.price) / pd.originalPrice) * 100),
      images: pd.images,
      thumbnail: pd.images[0],
      brand: pd.brand,
      stock: pd.stock,
      sku: pd.sku,
      ratings: pd.ratings,
      featured: pd.featured,
      tags: pd.tags,
      status: 'active',
    });
    createdProducts.push(product);
  }
  console.log(`Created ${createdProducts.length} products`);

  // Create sample reviews for first few products
  const reviewTexts = [
    { rating: 5, title: 'Absolutely love it!', comment: 'This product exceeded my expectations. The quality is outstanding and delivery was fast.' },
    { rating: 4, title: 'Great product', comment: 'Very happy with this purchase. Works exactly as described. Would recommend.' },
    { rating: 5, title: 'Best purchase this year', comment: 'Incredible quality for the price. I have already recommended it to friends and family.' },
    { rating: 4, title: 'Good value', comment: 'Solid product, good build quality. Shipping was quick and packaging was excellent.' },
    { rating: 3, title: 'Decent but expected more', comment: 'It is okay for the price. Does what it says but nothing extraordinary.' },
  ];

  // Create a delivered order for the customer so they can leave reviews
  if (createdProducts.length >= 2) {
    const orderItems = createdProducts.slice(0, 2).map((p) => ({
      product: p._id,
      vendor: p.vendor,
      name: p.name,
      image: p.thumbnail,
      price: p.price,
      quantity: 1,
      vendorName: 'TechZone',
    }));
    const subtotal = orderItems.reduce((s, i) => s + i.price, 0);
    const deliveredOrder = await Order.create({
      orderId: 'SM-2024-100001',
      user: customer._id,
      items: orderItems,
      shippingAddress: { fullName: 'John Customer', phone: '+1-555-9999', street: '123 Main Street', city: 'New York', state: 'NY', zipCode: '10001', country: 'US' },
      subtotal, shippingFee: 0, tax: parseFloat((subtotal * 0.08).toFixed(2)),
      totalAmount: parseFloat((subtotal * 1.08).toFixed(2)),
      paymentMethod: 'card', paymentStatus: 'paid',
      orderStatus: 'delivered',
      statusHistory: [
        { status: 'placed', note: 'Order placed' },
        { status: 'confirmed', note: 'Order confirmed' },
        { status: 'processing', note: 'Processing' },
        { status: 'shipped', note: 'Shipped' },
        { status: 'delivered', note: 'Delivered' },
      ],
    });

    // Add reviews for delivered products
    for (let i = 0; i < Math.min(2, createdProducts.length); i++) {
      const rt = reviewTexts[i % reviewTexts.length];
      await Review.create({
        user: customer._id, product: createdProducts[i]._id,
        order: deliveredOrder._id, rating: rt.rating,
        title: rt.title, comment: rt.comment, isVerified: true,
      });
    }
    console.log('Created sample order and reviews');
  }

  // Create notification for customer
  await Notification.create({
    user: customer._id,
    title: 'Welcome to SmartMart!',
    message: 'Thank you for joining SmartMart. Start shopping from thousands of products.',
    type: 'system',
  });

  console.log('\n=== SEED COMPLETE ===');
  console.log('Demo Credentials:');
  console.log('  Admin:    admin@smartmart.com    / Demo@1234');
  console.log('  Vendor:   vendor@smartmart.com   / Demo@1234');
  console.log('  Customer: customer@smartmart.com / Demo@1234');
  console.log('====================\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
