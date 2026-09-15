const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  storeName: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },
  businessEmail: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'US' },
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
  rating: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

vendorSchema.pre('save', function (next) {
  if (this.isModified('storeName') && !this.slug) {
    const slugify = require('slugify');
    this.slug = slugify(this.storeName, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Vendor', vendorSchema);
