import express from "express";
import { protect } from "../middleware/auth.js";
import { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } from "../controllers/calendrierController.js";

const router = express.Router();

router.post("/", protect, createEvent);         // Prof/Admin
router.get("/", protect, getAllEvents);         // Tous - Get all events
router.get("/:id", protect, getEventById);      // Tous - Get one event by ID
router.put("/:id", protect, updateEvent);       // Prof/Admin ou créateur
router.delete("/:id", protect, deleteEvent);    // Prof/Admin ou créateur

export default router;
