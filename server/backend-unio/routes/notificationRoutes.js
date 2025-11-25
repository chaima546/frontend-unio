import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createNotification,
  getAllNotifications,
  markNotificationAsRead,
  deleteNotification
} from "../controllers/notificationController.js";

const router = express.Router();

// Student routes (Can view their own notifications and mark as read)
router.get("/", protect, getAllNotifications);                // All users can view their notifications
router.put("/:id/read", protect, markNotificationAsRead);     // All users can mark their notifications as read

// Prof/Admin routes only (Students cannot create/delete notifications)
router.post("/", protect, createNotification);                // Prof/Admin only
router.delete("/:id", protect, deleteNotification);           // Prof/Admin only

export default router;
