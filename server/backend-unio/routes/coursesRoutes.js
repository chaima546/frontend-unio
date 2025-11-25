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

// Routes Admin/Prof
router.post("/admin", protect, createCourse);
router.put("/:id", protect, updateCourse);
router.delete("/:id", protect, deleteCourse);

// Student assignment routes (Prof or Admin)
router.post("/:id/assign-students", protect, assignStudentsToCourse);
router.post("/:id/remove-students", protect, removeStudentsFromCourse);

export default router;
