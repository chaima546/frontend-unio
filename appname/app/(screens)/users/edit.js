import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { getUserByIdApi, updateUserApi } from '../../../services/api';

const EditUserScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'user',
    niveauScolaire: '1ère',
    section: null,
  });

  useEffect(() => {
    if (params.id) {
      loadUser();
    }
  }, [params.id]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const response = await getUserByIdApi(params.id);
      const user = response.user;
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'user',
        niveauScolaire: user.niveauScolaire || '1ère',
        section: user.section || null,
      });
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'utilisateur');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
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

    try {
      setIsSaving(true);
      
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
      };

      // Add academic info for students
      if (formData.role === 'user') {
        updateData.niveauScolaire = formData.niveauScolaire;
        updateData.section = formData.niveauScolaire === '1ère' ? null : formData.section;
      }

      await updateUserApi(params.id, updateData);
      Alert.alert('Succès', 'Utilisateur modifié avec succès');
      router.back();
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Impossible de modifier l\'utilisateur'
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B43D5" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const showSectionPicker = formData.role === 'user' && formData.niveauScolaire !== '1ère';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier l'utilisateur</Text>
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

          <Text style={styles.note}>
            Note: La modification du mot de passe n'est pas disponible depuis cette interface.
          </Text>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  note: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B43D5',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default EditUserScreen;
