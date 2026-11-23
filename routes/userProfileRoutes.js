const express = require("express");
const {
  getProfile, updateProfile, deleteProfile, getAllUsers, updateUserRole, deleteUser,
} = require("../controllers/userProfile");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.route("/me").get(getProfile).put(updateProfile).delete(deleteProfile);
router.get("/", authorize("admin"), getAllUsers);
router.put("/:id/role", authorize("admin"), updateUserRole);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;