import express from "express";
const router = express.Router();
import {
  registerProf,
  authProf,
  getProfs,
  getProfById,
  updateProf,
  deleteProf
} from "../controllers/profController.js";

// ✅ Inscription et Connexion
router.post("/", registerProf);     // POST /api/profs
router.post("/login", authProf);    // POST /api/profs/login

// ✅ CRUD des profs
router.get("/", getProfs);          // GET /api/profs
router.route("/:id")
  .get(getProfById)                 // GET /api/profs/:id
  .put(updateProf)                  // PUT /api/profs/:id
  .delete(deleteProf);              // DELETE /api/profs/:id

export default router;
