import express from "express";
import { protect } from "../middleware/auth.js";
import { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } from "../controllers/calendrierController.js";

const router = express.Router();

// Student routes (Read-only access)
router.get("/", protect, getAllEvents);         // All users can view events
router.get("/:id", protect, getEventById);      // All users can view event details

// Prof/Admin routes only (Students cannot create/update/delete)
router.post("/", protect, createEvent);         // Prof/Admin only
router.put("/:id", protect, updateEvent);       // Prof/Admin only
router.delete("/:id", protect, deleteEvent);    // Prof/Admin only

export default router;
