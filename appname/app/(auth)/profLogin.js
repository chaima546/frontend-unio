import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { loginProfApi } from '../../services/api'; 
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfLoginScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const goBack = () => {
    router.replace('/(auth)/studentLogin');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez entrer votre e-mail et mot de passe.");
      return;
    }

    setIsLoading(true);

    try {
      // Call Professor Login API
      const data = await loginProfApi(email, password);

      // Store token and user data
      await AsyncStorage.setItem('unistudious_user_token', data.token);
      await AsyncStorage.setItem('unistudious_user_data', JSON.stringify(data.user));
      await AsyncStorage.setItem('userRole', 'prof');
      
      Alert.alert("Succès", `Bienvenue, Professeur ${data.user.firstName} ${data.user.lastName} !`);
      
      // Redirect to Professor Dashboard
      router.replace('/(tabs)/profHome'); 

    } catch (error) {
      const errorMessage = error.response?.data?.message || "E-mail ou mot de passe incorrect.";
      Alert.alert("Échec de la connexion", errorMessage);
      console.error("Erreur de connexion:", error.response || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const goToStudentLogin = () => {
    router.replace('/(auth)/studentLogin'); 
  };
  
  const goToForgotPassword = () => {
    Alert.alert("Fonctionnalité future", "Redirection vers la récupération de mot de passe.");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} disabled={isLoading} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connexion Professeur</Text>
      </View>
      
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="school" size={80} color="#FF6B35" />
        </View>
        
        <Text style={styles.welcomeText}>Espace Professeur</Text>
        <Text style={styles.subText}>Connectez-vous pour gérer vos cours</Text>

        {/* Champ E-mail */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Email professionnel" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none" 
            editable={!isLoading}
          />
        </View>
        
        {/* Champ Mot de passe */}
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
              color="#FF6B35" 
            />
          </TouchableOpacity>
        </View>

        {/* Options */}
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
        
        {/* Lien vers Student Login */}
        <Text style={styles.specialAccessText}>Vous êtes étudiant ?</Text>
        <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={goToStudentLogin}
            disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Connexion Étudiant</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
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
  
  container: { flex: 1, paddingHorizontal: 30, alignItems: 'center', paddingTop: 20 },
  iconContainer: {
    marginBottom: 20,
  },
  welcomeText: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 5 },
  subText: { fontSize: 14, color: '#666', marginBottom: 30, textAlign: 'center' },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#D0D0D0',
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
  
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 5,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FF6B35',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15, 
    alignItems: 'center',
    backgroundColor: '#FF6B35', // Orange for professors
    marginBottom: 30,
    elevation: 5,
  },
  primaryButtonDisabled: {
    backgroundColor: '#FFB399',
  },
  primaryButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  
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
    borderColor: '#FF6B35',
    marginBottom: 40,
  },
  secondaryButtonText: { 
      color: '#FF6B35', 
      fontSize: 16, 
      fontWeight: '600' 
  },
  
  textBase: { fontSize: 15, color: '#666' },
  linkText: { 
    color: '#FF6B35', 
    fontSize: 15, 
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default ProfLoginScreen;
