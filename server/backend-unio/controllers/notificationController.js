import Notification from "../models/NotificationModel.js";
import User from "../models/UserModel.js";

// 🔹 Créer une notification (Admin ou Prof)
export const createNotification = async (req, res) => {
  if (!req.user.isAdmin && req.user.role !== "prof")
    return res.status(403).json({ code: 403, message: "Admin or Professor only" });

  const { title, link, relatedCourse, type, recipients } = req.body;
  
  if (!title || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ code: 400, message: "Title and recipients array required" });
  }

  try {
    // Create a notification for each recipient
    const notifications = await Promise.all(
      recipients.map(recipientId => 
        Notification.create({
          title,
          link: link || '',
          relatedCourse: relatedCourse || null,
          type: type || 'general',
          sender: req.user._id,
          recipient: recipientId,
          isRead: false
        })
      )
    );

    const populatedNotifications = await Notification.find({
      _id: { $in: notifications.map(n => n._id) }
    })
    .populate("sender", "firstName lastName email role")
    .populate("recipient", "firstName lastName email")
    .populate("relatedCourse", "name");

    res.status(201).json({ 
      code: 201, 
      message: `${notifications.length} notification(s) created`, 
      notifications: populatedNotifications 
    });
  } catch (err) {
    console.error('Error creating notifications:', err);
    res.status(500).json({ code: 500, message: "Erreur création notification", error: err.message });
  }
};

// 🔹 Récupérer toutes les notifications
export const getAllNotifications = async (req, res) => {
  try {
    let notifications;
    
    if (req.user.isAdmin || req.user.role === 'admin') {
      // Admin sees all notifications
      notifications = await Notification.find()
        .populate("sender", "firstName lastName email role")
        .populate("recipient", "firstName lastName email")
        .populate("relatedCourse", "name")
        .sort({ createdAt: -1 });
    } else {
      // Users see their own notifications
      notifications = await Notification.find({ recipient: req.user._id })
        .populate("sender", "firstName lastName email role")
        .populate("relatedCourse", "name")
        .sort({ createdAt: -1 });
    }

    res.json({ code: 200, message: "Notifications récupérées", notifications });
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({ code: 500, message: "Erreur récupération notifications", error: err.message });
  }
};

// 🔹 Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ code: 404, message: "Notification non trouvée" });
    }

    // Only the recipient or admin can mark as read
    if (!req.user.isAdmin && !notification.recipient.equals(req.user._id)) {
      return res.status(403).json({ code: 403, message: "Accès refusé" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ code: 200, message: "Notification marked as read", notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ code: 500, message: "Erreur mise à jour notification", error: err.message });
  }
};

// 🔹 Supprimer une notification (Admin/Prof ou propriétaire)
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ code: 404, message: "Notification non trouvée" });

    const isAdmin = req.user.isAdmin || req.user.role === 'admin';
    const isSender = notification.sender && notification.sender.equals(req.user._id);
    const isRecipient = notification.recipient.equals(req.user._id);

    if (!isAdmin && !isSender && !isRecipient) {
      return res.status(403).json({ code: 403, message: "Accès refusé" });
    }

    await notification.deleteOne();
    res.json({ code: 200, message: "Notification supprimée" });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ code: 500, message: "Erreur suppression notification", error: err.message });
  }
};
