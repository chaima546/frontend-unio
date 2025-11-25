import Calendrier from "../models/CalendrierModel.js";

// 🔹 Créer un événement (Admin ou Prof)
export const createEvent = async (req, res) => {
  try {
    if (!req.user.isAdmin && req.user.role !== "prof") {
      return res.status(403).json({ code: 403, message: "Admin or Professor only" });
    }

    const { titre, debut, fin, description, type, courseId } = req.body;
    
    if (!titre || !debut) {
      return res.status(400).json({ code: 400, message: "Titre et debut requis" });
    }

    const event = await Calendrier.create({ 
      titre, 
      debut, 
      fin, 
      description, 
      type: type || 'personnel',
      courseId,
      proprietaire: req.user._id 
    });
    
    const populatedEvent = await Calendrier.findById(event._id)
      .populate("proprietaire", "username firstName lastName")
      .populate("courseId", "name");
      
    res.status(201).json({ code: 201, message: "Événement créé", calendrier: populatedEvent });
  } catch (err) {
    console.error('❌ Error creating event:', err);
    res.status(500).json({ code: 500, message: "Erreur création événement", error: err.message });
  }
};

// 🔹 Récupérer tous les événements
export const getAllEvents = async (req, res) => {
  try {
    console.log('📅 Fetching all events...');
    
    // First, get events without populate to see if query works
    const eventsCount = await Calendrier.countDocuments();
    console.log('📊 Total events in database:', eventsCount);
    
    const events = await Calendrier.find()
      .populate({
        path: "proprietaire",
        select: "username firstName lastName email",
        strictPopulate: false
      })
      .populate({
        path: "courseId",
        select: "name",
        strictPopulate: false
      })
      .sort({ debut: -1 })
      .lean();
    
    console.log('✅ Successfully fetched', events.length, 'events');
    res.json({ code: 200, message: "Événements récupérés", calendriers: events });
  } catch (err) {
    console.error('❌ Error getting events:', err);
    console.error('❌ Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ code: 500, message: "Erreur récupération événements", error: err.message });
  }
};

// 🔹 Récupérer un événement par ID
export const getEventById = async (req, res) => {
  try {
    const event = await Calendrier.findById(req.params.id)
      .populate("proprietaire", "username firstName lastName email")
      .populate("courseId", "name");
      
    if (!event) {
      return res.status(404).json({ code: 404, message: "Événement non trouvé" });
    }
    
    res.json({ code: 200, message: "Événement récupéré", calendrier: event });
  } catch (err) {
    console.error('❌ Error getting event:', err);
    res.status(500).json({ code: 500, message: "Erreur récupération événement", error: err.message });
  }
};

// 🔹 Mettre à jour un événement
export const updateEvent = async (req, res) => {
  try {
    const event = await Calendrier.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ code: 404, message: "Événement non trouvé" });
    }

    const isAdmin = req.user.isAdmin || req.user.role === 'admin';
    const isProf = req.user.role === 'prof';
    const isOwner = event.proprietaire.equals(req.user._id);

    if (!isAdmin && !isProf && !isOwner) {
      return res.status(403).json({ code: 403, message: "Accès refusé" });
    }

    const { titre, debut, fin, description, type, courseId } = req.body;
    
    if (titre) event.titre = titre;
    if (debut) event.debut = debut;
    if (fin !== undefined) event.fin = fin;
    if (description !== undefined) event.description = description;
    if (type) event.type = type;
    if (courseId !== undefined) event.courseId = courseId;

    await event.save();
    
    const updatedEvent = await Calendrier.findById(event._id)
      .populate("proprietaire", "username firstName lastName email")
      .populate("courseId", "name");
    
    res.json({ code: 200, message: "Événement mis à jour", calendrier: updatedEvent });
  } catch (err) {
    console.error('❌ Error updating event:', err);
    res.status(500).json({ code: 500, message: "Erreur mise à jour événement", error: err.message });
  }
};

// 🔹 Supprimer un événement (Admin ou Prof ou créateur)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Calendrier.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ code: 404, message: "Événement non trouvé" });
    }

    const isAdmin = req.user.isAdmin || req.user.role === 'admin';
    const isProf = req.user.role === 'prof';
    const isOwner = event.proprietaire.equals(req.user._id);

    if (!isAdmin && !isProf && !isOwner) {
      return res.status(403).json({ code: 403, message: "Accès refusé" });
    }

    await event.deleteOne();
    res.json({ code: 200, message: "Événement supprimé" });
  } catch (err) {
    console.error('❌ Error deleting event:', err);
    res.status(500).json({ code: 500, message: "Erreur suppression événement", error: err.message });
  }
};
