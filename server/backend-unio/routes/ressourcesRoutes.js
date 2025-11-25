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

router.post("/", protect, createRessource);       // Prof/Admin
router.get("/", protect, getAllRessources);       // Tous
router.get("/:id", protect, getRessourceById);    // Tous
router.put("/:id", protect, updateRessource);     // Prof/Admin
router.delete("/:id", protect, deleteRessource);  // Prof/Admin

export default router;
