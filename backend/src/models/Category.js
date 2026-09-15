const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  icon: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const slugify = require('slugify');
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
