import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  updateProfile,
  updatePreferences,
  updateSecurity,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

/* ===========================
   🔹 PUBLIC ROUTES
=========================== */
// Register new user
router.post("/register", signupUser);

// Login user
router.post("/login", loginUser);

/* ===========================
   🔹 PROTECTED ROUTES
   (Require authentication)
=========================== */
// Logout user
router.get("/logout", logoutUser);

// Update own profile

router.put("/profile", protect, updateProfile);

// Update preferences
router.put("/preferences", protect, updatePreferences);

// Update security settings
router.put("/security", protect, updateSecurity);

/* ===========================
   🔹 ADMIN ROUTES
   (Require authentication + admin)
=========================== */
// Get all users
router.get("/", protect, isAdmin, getUsers);

// Get user by ID
router.get("/:id", protect, isAdmin, getUserById);

// Create user (by admin)
router.post("/create", protect, isAdmin, createUser);

// Update user (by admin)
router.put("/:id", protect, isAdmin, updateUser);

// Delete user (by admin)
router.delete("/:id", protect, isAdmin, deleteUser);

export default router;
