import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createNotification,
  getAllNotifications,
  markNotificationAsRead,
  deleteNotification
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", protect, createNotification);                // Prof/Admin
router.get("/", protect, getAllNotifications);                // Tous (User récupère les siennes)
router.put("/:id/read", protect, markNotificationAsRead);     // Mark as read
router.delete("/:id", protect, deleteNotification);           // Prof/Admin ou propriétaire

export default router;
