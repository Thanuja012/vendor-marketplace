const Category = require('../models/Category');
const { getCache, setCache, delCache } = require('../config/redis');
const response = require('../utils/response');

exports.getCategories = async (req, res, next) => {
  try {
    const cached = await getCache('categories');
    if (cached) return response.success(res, { categories: cached });

    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
    await setCache('categories', categories, 600);
    response.success(res, { categories });
  } catch (err) { next(err); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    await delCache('categories');
    response.success(res, { category }, 'Category created', 201);
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return response.error(res, 'Category not found', 404);
    await delCache('categories');
    response.success(res, { category }, 'Category updated');
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    await delCache('categories');
    response.success(res, {}, 'Category deleted');
  } catch (err) { next(err); }
};
