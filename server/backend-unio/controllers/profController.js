import User from "../models/UserModel.js";

// ✅ Inscription professeur
export const registerProf = async (req, res) => {
  try {
    const { firstName, lastName, email, password, speciality } = req.body;

    if (!firstName || !lastName || !email || !password || !speciality) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs" });
    }

    // Le username est calculé côté serveur
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`; 

    // Vérifier si email déjà utilisé
    const existingProf = await User.findOne({ email });
    if (existingProf) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    const newProf = new User({
      firstName,
      lastName,
      username,
      email,
      password, // Le hachage est géré par le middleware 'pre save' du modèle
      role: "prof",
      speciality,
    });

    await newProf.save();
    
    // Génère le token APRES l'enregistrement
    const token = newProf.generateJWT(); 

    res.status(201).json({
      message: "Professeur créé avec succès ✅",
      token,
      user: {
        id: newProf._id,
        firstName: newProf.firstName,
        lastName: newProf.lastName,
        email: newProf.email,
        role: newProf.role,
        speciality: newProf.speciality,
      },
    });
  } catch (error) {
    // Meilleure gestion des erreurs si le save échoue pour des raisons Mongoose
    if (error.code === 11000) { // Code pour l'erreur de duplication (email)
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// ✅ Connexion professeur
export const authProf = async (req, res) => {
  try {
    const { email, password } = req.body;

    const prof = await User.findOne({ email, role: 'prof' }).select("+password");

    if (!prof) {
      return res.status(400).json({ message: "Professeur introuvable" });
    }

    const isMatch = await prof.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = prof.generateJWT();

    res.json({
      message: "Connexion réussie ✅",
      token,
      user: {
        id: prof._id,
        firstName: prof.firstName,
        lastName: prof.lastName,
        email: prof.email,
        role: prof.role,
        speciality: prof.speciality,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Liste des professeurs
export const getProfs = async (req, res) => {
  try {
    const profs = await User.find({ role: "prof" });
    res.json(profs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Professeur par ID
export const getProfById = async (req, res) => {
  try {
    const prof = await User.findOne({ _id: req.params.id, role: 'prof' });
    if (!prof) return res.status(404).json({ code: 404, message: "User not found" });
    res.json(prof);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Update prof
export const updateProf = async (req, res) => {
  try {
    const prof = await User.findOne({ _id: req.params.id, role: 'prof' });
    if (!prof) return res.status(404).json({ code: 404, message: "User not found" });
    
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Delete prof
export const deleteProf = async (req, res) => {
  try {
    const prof = await User.findOne({ _id: req.params.id, role: 'prof' });
    if (!prof) return res.status(404).json({ code: 404, message: "User not found" });
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Professeur supprimé ✅" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
