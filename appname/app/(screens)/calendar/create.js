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
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  createEventApi,
  updateEventApi,
  getEventByIdApi,
  getAllCoursesApi,
} from '../../../services/api';

export default function CreateEvent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEdit = !!params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    debut: new Date(),
    fin: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
    type: 'personnel',
    courseId: '',
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [errors, setErrors] = useState({});

  const eventTypes = [
    { value: 'personnel', label: 'Personnel', icon: 'person', color: '#3498DB' },
    { value: 'classe', label: 'Classe', icon: 'people', color: '#2ECC71' },
    { value: 'projet', label: 'Projet', icon: 'folder', color: '#F39C12' },
    { value: 'examen', label: 'Examen', icon: 'school', color: '#E74C3C' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load courses
      const coursesResponse = await getAllCoursesApi();
      const coursesData = coursesResponse.courses || coursesResponse.data || coursesResponse || [];
      setCourses(coursesData);

      // Load event data if editing
      if (isEdit && params.id) {
        const response = await getEventByIdApi(params.id);
        const event = response.calendrier || response.data || response;

        setFormData({
          titre: event.titre || '',
          description: event.description || '',
          debut: new Date(event.debut),
          fin: new Date(event.fin),
          type: event.type || 'personnel',
          courseId: event.courseId?._id || event.courseId || '',
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

    if (formData.debut >= formData.fin) {
      newErrors.dates = 'La date de fin doit être après la date de début';
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

      const eventData = {
        ...formData,
        courseId: formData.courseId || undefined,
      };

      if (isEdit) {
        await updateEventApi(params.id, eventData);
        Alert.alert('Succès', 'Événement mis à jour avec succès');
      } else {
        await createEventApi(eventData);
        Alert.alert('Succès', 'Événement créé avec succès');
      }

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(screens)/calendar/list');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de sauvegarder l\'événement');
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

  const onChangeStartDate = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateFormData('debut', selectedDate);
      // Automatically set end date to 2 hours after start
      if (selectedDate >= formData.fin) {
        updateFormData('fin', new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000));
      }
    }
  };

  const onChangeEndDate = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateFormData('fin', selectedDate);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            router.replace('/(screens)/calendar/list');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Modifier' : 'Créer'} Événement
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
            placeholder="Ex: Examen de Physique"
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
            placeholder="Décrivez cet événement..."
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Event Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Type d'événement <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.typeContainer}>
            {eventTypes.map((type) => (
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

        {/* Start Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Date de début <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#5B43D5" />
            <Text style={styles.dateButtonText}>{formatDateTime(formData.debut)}</Text>
            <Ionicons name="chevron-down" size={20} color="#95A5A6" />
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={formData.debut}
              mode="datetime"
              display="default"
              onChange={onChangeStartDate}
            />
          )}
        </View>

        {/* End Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Date de fin <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#FF6B35" />
            <Text style={styles.dateButtonText}>{formatDateTime(formData.fin)}</Text>
            <Ionicons name="chevron-down" size={20} color="#95A5A6" />
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={formData.fin}
              mode="datetime"
              display="default"
              onChange={onChangeEndDate}
              minimumDate={formData.debut}
            />
          )}
          {errors.dates && <Text style={styles.errorText}>{errors.dates}</Text>}
        </View>

        {/* Duration Display */}
        <View style={styles.durationContainer}>
          <Ionicons name="time-outline" size={20} color="#5B43D5" />
          <Text style={styles.durationText}>
            Durée: {Math.round((formData.fin - formData.debut) / (1000 * 60 * 60))} heure(s)
          </Text>
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
                {isEdit ? 'Mettre à jour' : 'Créer'} l'événement
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 10,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E0FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B43D5',
    marginLeft: 10,
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
