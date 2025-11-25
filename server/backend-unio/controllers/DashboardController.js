// controllers/DashboardController.js
import Course from "../models/CourseModel.js";
import Ressource from "../models/RessourcesModel.js";
import Notification from "../models/NotificationModel.js";
import User from "../models/UserModel.js";
import Calendrier from "../models/CalendrierModel.js";

// Admin Dashboard - GET /api/dashboard/admin
export const getAdminDashboard = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const courses = await Course.find().populate("teacher students");
    const ressources = await Ressource.find().populate("uploadedByProf");
    const notifications = await Notification.find();

    // Calculate stats
    const stats = {
      totalUsers: users.length,
      totalStudents: users.filter(u => u.role === 'user').length,
      totalProfessors: users.filter(u => u.role === 'prof').length,
      totalCourses: courses.length,
      totalResources: ressources.length,
      totalNotifications: notifications.length
    };

    res.json({
      code: 200,
      role: "admin",
      stats,
      users,
      courses,
      ressources,
      notifications,
      message: "Dashboard data for admin"
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ code: 500, message: "Server error" });
  }
};

// Professor Dashboard - GET /api/dashboard/prof
export const getProfDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== 'prof') {
      return res.status(403).json({ code: 403, message: "Access denied - Professors only" });
    }

    // Get professor's courses with populated students
    const myCourses = await Course.find({ teacher: user._id }).populate("students");
    
    // Get resources uploaded by this professor
    const myResources = await Ressource.find({ uploadedByProf: user._id });
    
    // Get notifications for this professor
    const myNotifications = await Notification.find({ recipient: user._id });

    // Calculate stats
    let totalStudents = 0;
    myCourses.forEach(course => {
      if (course.students && Array.isArray(course.students)) {
        totalStudents += course.students.length;
      }
    });

    const stats = {
      totalCourses: myCourses.length,
      totalStudents: totalStudents,
      totalResources: myResources.length,
      totalNotifications: myNotifications.length
    };

    res.json({
      code: 200,
      role: "prof",
      stats,
      courses: myCourses,
      resources: myResources,
      notifications: myNotifications,
      message: "Dashboard data for professor"
    });
  } catch (error) {
    console.error("Professor dashboard error:", error);
    res.status(500).json({ code: 500, message: "Server error" });
  }
};

// Get recent activity for admin dashboard
export const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Fetch recent items from different collections
    const [recentUsers, recentCourses, recentResources, recentEvents] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName role createdAt updatedAt'),
      Course.find().sort({ updatedAt: -1 }).limit(5).select('name createdAt updatedAt'),
      Ressource.find().sort({ createdAt: -1 }).limit(5).select('titre type createdAt').populate('uploadedByProf', 'firstName lastName'),
      Calendrier.find().sort({ createdAt: -1 }).limit(5).select('titre type createdAt')
    ]);

    // Combine and format activities
    const activities = [];

    // Add user activities
    recentUsers.forEach(user => {
      activities.push({
        type: 'user_created',
        title: `Nouvel utilisateur inscrit: ${user.firstName} ${user.lastName}`,
        subtitle: user.role === 'user' ? 'Étudiant' : user.role === 'prof' ? 'Professeur' : 'Admin',
        timestamp: user.createdAt,
        color: '#4CAF50',
        icon: 'person-add'
      });
    });

    // Add course activities
    recentCourses.forEach(course => {
      const isNew = course.createdAt.getTime() === course.updatedAt.getTime();
      activities.push({
        type: isNew ? 'course_created' : 'course_updated',
        title: isNew ? `Nouveau cours créé: ${course.name}` : `Cours modifié: ${course.name}`,
        subtitle: 'Cours',
        timestamp: course.updatedAt,
        color: '#2196F3',
        icon: isNew ? 'book' : 'create'
      });
    });

    // Add resource activities
    recentResources.forEach(resource => {
      const profName = resource.uploadedByProf 
        ? `${resource.uploadedByProf.firstName} ${resource.uploadedByProf.lastName}`
        : 'Professeur';
      activities.push({
        type: 'resource_added',
        title: `Nouvelle ressource: ${resource.titre}`,
        subtitle: `Ajoutée par ${profName}`,
        timestamp: resource.createdAt,
        color: '#FFA000',
        icon: 'document'
      });
    });

    // Add event activities
    recentEvents.forEach(event => {
      activities.push({
        type: 'event_created',
        title: `Événement créé: ${event.titre}`,
        subtitle: event.type || 'Événement',
        timestamp: event.createdAt,
        color: '#9C27B0',
        icon: 'calendar'
      });
    });

    // Sort by timestamp descending and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit);

    res.json({
      code: 200,
      activities: limitedActivities,
      total: limitedActivities.length
    });

  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ code: 500, message: "Erreur lors de la récupération de l'activité récente" });
  }
};
