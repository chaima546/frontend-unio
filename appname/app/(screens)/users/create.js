import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { createUserApi } from '../../../services/api';

const CreateUserScreen = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    niveauScolaire: '1ère',
    section: null,
  });

  const handleCreate = async () => {
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont requis');
      return;
    }

    if (!formData.username.trim()) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur est requis');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Erreur', 'L\'email est requis');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erreur', 'Format d\'email invalide');
      return;
    }

    if (!formData.password) {
      Alert.alert('Erreur', 'Le mot de passe est requis');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setIsSaving(true);
      
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      };

      // Add academic info for students
      if (formData.role === 'user') {
        userData.niveauScolaire = formData.niveauScolaire;
        userData.section = formData.niveauScolaire === '1ère' ? null : formData.section;
      }

      await createUserApi(userData);
      Alert.alert('Succès', 'Utilisateur créé avec succès');
      router.back();
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Impossible de créer l\'utilisateur'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Reset section if role is not user or niveau is 1ère
      if (field === 'role' && value !== 'user') {
        updated.section = null;
      }
      if (field === 'niveauScolaire' && value === '1ère') {
        updated.section = null;
      }
      
      return updated;
    });
  };

  const showSectionPicker = formData.role === 'user' && formData.niveauScolaire !== '1ère';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer un utilisateur</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              placeholder="Prénom"
              placeholderTextColor="#999"
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              placeholder="Nom"
              placeholderTextColor="#999"
            />
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom d'utilisateur *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(value) => updateFormData('username', value)}
              placeholder="nom.utilisateur"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="email@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Minimum 6 caractères"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Retapez le mot de passe"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {/* Role */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rôle *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(value) => updateFormData('role', value)}
                style={styles.picker}
              >
                <Picker.Item label="Étudiant" value="user" />
                <Picker.Item label="Professeur" value="prof" />
                <Picker.Item label="Administrateur" value="admin" />
              </Picker>
            </View>
          </View>

          {/* Academic Info - Only for students */}
          {formData.role === 'user' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Niveau Scolaire *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.niveauScolaire}
                    onValueChange={(value) => updateFormData('niveauScolaire', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="1ère" value="1ère" />
                    <Picker.Item label="2ème" value="2ème" />
                    <Picker.Item label="3ème" value="3ème" />
                    <Picker.Item label="Bac" value="Bac" />
                  </Picker>
                </View>
              </View>

              {showSectionPicker && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Section *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.section}
                      onValueChange={(value) => updateFormData('section', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Informatique" value="Informatique" />
                      <Picker.Item label="Sciences" value="Sciences" />
                      <Picker.Item label="Mathématiques" value="Mathématiques" />
                      <Picker.Item label="Économie" value="Économie" />
                      <Picker.Item label="Lettres" value="Lettres" />
                      <Picker.Item label="Technologie" value="Technologie" />
                      <Picker.Item label="Sport" value="Sport" />
                    </Picker>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, isSaving && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="person-add" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Créer l'utilisateur</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#5B43D5',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B43D5',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default CreateUserScreen;
