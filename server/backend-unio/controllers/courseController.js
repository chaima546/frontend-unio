import Course from '../models/CourseModel.js';

// 🔹 Créer un cours (Admin ou Prof)
export const createCourse = async (req, res) => {
  if (!req.user?.isAdmin && req.user.role !== "prof")
    return res.status(403).json({ code: 403, message: "Access denied" });

  const { name, teacher, students, description, progress, nextLesson } = req.body;

  if (!name || !teacher)
    return res.status(400).json({ code: 400, message: "Champs obligatoires manquants" });

  try {
    const course = await Course.create({
      name,
      teacher,
      students: students || [],
      description: description || "",
      progress: progress || 0,
      nextLesson: nextLesson || ""
    });

    res.status(201).json({ code: 201, message: "Cours créé", course });
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ code: 500, message: "Erreur création cours", error: err.message });
  }
};

// 🔹 Récupérer tous les cours (filtrés selon rôle) - C'EST getCourses
export const getCourses = async (req, res) => {
  try {
    let courses;
    if (req.user.role === "admin" || req.user.isAdmin) {
      // Admin sees all courses
      courses = await Course.find().populate("teacher students");
    } else if (req.user.role === "prof") {
      // Professor sees their courses
      courses = await Course.find({ teacher: req.user._id }).populate("teacher students");
    } else {
      // Student sees courses they're enrolled in
      courses = await Course.find({ students: req.user._id }).populate("teacher students");
    }
    res.json({ code: 200, message: "Cours récupérés", courses });
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ code: 500, message: "Erreur récupération cours", error: err.message });
  }
};

// 🔹 Récupérer un cours par ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("teacher students");
    if (!course) return res.status(404).json({ code: 404, message: "Cours non trouvé" });

    // Check access permissions
    const isAdmin = req.user.role === "admin" || req.user.isAdmin;
    const isTeacher = req.user.role === "prof" && course.teacher.toString() === req.user._id.toString();
    const isStudent = course.students.some(student => student._id.toString() === req.user._id.toString());

    if (!isAdmin && !isTeacher && !isStudent) {
      return res.status(403).json({ code: 403, message: "Accès refusé" });
    }

    res.json({ code: 200, message: "Cours récupéré", course });
  } catch (err) {
    console.error('Error fetching course by ID:', err);
    res.status(500).json({ code: 500, message: "Erreur récupération cours", error: err.message });
  }
};

// 🔹 Mettre à jour un cours (Admin ou Prof)
export const updateCourse = async (req, res) => {
  const isAdmin = req.user?.role === "admin" || req.user?.isAdmin;
  const isProf = req.user?.role === "prof";
  
  if (!isAdmin && !isProf)
    return res.status(403).json({ code: 403, message: "Access denied" });

  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ code: 404, message: "Cours non trouvé" });

    // Only the teacher or admin can update
    if (isProf && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ code: 403, message: "Accès refusé" });
    }

    Object.assign(course, req.body);
    await course.save();

    res.json({ code: 200, message: "Cours mis à jour", course });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ code: 500, message: "Erreur mise à jour cours", error: err.message });
  }
};

// 🔹 Supprimer un cours (Admin ou Prof)
export const deleteCourse = async (req, res) => {
  const isAdmin = req.user?.role === "admin" || req.user?.isAdmin;
  const isProf = req.user?.role === "prof";
  
  if (!isAdmin && !isProf)
    return res.status(403).json({ code: 403, message: "Access denied" });

  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ code: 404, message: "Cours non trouvé" });

    // Only the teacher or admin can delete
    if (isProf && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ code: 403, message: "Accès refusé" });
    }

    await course.deleteOne();
    res.json({ code: 200, message: "Cours supprimé" });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Erreur suppression cours" });
  }
};

// 🔹 Assign students to a course (Prof or Admin)
export const assignStudentsToCourse = async (req, res) => {
  const isAdmin = req.user?.role === "admin" || req.user?.isAdmin;
  const isProf = req.user?.role === "prof";
  
  if (!isAdmin && !isProf)
    return res.status(403).json({ code: 403, message: "Access denied" });

  const { studentIds } = req.body;
  
  if (!studentIds || !Array.isArray(studentIds)) {
    return res.status(400).json({ code: 400, message: "studentIds array is required" });
  }

  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ code: 404, message: "Cours non trouvé" });

    // Only the teacher or admin can assign students
    if (isProf && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ code: 403, message: "Accès refusé" });
    }

    // Add new students to the course (avoid duplicates)
    studentIds.forEach(studentId => {
      if (!course.students.includes(studentId)) {
        course.students.push(studentId);
      }
    });

    await course.save();
    await course.populate("teacher students");

    res.json({ code: 200, message: "Étudiants assignés au cours", course });
  } catch (err) {
    console.error('Error assigning students:', err);
    res.status(500).json({ code: 500, message: "Erreur assignation étudiants", error: err.message });
  }
};

// 🔹 Remove students from a course (Prof or Admin)
export const removeStudentsFromCourse = async (req, res) => {
  const isAdmin = req.user?.role === "admin" || req.user?.isAdmin;
  const isProf = req.user?.role === "prof";
  
  if (!isAdmin && !isProf)
    return res.status(403).json({ code: 403, message: "Access denied" });

  const { studentIds } = req.body;
  
  if (!studentIds || !Array.isArray(studentIds)) {
    return res.status(400).json({ code: 400, message: "studentIds array is required" });
  }

  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ code: 404, message: "Cours non trouvé" });

    // Only the teacher or admin can remove students
    if (isProf && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ code: 403, message: "Accès refusé" });
    }

    // Remove students from the course
    course.students = course.students.filter(
      studentId => !studentIds.includes(studentId.toString())
    );

    await course.save();
    await course.populate("teacher students");

    res.json({ code: 200, message: "Étudiants retirés du cours", course });
  } catch (err) {
    console.error('Error removing students:', err);
    res.status(500).json({ code: 500, message: "Erreur retrait étudiants", error: err.message });
  }
};