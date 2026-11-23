const Product = require("../models/product");
const { asyncHandler } = require("../middleware/errorHandler");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, stock } = req.body;
  if (!name || !category || price === undefined) {
    res.status(400);
    throw new Error("Name, category and price are required");
  }
  const product = await Product.create({ name, description, category, price, stock });
  res.status(201).json(product);
});

// GET /api/products?search=shoe&category=men&minPrice=10&maxPrice=100&sort=price_asc&page=1&limit=10
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page, limit } = req.query;
  const filter = {};

  if (search) filter.name = { $regex: escapeRegex(String(search)), $options: "i" };
  if (category)
    filter.category = { $regex: `^${escapeRegex(String(category))}$`, $options: "i" };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name: { name: 1 },
    newest: { createdAt: -1 },
  };

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const lim = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortMap[sort] || { createdAt: -1 })
    .skip((pageNum - 1) * lim)
    .limit(lim);

  res.json({ total, page: pageNum, pages: Math.ceil(total / lim), products });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, stock } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, category, price, stock },
    { new: true, runValidators: true }
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ message: "Product deleted" });
});

module.exports = { createProduct, getProducts, getProduct, updateProduct, deleteProduct };