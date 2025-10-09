import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
// 👈 Importation de la librairie de stockage
import AsyncStorage from '@react-native-async-storage/async-storage'; 
// 👈 Importation des fonctions API (assurez-vous que le chemin est correct)
import { loginUserApi, registerUserApi } from '../services/api'; 

// Création du Contexte pour y stocker les données de session
const AuthContext = createContext();

// Clés utilisées pour stocker les données dans AsyncStorage
const TOKEN_KEY = 'unistudious_user_token';
const USER_KEY = 'unistudious_user_data';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 

  // 1. Chargement initial : Vérifie s'il y a un token sauvegardé au lancement de l'app
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erreur de chargement du stockage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []); // Exécuté une seule fois au montage

  // 2. Fonction de connexion
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const apiData = await loginUserApi(email, password); 
      
      const newToken = apiData.token;
      const newUser = apiData.user; 
      
      // Sauvegarde du Token et des infos utilisateur
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);

      Alert.alert("Succès", `Bienvenue, ${newUser.username} !`);
      return true;

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec de la connexion.";
      Alert.alert("Erreur d'Authentification", errorMessage);
      console.error("Erreur login:", error.response || error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Fonction d'inscription 
  const register = async (userData) => {
    setIsLoading(true);
    try {
        // La fonction registerUserApi doit aussi retourner un token pour connecter directement
        const apiData = await registerUserApi(userData); 
        
        const newToken = apiData.token;
        const newUser = apiData.user; 
        
        // Sauvegarde du Token et des infos utilisateur
        await AsyncStorage.setItem(TOKEN_KEY, newToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);

        Alert.alert("Succès", `Compte créé et connexion réussie, ${newUser.username} !`);
        return true;

    } catch (error) {
        const errorMessage = error.response?.data?.message || "Échec de l'inscription.";
        Alert.alert("Erreur d'Inscription", errorMessage);
        console.error("Erreur register:", error.response || error.message);
        return false;
    } finally {
        setIsLoading(false);
    }
  };

  // 4. Fonction de déconnexion
  const logout = async () => {
    setIsLoading(true);
    try {
      // Suppression du Token et des infos de l'appareil
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Le fournisseur de contexte expose les données et les fonctions
  return (
    <AuthContext.Provider 
        value={{ 
            user, 
            token, 
            isLoading, 
            login, 
            logout, 
            register, 
            isAuthenticated: !!token // TRUE si token existe, FALSE sinon
        }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte facilement dans les composants
export const useAuth = () => useContext(AuthContext);
