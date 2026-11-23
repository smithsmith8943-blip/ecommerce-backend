const express = require("express");
const {
  createOrder, getMyOrders, getAllOrders, getOrder, updateOrderStatus, deleteOrder,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.post("/", authorize("user", "admin"), createOrder);
router.get("/my", getMyOrders);
router.get("/", authorize("admin"), getAllOrders);
router.get("/:id", getOrder);
router.put("/:id/status", authorize("admin"), updateOrderStatus);
router.delete("/:id", authorize("admin"), deleteOrder);

module.exports = router;