const Order = require("../models/order");
const Product = require("../models/product");
const { asyncHandler } = require("../middleware/errorHandler");

const createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("Order items are required");
  }

  let totalPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const quantity = item.quantity === undefined ? 1 : Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      res.status(400);
      throw new Error("Quantity must be a whole number of at least 1");
    }
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${product.name}`);
    }
    totalPrice += product.price * quantity;
    orderItems.push({ product: product._id, quantity });
  }

  for (const it of orderItems) {
    await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.quantity } });
  }

  const order = await Order.create({ user: req.user._id, items: orderItems, totalPrice });
  res.status(201).json(order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "name price")
    .sort({ createdAt: -1 });
  res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product", "name price")
    .sort({ createdAt: -1 });
  res.json(orders);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product", "name price");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (String(order.user) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not allowed to view this order");
  }
  res.json(order);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["pending", "shipped", "delivered"].includes(status)) {
    res.status(400);
    throw new Error("Status must be pending, shipped or delivered");
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json(order);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({ message: "Order deleted" });
});

module.exports = { createOrder, getMyOrders, getAllOrders, getOrder, updateOrderStatus, deleteOrder };