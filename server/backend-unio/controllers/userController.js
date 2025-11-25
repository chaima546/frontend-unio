import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generateToken from "../utlis/createToken.js";

// ==========================================================
// 🔐 AUTHENTIFICATION
// ==========================================================

// 🧩 SIGNUP (inscription)
export const signupUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      niveauScolaire,
      section,
    } = req.body;

    // Vérification des champs requis
    if (!firstName || !lastName || !username || !email || !password)
      return res
        .status(400)
        .json({ code: 400, message: "Veuillez remplir tous les champs requis." });

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ code: 400, message: "Cet utilisateur existe déjà." });

    // Création d'un nouvel utilisateur
    const newUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
      role: role || "user",
      niveauScolaire: niveauScolaire || "1ère",
      section: section || (niveauScolaire === "1ère" ? null : "Sciences"),
    });

    // Génération du token JWT
    const token = generateToken(res, newUser._id);

    return res.status(201).json({
      code: 201,
      message: "Inscription réussie",
      token,
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        niveauScolaire: newUser.niveauScolaire,
        section: newUser.section,
      },
    });
  } catch (error) {
    console.error("Erreur signup:", error);
    res.status(500).json({ code: 500, message: "Erreur lors de l'inscription" });
  }
};

// 🧩 LOGIN (connexion)
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ code: 400, message: "Veuillez remplir tous les champs." });

  try {
    // Cas admin fixe
    const ADMIN_EMAIL = "admin@admin.com";
    const ADMIN_PASSWORD = "admin5566@";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: "admin-fixed-id", email: ADMIN_EMAIL, role: "admin", isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        code: 200,
        message: "Connexion réussie (admin)",
        token,
        user: {
          _id: "admin-fixed-id",
          username: "Super Admin",
          email: ADMIN_EMAIL,
          role: "admin",
          isAdmin: true,
        },
      });
    }

    // Cas utilisateur normal
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(404).json({ code: 404, message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ code: 400, message: "Mot de passe incorrect" });

    const token = generateToken(res, user._id);

    res.json({
      code: 200,
      message: "Connexion réussie",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        niveauScolaire: user.niveauScolaire,
        section: user.section,
      },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ code: 500, message: "Erreur serveur" });
  }
};

// 🧩 LOGOUT
export const logoutUser = (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ code: 200, message: "Déconnexion réussie" });
};

// ==========================================================
// 👤 USER MANAGEMENT
// ==========================================================

// 🧩 Mettre à jour le profil
export const updateProfile = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ code: 401, message: "Non autorisé" });

    const { firstName, lastName, username, email, niveauScolaire, section } =
      req.body;

    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ code: 404, message: "Utilisateur non trouvé" });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.niveauScolaire = niveauScolaire || user.niveauScolaire;
    user.section = section || user.section;

    await user.save();

    res.json({
      code: 200,
      message: "Profil mis à jour",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        niveauScolaire: user.niveauScolaire,
        section: user.section,
      },
    });
  } catch (error) {
    console.error("Erreur updateProfile:", error);
    res.status(500).json({ code: 500, message: "Erreur lors de la mise à jour du profil" });
  }
};

// 🧩 Modifier le mot de passe
export const updateSecurity = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user)
      return res.status(404).json({ code: 404, message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ code: 401, message: "Mot de passe actuel incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ code: 200, message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur updateSecurity:", error);
    res.status(500).json({ code: 500, message: "Erreur lors de la mise à jour du mot de passe" });
  }
};

// 🧩 Récupérer tous les utilisateurs (admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      code: 200,
      message: "Utilisateurs récupérés avec succès",
      users,
    });
  } catch (error) {
    console.error("Erreur getUsers:", error);
    res
      .status(500)
      .json({ code: 500, message: "Erreur lors du chargement des utilisateurs" });
  }
};

// 🧩 Récupérer un utilisateur par ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ code: 404, message: "Utilisateur non trouvé" });

    res.json({ code: 200, message: "Utilisateur récupéré", user });
  } catch (error) {
    console.error("Erreur getUserById:", error);
    res.status(500).json({ code: 500, message: "Erreur serveur" });
  }
};

// 🧩 Créer un utilisateur (admin)
export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      niveauScolaire,
      section,
    } = req.body;

    // Vérification des champs requis
    if (!firstName || !lastName || !username || !email || !password)
      return res
        .status(400)
        .json({ code: 400, message: "Veuillez remplir tous les champs requis." });

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ code: 400, message: "Cet utilisateur existe déjà." });

    // Création d'un nouvel utilisateur
    const userData = {
      firstName,
      lastName,
      username,
      email,
      password,
      role: role || "user",
    };

    // Add academic fields only for students
    if ((role || "user") === "user") {
      userData.niveauScolaire = niveauScolaire || "1ère";
      userData.section = (niveauScolaire || "1ère") === "1ère" ? null : (section || "Sciences");
    }

    const newUser = await User.create(userData);

    res.status(201).json({
      code: 201,
      message: "Utilisateur créé avec succès",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        niveauScolaire: newUser.niveauScolaire,
        section: newUser.section,
      },
    });
  } catch (error) {
    console.error("Erreur createUser:", error);
    res.status(500).json({ code: 500, message: "Erreur lors de la création de l'utilisateur" });
  }
};

// 🧩 Mettre à jour un utilisateur (admin)
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, role, niveauScolaire, section } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ code: 404, message: "Utilisateur non trouvé" });

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ code: 400, message: "Cet email est déjà utilisé" });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    
    // Update academic fields based on role
    const finalRole = role || user.role;
    if (finalRole === "user") {
      // Only students have academic fields
      if (niveauScolaire !== undefined) user.niveauScolaire = niveauScolaire;
      if (section !== undefined) user.section = section;
    } else {
      // Clear academic fields for professors and admins
      user.niveauScolaire = "1ère";
      user.section = null;
    }

    await user.save();

    res.json({
      code: 200,
      message: "Utilisateur mis à jour avec succès",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        niveauScolaire: user.niveauScolaire,
        section: user.section,
      },
    });
  } catch (error) {
    console.error("Erreur updateUser:", error);
    res.status(500).json({ code: 500, message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
};

// 🧩 Supprimer un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ code: 404, message: "Utilisateur non trouvé" });

    await user.deleteOne();
    res.json({ code: 200, message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur deleteUser:", error);
    res.status(500).json({ code: 500, message: "Erreur lors de la suppression de l'utilisateur" });
  }
};

// 🧩 Préférences utilisateur (placeholder)
export const updatePreferences = async (req, res) => {
  res.json({
    code: 200,
    message: "Fonctionnalité de préférences désactivée pour le moment.",
  });
};
