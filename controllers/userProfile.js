const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { asyncHandler } = require("../middleware/errorHandler");

const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;
  if (password) {
    if (String(password).length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
  }

  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

const deleteProfile = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ message: "Your account was deleted" });
});

// Admin only
const getAllUsers = asyncHandler(async (req, res) => {
  res.json(await User.find().select("-password"));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["admin", "user", "guest"].includes(role)) {
    res.status(400);
    throw new Error("Role must be admin, user or guest");
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ message: "User deleted" });
});

module.exports = { getProfile, updateProfile, deleteProfile, getAllUsers, updateUserRole, deleteUser };