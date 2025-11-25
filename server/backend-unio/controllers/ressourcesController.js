import Ressource from "../models/RessourcesModel.js";
import Course from "../models/CourseModel.js";

// 🔹 Créer/ajouter une ressource (Prof ou Admin)
export const createRessource = async (req, res) => {
  if (!req.user.isAdmin && req.user.role !== "prof")
    return res.status(403).json({ code: 403, message: "Admin or Professor only" });

  const { titre, description, type, url, courseId } = req.body;
  
  if (!titre || !url) {
    return res.status(400).json({ code: 400, message: "Titre et url requis" });
  }

  try {
    const ressourceData = {
      titre,
      description: description || "",
      type: type || "file",
      url,
      courseId: courseId || null
    };

    // Set uploadedByProf if user is a professor
    if (req.user.role === "prof") {
      ressourceData.uploadedByProf = req.user._id;
    } else {
      ressourceData.uploadedByUser = req.user._id;
    }

    const ressource = await Ressource.create(ressourceData);

    const populatedRessource = await Ressource.findById(ressource._id)
      .populate("courseId", "name")
      .populate("uploadedByProf", "firstName lastName email")
      .populate("uploadedByUser", "firstName lastName email");

    res.status(201).json({ 
      code: 201, 
      message: "Ressource ajoutée", 
      ressource: populatedRessource 
    });
  } catch (err) {
    console.error('Error creating resource:', err);
    res.status(500).json({ code: 500, message: "Erreur création ressource", error: err.message });
  }
};

// 🔹 Récupérer toutes les ressources
export const getAllRessources = async (req, res) => {
  try {
    let ressources;
    
    if (req.user.isAdmin || req.user.role === "admin") {
      // Admin sees all resources
      ressources = await Ressource.find()
        .populate("courseId", "name")
        .populate("uploadedByProf", "firstName lastName email")
        .populate("uploadedByUser", "firstName lastName email")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "prof") {
      // Professor sees their own resources
      ressources = await Ressource.find({ uploadedByProf: req.user._id })
        .populate("courseId", "name")
        .populate("uploadedByProf", "firstName lastName email")
        .sort({ createdAt: -1 });
    } else {
      // Student sees resources for their enrolled courses
      const courses = await Course.find({ students: req.user._id }).select('_id');
      const courseIds = courses.map(c => c._id);
      
      ressources = await Ressource.find({ 
        courseId: { $in: courseIds } 
      })
      .populate("courseId", "name")
      .populate("uploadedByProf", "firstName lastName email")
      .populate("uploadedByUser", "firstName lastName email")
      .sort({ createdAt: -1 });
    }
    
    res.json({ code: 200, message: "Ressources récupérées", ressources });
  } catch (err) {
    console.error('Error getting resources:', err);
    res.status(500).json({ code: 500, message: "Erreur récupération ressources", error: err.message });
  }
};

// 🔹 Récupérer une ressource par ID
export const getRessourceById = async (req, res) => {
  try {
    const ressource = await Ressource.findById(req.params.id)
      .populate("courseId", "name")
      .populate("uploadedByProf", "firstName lastName email")
      .populate("uploadedByUser", "firstName lastName email");
      
    if (!ressource) {
      return res.status(404).json({ code: 404, message: "Ressource non trouvée" });
    }

    // Check access permissions
    const isAdmin = req.user.isAdmin || req.user.role === 'admin';
    const isProf = req.user.role === 'prof';
    const isOwner = (ressource.uploadedByProf && ressource.uploadedByProf._id.equals(req.user._id)) ||
                    (ressource.uploadedByUser && ressource.uploadedByUser._id.equals(req.user._id));

    if (!isAdmin && !isProf && !isOwner) {
      // Check if student is enrolled in the course
      if (ressource.courseId) {
        const course = await Course.findById(ressource.courseId);
        if (!course || !course.students.some(s => s.equals(req.user._id))) {
          return res.status(403).json({ code: 403, message: "Accès refusé" });
        }
      } else {
        return res.status(403).json({ code: 403, message: "Accès refusé" });
      }
    }

    res.json({ code: 200, message: "Ressource récupérée", ressource });
  } catch (err) {
    console.error('Error getting resource by ID:', err);
    res.status(500).json({ code: 500, message: "Erreur récupération ressource", error: err.message });
  }
};

// 🔹 Mettre à jour une ressource (Prof ou Admin)
export const updateRessource = async (req, res) => {
  const isAdmin = req.user.isAdmin || req.user.role === 'admin';
  const isProf = req.user.role === 'prof';
  
  if (!isAdmin && !isProf) {
    return res.status(403).json({ code: 403, message: "Admin or Professor only" });
  }

  try {
    const ressource = await Ressource.findById(req.params.id);
    if (!ressource) {
      return res.status(404).json({ code: 404, message: "Ressource non trouvée" });
    }

    // Professor can only update their own resources
    if (isProf && !isAdmin) {
      if (!ressource.uploadedByProf || !ressource.uploadedByProf.equals(req.user._id)) {
        return res.status(403).json({ code: 403, message: "You can only update your own resources" });
      }
    }

    const { titre, description, type, url, courseId } = req.body;
    
    if (titre !== undefined) ressource.titre = titre;
    if (description !== undefined) ressource.description = description;
    if (type !== undefined) ressource.type = type;
    if (url !== undefined) ressource.url = url;
    if (courseId !== undefined) ressource.courseId = courseId;

    await ressource.save();

    const updatedRessource = await Ressource.findById(ressource._id)
      .populate("courseId", "name")
      .populate("uploadedByProf", "firstName lastName email")
      .populate("uploadedByUser", "firstName lastName email");

    res.json({ code: 200, message: "Ressource mise à jour", ressource: updatedRessource });
  } catch (err) {
    console.error('Error updating resource:', err);
    res.status(500).json({ code: 500, message: "Erreur mise à jour ressource", error: err.message });
  }
};

// 🔹 Supprimer une ressource (Prof ou Admin)
export const deleteRessource = async (req, res) => {
  const isAdmin = req.user.isAdmin || req.user.role === 'admin';
  const isProf = req.user.role === 'prof';
  
  if (!isAdmin && !isProf) {
    return res.status(403).json({ code: 403, message: "Admin or Professor only" });
  }

  try {
    const ressource = await Ressource.findById(req.params.id);
    if (!ressource) {
      return res.status(404).json({ code: 404, message: "Ressource non trouvée" });
    }

    // Professor can only delete their own resources
    if (isProf && !isAdmin) {
      if (!ressource.uploadedByProf || !ressource.uploadedByProf.equals(req.user._id)) {
        return res.status(403).json({ code: 403, message: "You can only delete your own resources" });
      }
    }

    await ressource.deleteOne();
    res.json({ code: 200, message: "Ressource supprimée" });
  } catch (err) {
    console.error('Error deleting resource:', err);
    res.status(500).json({ code: 500, message: "Erreur suppression ressource", error: err.message });
  }
};
