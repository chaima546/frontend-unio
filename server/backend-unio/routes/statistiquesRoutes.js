import express from 'express';
import { getAdminDashboardStats, getProfDashboardStats, getStudentDashboardStats } from '../controllers/statistiquesController.js';
import { protect, isAdmin, isProfessor } from '../middleware/auth.js';

const router = express.Router();

// Get statistics for the admin dashboard
router.get('/admin', protect, isAdmin, getAdminDashboardStats);

// Get statistics for the professor dashboard
router.get('/prof', protect, isProfessor, getProfDashboardStats);

// Get statistics for the student dashboard
router.get('/student', protect, getStudentDashboardStats);

export default router;
