const express = require("express");
const {
  createProduct, getProducts, getProduct, updateProduct, deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Public (guests can browse)
router.get("/", getProducts);
router.get("/:id", getProduct);

// Admin only
router.post("/", protect, authorize("admin"), createProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;