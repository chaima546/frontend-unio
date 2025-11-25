import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('unistudious_user_token');
      const userData = await AsyncStorage.getItem('unistudious_user_data');
      const userRole = await AsyncStorage.getItem('userRole');

      if (token && userData) {
        // User is already logged in, redirect to appropriate dashboard
        const user = JSON.parse(userData);
        
        if (userRole === 'admin' || user.role === 'admin') {
          router.replace('/(tabs)/adminHome');
        } else if (userRole === 'prof') {
          router.replace('/(tabs)/profHome');
        } else {
          router.replace('/(tabs)/home');
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const goToSignUp = () => {
    router.push('/(auth)/studentRegister'); 
  };

  const goToLogin = () => {
    router.push('/(auth)/studentLogin'); 
  };

  if (isCheckingAuth) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#5B43D5" />
        <Text style={{ marginTop: 10, color: '#666' }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FontAwesome 
        name="graduation-cap" 
        size={120} 
        color="#5B43D5"
        style={styles.logoMargin} 
      />

      <Text style={styles.title}>Bienvenue sur Unistudious</Text>
      <Text style={styles.subtitle}>
        Votre plateforme d'apprentissage complète pour réussir vos études et développer vos compétences.
      </Text>

      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={goToSignUp}
      >
        <Text style={styles.primaryButtonText}>Créer un compte</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={goToLogin}
      >
        <Text style={styles.secondaryButtonText}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
  },
  logoMargin: {
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 60,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#5B43D5', 
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#5B43D5',
  },
  secondaryButtonText: {
    color: '#5B43D5',
    fontSize: 18,
    fontWeight: '600',
  },
});