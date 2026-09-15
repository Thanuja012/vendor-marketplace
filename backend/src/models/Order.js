const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
  selectedVariants: { type: Map, of: String, default: {} },
  vendorName: String,
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'card'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'mock_paid', 'failed', 'refunded'], default: 'pending' },
  transactionReference: { type: String, default: '' },
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
  },
  trackingNumber: { type: String, default: '' },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
  cancelReason: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
