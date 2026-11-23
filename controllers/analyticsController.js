const Order = require("../models/order");
const Product = require("../models/product");
const { asyncHandler } = require("../middleware/errorHandler");

// Recommends products that other buyers of the same items also bought.
// Falls back to same-category products, then newest products.
const getRecommendations = asyncHandler(async (req, res) => {
  const myOrders = await Order.find({ user: req.user._id });
  const bought = new Set(myOrders.flatMap((o) => o.items.map((i) => String(i.product))));

  const scores = {};
  if (bought.size > 0) {
    const related = await Order.find({
      "items.product": { $in: [...bought] },
      user: { $ne: req.user._id },
    });
    related.forEach((o) =>
      o.items.forEach((i) => {
        const id = String(i.product);
        if (!bought.has(id)) scores[id] = (scores[id] || 0) + 1;
      })
    );
  }

  const topIds = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let recommendations = [];
  let basedOn = "co-purchase";

  if (topIds.length > 0) {
    const found = await Product.find({ _id: { $in: topIds } });
    recommendations = topIds.map((id) => found.find((p) => String(p._id) === id)).filter(Boolean);
  } else if (bought.size > 0) {
    const boughtProducts = await Product.find({ _id: { $in: [...bought] } });
    const categories = [...new Set(boughtProducts.map((p) => p.category))];
    recommendations = await Product.find({
      category: { $in: categories },
      _id: { $nin: [...bought] },
    }).limit(5);
    basedOn = "category";
  }

  if (recommendations.length === 0) {
    recommendations = await Product.find({ _id: { $nin: [...bought] } })
      .sort({ createdAt: -1 })
      .limit(5);
    basedOn = "newest";
  }

  res.json({ basedOn, recommendations });
});

// Admin: exports purchase data as CSV to load into RapidMiner
const exportForRapidMiner = asyncHandler(async (req, res) => {
  const orders = await Order.find();
  const rows = ["orderId,userId,productId,quantity"];
  orders.forEach((o) =>
    o.items.forEach((i) => rows.push(`${o._id},${o.user},${i.product},${i.quantity}`))
  );
  res.header("Content-Type", "text/csv");
  res.attachment("orders_for_rapidminer.csv");
  res.send(rows.join("\n"));
});

module.exports = { getRecommendations, exportForRapidMiner };