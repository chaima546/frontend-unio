import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  createNotificationApi,
  getAllUsersApi,
  getAllCoursesApi,
} from '../../../services/api';

export default function CreateNotification() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    type: 'general',
    link: '',
    recipient: '',
    relatedCourse: '',
  });

  const [errors, setErrors] = useState({});

  const notificationTypes = [
    { value: 'general', label: 'Général', icon: 'notifications', color: '#9B59B6' },
    { value: 'resource_added', label: 'Ressource', icon: 'folder-open', color: '#3498DB' },
    { value: 'project_assigned', label: 'Projet', icon: 'briefcase', color: '#F39C12' },
    { value: 'grade_posted', label: 'Note', icon: 'trophy', color: '#2ECC71' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load users and courses
      const [usersResponse, coursesResponse] = await Promise.all([
        getAllUsersApi(),
        getAllCoursesApi(),
      ]);

      const usersData = usersResponse.users || usersResponse.data || usersResponse || [];
      const coursesData = coursesResponse.courses || coursesResponse.data || coursesResponse || [];

      setUsers(usersData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.type) {
      newErrors.type = 'Le type est requis';
    }

    if (!formData.recipient) {
      newErrors.recipient = 'Le destinataire est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setIsSaving(true);

      const notificationData = {
        ...formData,
        link: formData.link || undefined,
        relatedCourse: formData.relatedCourse || undefined,
      };

      await createNotificationApi(notificationData);
      Alert.alert('Succès', 'Notification créée avec succès');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(screens)/notifications/list');
      }
    } catch (error) {
      console.error('Error saving notification:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de sauvegarder la notification');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5B43D5" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(screens)/notifications/list');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer Notification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Titre <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Ex: Nouveau cours disponible"
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Notification Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Type de notification <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.typeContainer}>
            {notificationTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  formData.type === type.value && {
                    backgroundColor: type.color,
                    borderColor: type.color,
                  },
                ]}
                onPress={() => updateFormData('type', type.value)}
              >
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={formData.type === type.value ? '#FFF' : type.color}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === type.value && styles.typeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
        </View>

        {/* Recipient Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Destinataire <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Ionicons name="person-outline" size={20} color="#95A5A6" style={styles.pickerIcon} />
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                Alert.alert(
                  'Sélectionner un utilisateur',
                  '',
                  [
                    ...users.map((user) => ({
                      text: `${user.firstName} ${user.lastName} (${user.email})`,
                      onPress: () => updateFormData('recipient', user._id),
                    })),
                    { text: 'Annuler', style: 'cancel' },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Text style={[styles.pickerButtonText, errors.recipient && styles.errorText]}>
                {formData.recipient
                  ? (() => {
                      const user = users.find((u) => u._id === formData.recipient);
                      return user ? `${user.firstName} ${user.lastName}` : 'Sélectionner...';
                    })()
                  : 'Sélectionner un utilisateur...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#95A5A6" />
            </TouchableOpacity>
          </View>
          {errors.recipient && <Text style={styles.errorText}>{errors.recipient}</Text>}
        </View>

        {/* Link */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lien (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="/courses/123"
            value={formData.link}
            onChangeText={(text) => updateFormData('link', text)}
            autoCapitalize="none"
          />
        </View>

        {/* Course Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cours associé (optionnel)</Text>
          <View style={styles.pickerContainer}>
            <Ionicons name="book-outline" size={20} color="#95A5A6" style={styles.pickerIcon} />
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                Alert.alert(
                  'Sélectionner un cours',
                  '',
                  [
                    { text: 'Aucun', onPress: () => updateFormData('relatedCourse', '') },
                    ...courses.map((course) => ({
                      text: course.name,
                      onPress: () => updateFormData('relatedCourse', course._id),
                    })),
                    { text: 'Annuler', style: 'cancel' },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Text style={styles.pickerButtonText}>
                {formData.relatedCourse
                  ? courses.find((c) => c._id === formData.relatedCourse)?.name || 'Sélectionner...'
                  : 'Aucun cours sélectionné'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#95A5A6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3498DB" />
          <Text style={styles.infoText}>
            La notification sera envoyée immédiatement au destinataire sélectionné.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="send" size={24} color="#FFF" />
              <Text style={styles.saveButtonText}>Envoyer la notification</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  required: {
    color: '#FF4757',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  inputError: {
    borderColor: '#FF4757',
  },
  errorText: {
    color: '#FF4757',
    fontSize: 12,
    marginTop: 5,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginLeft: 8,
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  pickerIcon: {
    marginRight: 10,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4F8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#3498DB',
    marginLeft: 10,
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#5B43D5',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
