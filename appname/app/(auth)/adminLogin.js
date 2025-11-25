import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUserApi } from '../../services/api'; 
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminLoginScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      // Call User Login API (Admin uses same endpoint as students)
      const data = await loginUserApi(email, password);

      // Check if user is actually an admin
      if (data.user.role !== 'admin') {
        Alert.alert("Accès refusé", "Vous n'avez pas les privilèges administrateur.");
        setIsLoading(false);
        return;
      }

      // Store token and user data
      await AsyncStorage.setItem('unistudious_user_token', data.token);
      await AsyncStorage.setItem('unistudious_user_data', JSON.stringify(data.user));
      await AsyncStorage.setItem('userRole', 'admin');
      
      Alert.alert("Succès", `Bienvenue, Administrateur ${data.user.username} !`);
      
      // Redirect to Admin Dashboard
      router.replace('/(tabs)/adminHome'); 

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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} disabled={isLoading} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connexion Admin</Text>
      </View>
      
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#DC143C" />
        </View>
        
        <Text style={styles.welcomeText}>Espace Administrateur</Text>
        <Text style={styles.subText}>Accès réservé aux administrateurs système</Text>

        {/* Champ E-mail */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Email administrateur" 
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
              color="#DC143C" 
            />
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
            <>
              <Ionicons name="lock-closed" size={20} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.primaryButtonText}>Connexion Sécurisée</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Warning */}
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#FFA500" />
          <Text style={styles.warningText}>Zone sécurisée - Accès restreint</Text>
        </View>

        {/* Lien vers Student Login */}
        <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={goToStudentLogin}
            disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#F5F5F5' },
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
  
  container: { flex: 1, paddingHorizontal: 30, alignItems: 'center', paddingTop: 40 },
  iconContainer: {
    marginBottom: 20,
    backgroundColor: '#FFE4E4',
    padding: 30,
    borderRadius: 100,
  },
  welcomeText: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 5 },
  subText: { fontSize: 14, color: '#666', marginBottom: 40, textAlign: 'center' },
  
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
  
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15,
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC143C', // Red for admin
    marginTop: 30,
    marginBottom: 20,
    elevation: 5,
  },
  primaryButtonDisabled: {
    backgroundColor: '#FF6B8A',
  },
  primaryButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  warningText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderWidth: 1,
    borderColor: '#DC143C',
    marginBottom: 40,
  },
  secondaryButtonText: { 
      color: '#DC143C', 
      fontSize: 16, 
      fontWeight: '600' 
  },
});

export default AdminLoginScreen;
