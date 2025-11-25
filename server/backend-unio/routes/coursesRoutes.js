import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  assignStudentsToCourse,
  removeStudentsFromCourse
} from "../controllers/courseController.js";

import { protect } from "../middleware/auth.js";
const router = express.Router();

// Routes accessibles à tous les utilisateurs connectés
router.get("/", protect, getCourses);        // Tous les cours pour admin, cours inscrits pour user
router.get("/my-courses", protect, getCourses); // Cours de l'utilisateur
router.get("/:id", protect, getCourseById); // Cours spécifique

// Routes Admin/Prof only (Students have read-only access via GET routes above)
router.post("/admin", protect, createCourse);                            // Prof/Admin only
router.put("/:id", protect, updateCourse);                                // Prof/Admin only
router.delete("/:id", protect, deleteCourse);                             // Prof/Admin only

// Student assignment routes (Prof/Admin only)
router.post("/:id/assign-students", protect, assignStudentsToCourse);    // Prof/Admin only
router.post("/:id/remove-students", protect, removeStudentsFromCourse);  // Prof/Admin only

export default router;
