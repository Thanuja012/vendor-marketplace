const generateOrderId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `SM-${year}-${random}`;
};

const getPagination = (page = 1, limit = 12) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return { skip: (p - 1) * l, limit: l, page: p };
};

const buildPaginationMeta = (total, page, limit) => ({
  total,
  page: parseInt(page),
  limit: parseInt(limit),
  pages: Math.ceil(total / limit),
});

module.exports = { generateOrderId, getPagination, buildPaginationMeta };
