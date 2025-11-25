// routes/dashboardRoutes.js
import express from "express";
import { getAdminDashboard, getProfDashboard, getRecentActivity } from "../controllers/DashboardController.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin dashboard - GET /api/dashboard/admin
router.get("/admin", protect, isAdmin, getAdminDashboard);

// Professor dashboard - GET /api/dashboard/prof
router.get("/prof", protect, getProfDashboard);

// GET recent activity for admin
router.get("/activity", protect, isAdmin, getRecentActivity);

export default router;
