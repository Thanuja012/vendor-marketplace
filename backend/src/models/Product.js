const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: String,
  options: [String],
});

const specSchema = new mongoose.Schema({
  key: String,
  value: String,
});

const productSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  images: [String],
  thumbnail: { type: String, default: '' },
  brand: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, default: '' },
  ratings: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  specifications: [specSchema],
  variants: [variantSchema],
  tags: [String],
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  soldCount: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ featured: 1 });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const slugify = require('slugify');
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.originalPrice > 0 && this.price < this.originalPrice) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  if (!this.thumbnail && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
