// Votre fichier api.js (mis à jour)

import axios from "axios";

// 🚨 CORRECTION IMPORTANTE : Utilisez votre IP locale et le port de votre backend (5000)
// L'IP 172.20.10.2 a été trouvée via votre ipconfig.
const API_URL = "http://192.168.116.1:3000/api"; 

// Créez une instance Axios pour simplifier les appels sécurisés plus tard
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Authentification =====
// Utilisez les routes de votre backend : /users/login et /users/signup (basé sur le code que vous avez envoyé)
// Je suppose que votre routeur Express a un préfixe /users.

export const loginUserApi = async (email, password) => {
  const res = await api.post(`/users/login`, { email, password });
  return res.data;
};

// Modification pour inclure tous les champs requis par votre signup du backend (username, role, niveauScolaire, section)
export const registerUserApi = async (firstName, lastName,username, email, password, role, niveauScolaire, section) => {
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

// ... (Gardez les autres fonctions inchangées, mais utilisez l'instance 'api' si vous le souhaitez)
// Remplacement des fonctions existantes pour utiliser l'instance 'api' si elle existe.

export const getProfile = async (token) => {
  const res = await api.get(`/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// [Le reste des fonctions (getAcademies, getCourses, etc.) reste le même, mais utilise maintenant la bonne API_URL]

export default api;