import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
// Assurez-vous d'avoir une fonction 'loginUserApi' dans ce fichier
import { loginUserApi } from '../../services/api'; 
import { Ionicons } from '@expo/vector-icons';

const StudentLoginScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // État pour "Se souvenir de moi"
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Fonction de retour en arrière (généralement gérée par le navigateur)
  const goBack = () => {
      if (router.canGoBack()) {
          router.back();
      } else {
          // Fallback vers l'écran de bienvenue ou d'accueil si aucune page précédente
          router.replace('/WelcomeScreen'); 
      }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez entrer votre e-mail et mot de passe.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Appel API de connexion
      const data = await loginUserApi(email, password);

      // ÉTAPE FUTURE : Appeler la fonction login du AuthContext pour stocker le jeton
      
      Alert.alert("Succès", `Connexion réussie. Bienvenue, ${data.user.username} !`);
      
      // 2. Redirection vers l'écran principal (à protéger par AuthContext)
      router.replace('/(tabs)/home'); 

    } catch (error) {
      const errorMessage = error.response?.data?.message || "E-mail ou mot de passe incorrect. Veuillez réessayer.";
      Alert.alert("Échec de la connexion", errorMessage);
      console.error("Erreur de connexion:", error.response || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const goToSignUp = () => {
    router.replace('/(auth)/studentRegister'); 
  };
  
  const goToForgotPassword = () => {
    Alert.alert("Fonctionnalité future", "Redirection vers la récupération de mot de passe.");
  };

  const goToTeacherLogin = () => {
      // Redirection vers l'écran de connexion des professeurs
      Alert.alert("Accès spécial", "Redirection vers l'espace Professeur.");
      // router.push('/(auth)/teacherLogin');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} disabled={isLoading} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connexion</Text>
      </View>
      
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Bienvenue ! Connectez-vous pour continuer</Text>

        {/* Champ E-mail avec icône */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none" 
            editable={!isLoading}
          />
        </View>
        
        {/* Champ Mot de passe avec icône et bouton de visibilité */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput 
            style={styles.passwordInput} 
            placeholder="Mot de passe" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry={!passwordVisible} 
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton} 
            onPress={() => setPasswordVisible(!passwordVisible)}
            disabled={isLoading}
          >
            <Ionicons 
              name={passwordVisible ? "eye-off-outline" : "eye-outline"} 
              size={24} 
              color="#5B43D5" 
            />
          </TouchableOpacity>
        </View>

        {/* Se souvenir de moi / Mot de passe oublié */}
        <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)} disabled={isLoading}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text style={styles.textBase}>Se souvenir de moi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={goToForgotPassword} disabled={isLoading}>
                <Text style={styles.linkText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
        </View>

        {/* Bouton de Connexion */}
        <TouchableOpacity 
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Se connecter</Text>
          )}
        </TouchableOpacity>
        
        {/* Section Accès spécial */}
        <Text style={styles.specialAccessText}>Accès spécial</Text>
        <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={goToTeacherLogin}
            disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Accès Professeur</Text>
        </TouchableOpacity>

        {/* Lien Inscription */}
        <View style={styles.linkContainer}>
          <Text style={styles.textBase}>Vous n avez pas de compte ? </Text>
          <TouchableOpacity onPress={goToSignUp} disabled={isLoading}>
            <Text style={styles.linkText}>S inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#FFFFFF' },
  // Header pour la flèche de retour et le titre "Connexion"
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50, // Ajustement pour la barre de statut
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
      paddingRight: 15,
  },
  headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#333',
  },
  
  container: { flex: 1, paddingHorizontal: 30, alignItems: 'center', paddingTop: 30 },
  welcomeText: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  
  // Conteneur d'entrée avec icône
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 55,
    backgroundColor: '#FFFFFF', // Fond blanc pour l'entrée
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#D0D0D0', // Bordure claire
    marginBottom: 15,
  },
  inputIcon: {
      marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  
  // Style spécifique pour le champ de mot de passe dans son conteneur
  passwordInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    paddingLeft: 10,
    height: '100%',
    justifyContent: 'center',
  },
  
  // Conteneur "Se souvenir de moi" et "Mot de passe oublié"
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 5,
  },

  // Styles de la case à cocher
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#5B43D5',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5B43D5',
    borderColor: '#5B43D5',
  },
  
  // Styles du bouton principal "Se connecter"
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15, 
    alignItems: 'center',
    backgroundColor: '#5B43D5', // Violet
    marginBottom: 30,
    elevation: 5, // Ombre Android
  },
  primaryButtonDisabled: {
    backgroundColor: '#A092D8',
  },
  primaryButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  
  // Section Accès Spécial
  specialAccessText: { 
      fontSize: 14, 
      color: '#999', 
      marginBottom: 15,
      marginTop: 15,
  },
  secondaryButton: {
    width: '60%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderWidth: 1,
    borderColor: '#5B43D5',
    marginBottom: 40,
  },
  secondaryButtonText: { 
      color: '#5B43D5', 
      fontSize: 16, 
      fontWeight: '600' 
  },
  
  // Styles du lien d'inscription
  linkContainer: { flexDirection: 'row', alignItems: 'center' },
  textBase: { fontSize: 15, color: '#666' },
  linkText: { 
    color: '#5B43D5', 
    fontSize: 15, 
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
export default StudentLoginScreen;
