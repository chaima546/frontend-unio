import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

/* ============================
   🔹 Middleware Protect
   Vérifie si l'utilisateur est authentifié
============================ */
export const protect = async (req, res, next) => {
  let token;

  // Vérifie l'en-tête Authorization ou le cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ code: 401, message: 'Not authorized, no token' });
  }

  try {
    // Décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Handle special admin fixed ID
    if (decoded.id === "admin-fixed-id") {
      req.user = {
        _id: "admin-fixed-id",
        email: "admin@admin.com",
        role: "admin",
        isAdmin: true,
        username: "Super Admin"
      };
      return next();
    }

    // Récupère l'utilisateur depuis la DB (token uses 'id' not 'userId')
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(404).json({ code: 404, message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error("Protect middleware error:", error);
    res.status(401).json({ code: 401, message: 'Not authorized, token failed' });
  }
};

/* ============================
   🔹 Middleware Admin
   Vérifie si l'utilisateur est admin
============================ */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ code: 403, message: 'Access denied: you must be an admin' });
  }
};

/* ============================
   🔹 Middleware Professor
   Vérifie si l'utilisateur est professeur
============================ */
export const isProfessor = (req, res, next) => {
  if (req.user && req.user.role === 'prof') {
    next();
  } else {
    res.status(403).json({ code: 403, message: 'Access denied: you must be a professor' });
  }
};

/* ============================
   🔹 Fonction generateToken
   Génère un JWT et le stocke dans un cookie
============================ */
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

  // Stocke le token dans un cookie sécurisé
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
  });

  return token;
};

export default generateToken;
