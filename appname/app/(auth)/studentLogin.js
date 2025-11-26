import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUserApi } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const StudentLoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const goBack = () => router.replace('/');
  const goToForgotPassword = () => router.push('/forgotPassword');
  const goToTeacherLogin = () => router.push('/(auth)/profLogin');
  const goToAdminLogin = () => router.push('/(auth)/adminLogin');
  const goToSignUp = () => router.push('/(auth)/studentRegister');

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await loginUserApi(email, password);
      if (response.success) {
        await AsyncStorage.setItem('userToken', response.token);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Erreur', response.message || 'Échec de la connexion');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="#5B43D5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connexion</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Bienvenue ! Connectez-vous pour accéder à votre espace étudiant.</Text>
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
            <Ionicons name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={24} color="#5B43D5" />
          </TouchableOpacity>
        </View>
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
        <Text style={styles.specialAccessText}>Accès spécial</Text>
        <View style={styles.specialButtonsContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={goToTeacherLogin}
            disabled={isLoading}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="school" size={20} color="#FF6B35" style={{ marginRight: 5 }} />
              <Text style={styles.secondaryButtonText}>Professeur</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, styles.adminButton]}
            onPress={goToAdminLogin}
            disabled={isLoading}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="shield-checkmark" size={20} color="#DC143C" style={{ marginRight: 5 }} />
              <Text style={[styles.secondaryButtonText, styles.adminButtonText]}>Admin</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.linkContainer}>
          <Text style={styles.textBase}>Vous n'avez pas de compte ? </Text>
          <TouchableOpacity onPress={goToSignUp} disabled={isLoading}>
            <Text style={styles.linkText}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default StudentLoginScreen;

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
    borderBottomColor: '#F0F0F0'
  },
  backButton: { paddingRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
  container: { flex: 1, paddingHorizontal: 30, alignItems: 'center', paddingTop: 30 },
  welcomeText: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
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
    marginBottom: 15
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, height: '100%' },
  passwordInput: { flex: 1, fontSize: 16, height: '100%' },
  eyeButton: { paddingLeft: 10, height: '100%', justifyContent: 'center' },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 5
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#5B43D5',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: { backgroundColor: '#5B43D5', borderColor: '#5B43D5' },
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    backgroundColor: '#5B43D5',
    marginBottom: 30,
    elevation: 5
  },
  primaryButtonDisabled: { backgroundColor: '#A092D8' },
  primaryButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  specialAccessText: { fontSize: 14, color: '#999', marginBottom: 15, marginTop: 15 },
  specialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40
  },
  secondaryButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6B35'
  },
  adminButton: { borderColor: '#DC143C' },
  secondaryButtonText: { color: '#FF6B35', fontSize: 14, fontWeight: '600' },
  adminButtonText: { color: '#DC143C' },
  linkContainer: { flexDirection: 'row', alignItems: 'center' },
  textBase: { fontSize: 15, color: '#666' },
  linkText: { color: '#5B43D5', fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' }
});
