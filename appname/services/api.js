// Votre fichier api.js (Complete CRUD Operations)

import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL
const API_URL = "http://192.168.100.215:2001/api"; 

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('unistudious_user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== AUTHENTICATION =====

// Login for Students and Admins
export const loginUserApi = async (email, password) => {
  const res = await api.post(`/users/login`, { email, password });
  return res.data;
};

// Login for Professors
export const loginProfApi = async (email, password) => {
  const res = await api.post(`/profs/login`, { email, password });
  return res.data;
};

// Register User (Student)
export const registerUserApi = async (firstName, lastName, username, email, password, role, niveauScolaire, section) => {
  const res = await api.post(`/users/register`, { 
    firstName,
    lastName,
    username, 
    email, 
    password, 
    role, 
    niveauScolaire, 
    section 
  });
  return res.data;
};

// Register Professor
export const registerProfApi = async (firstName, lastName, username, email, password, department, speciality, bio) => {
  const res = await api.post(`/profs`, { 
    firstName,
    lastName,
    username, 
    email, 
    password,
    department,
    speciality,
    bio
  });
  return res.data;
};

// Logout
export const logoutApi = async () => {
  const res = await api.get(`/users/logout`);
  return res.data;
};

// ===== USER MANAGEMENT =====

// Get user profile
export const getProfile = async () => {
  const res = await api.get(`/users/me`);
  return res.data;
};

// Update user profile
export const updateProfileApi = async (userData) => {
  const res = await api.put(`/users/profile`, userData);
  return res.data;
};

// Update preferences
export const updatePreferencesApi = async (preferences) => {
  const res = await api.put(`/users/preferences`, preferences);
  return res.data;
};

// Update security
export const updateSecurityApi = async (securityData) => {
  const res = await api.put(`/users/security`, securityData);
  return res.data;
};

// Get all users (Admin only)
export const getAllUsersApi = async () => {
  const res = await api.get(`/users`);
  return res.data;
};

// Get user by ID (Admin only)
export const getUserByIdApi = async (userId) => {
  const res = await api.get(`/users/${userId}`);
  return res.data;
};

// Create user (Admin only)
export const createUserApi = async (userData) => {
  const res = await api.post(`/users/create`, userData);
  return res.data;
};

// Update user (Admin only)
export const updateUserApi = async (userId, userData) => {
  const res = await api.put(`/users/${userId}`, userData);
  return res.data;
};

// Delete user (Admin only)
export const deleteUserApi = async (userId) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};

// ===== PROFESSOR MANAGEMENT =====

// Get all professors
export const getAllProfsApi = async () => {
  const res = await api.get(`/profs`);
  return res.data;
};

// Get professor by ID
export const getProfByIdApi = async (profId) => {
  const res = await api.get(`/profs/${profId}`);
  return res.data;
};

// Update professor
export const updateProfApi = async (profId, profData) => {
  const res = await api.put(`/profs/${profId}`, profData);
  return res.data;
};

// Delete professor
export const deleteProfApi = async (profId) => {
  const res = await api.delete(`/profs/${profId}`);
  return res.data;
};

// ===== COURSE MANAGEMENT =====

// Get all courses (based on role)
export const getAllCoursesApi = async () => {
  const res = await api.get(`/courses`);
  return res.data;
};

// Get my courses
export const getMyCoursesApi = async () => {
  const res = await api.get(`/courses/my-courses`);
  return res.data;
};

// Get course by ID
export const getCourseByIdApi = async (courseId) => {
  const res = await api.get(`/courses/${courseId}`);
  return res.data;
};

// Create course (Admin only - uses /admin route)
export const createCourseApi = async (courseData) => {
  const res = await api.post(`/courses/admin`, courseData);
  return res.data;
};

// Update course (Prof/Admin)
export const updateCourseApi = async (courseId, courseData) => {
  const res = await api.put(`/courses/${courseId}`, courseData);
  return res.data;
};

// Delete course (Prof/Admin)
export const deleteCourseApi = async (courseId) => {
  const res = await api.delete(`/courses/${courseId}`);
  return res.data;
};

// Assign students to course (Prof/Admin)
export const assignStudentsToCourseApi = async (courseId, studentIds) => {
  const res = await api.post(`/courses/${courseId}/assign-students`, { studentIds });
  return res.data;
};

// Remove students from course (Prof/Admin)
export const removeStudentsFromCourseApi = async (courseId, studentIds) => {
  const res = await api.post(`/courses/${courseId}/remove-students`, { studentIds });
  return res.data;
};

// ===== RESOURCE MANAGEMENT =====

// Get all resources
export const getAllResourcesApi = async () => {
  const res = await api.get(`/ressources`);
  return res.data;
};

// Get resource by ID
export const getResourceByIdApi = async (resourceId) => {
  const res = await api.get(`/ressources/${resourceId}`);
  return res.data;
};

// Create resource (Prof/Admin)
export const createResourceApi = async (resourceData) => {
  const res = await api.post(`/ressources`, resourceData);
  return res.data;
};

// Update resource (Prof/Admin)
export const updateResourceApi = async (resourceId, resourceData) => {
  const res = await api.put(`/ressources/${resourceId}`, resourceData);
  return res.data;
};

// Delete resource (Prof/Admin)
export const deleteResourceApi = async (resourceId) => {
  const res = await api.delete(`/ressources/${resourceId}`);
  return res.data;
};

// ===== CALENDAR/EVENT MANAGEMENT =====

// Get all events
export const getAllEventsApi = async () => {
  const res = await api.get(`/calendrier`);
  return res.data;
};

// Get event by ID
export const getEventByIdApi = async (eventId) => {
  const res = await api.get(`/calendrier/${eventId}`);
  return res.data;
};

// Create event (Prof/Admin)
export const createEventApi = async (eventData) => {
  const res = await api.post(`/calendrier`, eventData);
  return res.data;
};

// Update event (Prof/Admin or creator)
export const updateEventApi = async (eventId, eventData) => {
  const res = await api.put(`/calendrier/${eventId}`, eventData);
  return res.data;
};

// Delete event (Prof/Admin or creator)
export const deleteEventApi = async (eventId) => {
  const res = await api.delete(`/calendrier/${eventId}`);
  return res.data;
};

// ===== NOTIFICATION MANAGEMENT =====

// Get all notifications (user gets their own)
export const getAllNotificationsApi = async () => {
  const res = await api.get(`/notifications`);
  return res.data;
};

// Create notification (Prof/Admin)
export const createNotificationApi = async (notificationData) => {
  const res = await api.post(`/notifications`, notificationData);
  return res.data;
};

// Delete notification (Prof/Admin or owner)
export const deleteNotificationApi = async (notificationId) => {
  const res = await api.delete(`/notifications/${notificationId}`);
  return res.data;
};

// Mark notification as read
export const markNotificationAsReadApi = async (notificationId) => {
  const res = await api.put(`/notifications/${notificationId}/read`);
  return res.data;
};

// ===== DASHBOARD =====

// Get admin dashboard data
export const getAdminDashboardApi = async () => {
  const res = await api.get(`/dashboard/admin`);
  return res.data;
};

// Get professor dashboard data
export const getProfDashboardApi = async () => {
  const res = await api.get(`/dashboard/prof`);
  return res.data;
};

// Get recent activity for admin
export const getRecentActivityApi = async (limit = 10) => {
  const res = await api.get(`/dashboard/activity?limit=${limit}`);
  return res.data;
};

// Export api instance for custom requests
export default api;
