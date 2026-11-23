const express = require("express");
const { getRecommendations, exportForRapidMiner } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/recommendations", protect, getRecommendations);
router.get("/export", protect, authorize("admin"), exportForRapidMiner);

module.exports = router;