import express from "express";
import {
  createRessource,
  getAllRessources,
  getRessourceById,
  updateRessource,
  deleteRessource
} from "../controllers/ressourcesController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Student routes (Read-only access)
router.get("/", protect, getAllRessources);       // All users can view resources
router.get("/:id", protect, getRessourceById);    // All users can view resource details

// Prof/Admin routes only (Students cannot create/update/delete)
router.post("/", protect, createRessource);       // Prof/Admin only
router.put("/:id", protect, updateRessource);     // Prof/Admin only
router.delete("/:id", protect, deleteRessource);  // Prof/Admin only

export default router;
