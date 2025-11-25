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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  createResourceApi,
  updateResourceApi,
  getResourceByIdApi,
  getAllCoursesApi,
  getAllProfsApi,
} from '../../../services/api';

export default function CreateResource() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEdit = !!params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [profs, setProfs] = useState([]);

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'file',
    url: '',
    courseId: '',
    uploadedByProf: '',
  });

  const [errors, setErrors] = useState({});

  const resourceTypes = [
    { value: 'file', label: 'Fichier', icon: 'document-text', color: '#FF6B35' },
    { value: 'link', label: 'Lien', icon: 'link', color: '#4ECDC4' },
    { value: 'video', label: 'Vidéo', icon: 'videocam', color: '#FF4757' },
    { value: 'image', label: 'Image', icon: 'image', color: '#5F27CD' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load courses and professors
      const [coursesResponse, profsResponse] = await Promise.all([
        getAllCoursesApi(),
        getAllProfsApi(),
      ]);

      const coursesData = coursesResponse.courses || coursesResponse.data || coursesResponse || [];
      const profsData = profsResponse.profs || profsResponse.data || profsResponse || [];

      setCourses(coursesData);
      setProfs(profsData);

      // Load resource data if editing
      if (isEdit && params.id) {
        const response = await getResourceByIdApi(params.id);
        const resource = response.ressource || response.data || response;

        setFormData({
          titre: resource.titre || '',
          description: resource.description || '',
          type: resource.type || 'file',
          url: resource.url || '',
          courseId: resource.courseId?._id || resource.courseId || '',
          uploadedByProf: resource.uploadedByProf?._id || resource.uploadedByProf || '',
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis';
    }

    if (!formData.type) {
      newErrors.type = 'Le type est requis';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'L\'URL est requise';
    } else if (formData.type === 'link' && !isValidUrl(formData.url)) {
      newErrors.url = 'URL invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setIsSaving(true);

      const resourceData = {
        ...formData,
        courseId: formData.courseId || undefined,
        uploadedByProf: formData.uploadedByProf || undefined,
      };

      if (isEdit) {
        await updateResourceApi(params.id, resourceData);
        Alert.alert('Succès', 'Ressource mise à jour avec succès');
      } else {
        await createResourceApi(resourceData);
        Alert.alert('Succès', 'Ressource créée avec succès');
      }

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(screens)/resources/list');
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de sauvegarder la ressource');
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
            router.replace('/(screens)/resources/list');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Modifier' : 'Créer'} Ressource
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Titre <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.titre && styles.inputError]}
            placeholder="Ex: Cours de Physique - Chapitre 1"
            value={formData.titre}
            onChangeText={(text) => updateFormData('titre', text)}
          />
          {errors.titre && <Text style={styles.errorText}>{errors.titre}</Text>}
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez cette ressource..."
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Resource Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Type de ressource <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.typeContainer}>
            {resourceTypes.map((type) => (
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

        {/* URL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            URL <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.url && styles.inputError]}
            placeholder="https://example.com/resource.pdf"
            value={formData.url}
            onChangeText={(text) => updateFormData('url', text)}
            autoCapitalize="none"
            keyboardType="url"
          />
          {errors.url && <Text style={styles.errorText}>{errors.url}</Text>}
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
                    { text: 'Aucun', onPress: () => updateFormData('courseId', '') },
                    ...courses.map((course) => ({
                      text: course.name,
                      onPress: () => updateFormData('courseId', course._id),
                    })),
                    { text: 'Annuler', style: 'cancel' },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Text style={styles.pickerButtonText}>
                {formData.courseId
                  ? courses.find((c) => c._id === formData.courseId)?.name || 'Sélectionner...'
                  : 'Aucun cours sélectionné'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#95A5A6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Professor Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Uploadé par (optionnel)</Text>
          <View style={styles.pickerContainer}>
            <Ionicons name="person-outline" size={20} color="#95A5A6" style={styles.pickerIcon} />
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                Alert.alert(
                  'Sélectionner un professeur',
                  '',
                  [
                    { text: 'Aucun', onPress: () => updateFormData('uploadedByProf', '') },
                    ...profs.map((prof) => ({
                      text: `${prof.firstName} ${prof.lastName}`,
                      onPress: () => updateFormData('uploadedByProf', prof._id),
                    })),
                    { text: 'Annuler', style: 'cancel' },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Text style={styles.pickerButtonText}>
                {formData.uploadedByProf
                  ? (() => {
                      const prof = profs.find((p) => p._id === formData.uploadedByProf);
                      return prof ? `${prof.firstName} ${prof.lastName}` : 'Sélectionner...';
                    })()
                  : 'Aucun professeur sélectionné'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#95A5A6" />
            </TouchableOpacity>
          </View>
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
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={styles.saveButtonText}>
                {isEdit ? 'Mettre à jour' : 'Créer'} la ressource
              </Text>
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
  textArea: {
    height: 100,
    paddingTop: 12,
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
