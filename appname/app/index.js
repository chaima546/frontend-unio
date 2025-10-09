import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router'; 

export default function WelcomeScreen() {
  const router = useRouter(); 

  const goToSignUp = () => {
    router.push('/(auth)/studentRegister'); 
  };

  const goToLogin = () => {
    router.push('/(auth)/studentLogin'); 
  };

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