import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createCourseApi,
  updateCourseApi,
  getCourseByIdApi,
  getAllProfsApi,
  getAllUsersApi,
} from '../../../services/api';

const CreateEditCourseScreen = () => {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const isEdit = !!courseId;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Form data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [section, setSection] = useState('');
  const [teacher, setTeacher] = useState('');
  const [progress, setProgress] = useState('0');
  const [nextLesson, setNextLesson] = useState('');

  // Data lists
  const [professors, setProfessors] = useState([]);
  const [showProfPicker, setShowProfPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load current user
      const userData = await AsyncStorage.getItem('unistudious_user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setUserRole(user.role);
        
        // If user is prof and creating new course, auto-assign as teacher
        if (user.role === 'prof' && !isEdit) {
          setTeacher(user._id);
        }
      }

      // Load professors only if admin
      const role = currentUser?.role || JSON.parse(userData || '{}').role;
      if (role === 'admin') {
        const profsData = await getAllProfsApi();
        setProfessors(profsData.profs || profsData || []);
      }

      // Load course data if editing
      if (isEdit) {
        const courseData = await getCourseByIdApi(courseId);
        const course = courseData.course || courseData;
        setName(course.name || '');
        setDescription(course.description || '');
        setSection(course.section || '');
        setTeacher(course.teacher?._id || course.teacher || '');
        setProgress(String(course.progress || 0));
        setNextLesson(course.nextLesson || '');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom du cours est requis');
      return;
    }

    if (!teacher) {
      Alert.alert('Erreur', 'Veuillez sélectionner un professeur');
      return;
    }

    const progressNum = parseInt(progress) || 0;
    if (progressNum < 0 || progressNum > 100) {
      Alert.alert('Erreur', 'La progression doit être entre 0 et 100');
      return;
    }

    setIsSaving(true);

    try {
      const courseData = {
        name: name.trim(),
        description: description.trim(),
        section: section.trim(),
        teacher,
        progress: progressNum,
        nextLesson: nextLesson.trim(),
      };

      if (isEdit) {
        await updateCourseApi(courseId, courseData);
        Alert.alert('Succès', 'Cours modifié avec succès');
      } else {
        await createCourseApi(courseData);
        Alert.alert('Succès', 'Cours créé avec succès');
      }

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(screens)/courses/list');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Impossible de sauvegarder le cours'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B43D5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(screens)/courses/list');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Modifier le cours' : 'Créer un cours'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Course Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom du cours *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Mathématiques - Algèbre"
            value={name}
            onChangeText={setName}
            editable={!isSaving}
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description du cours..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isSaving}
          />
        </View>

        {/* Section */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Section</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Sciences, Informatique, Mathématiques..."
            value={section}
            onChangeText={setSection}
            editable={!isSaving}
          />
        </View>

        {/* Professor Picker - Only for Admin */}
        {userRole === 'admin' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Professeur *</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowProfPicker(!showProfPicker)}
            disabled={isSaving}
          >
            <Text style={styles.pickerText}>
              {teacher
                ? (() => {
                    const prof = professors.find((p) => p._id === teacher);
                    return prof 
                      ? `${prof.firstName} ${prof.lastName}${prof.speciality ? ` • ${prof.speciality}` : ''}`
                      : 'Sélectionner un professeur';
                  })()
                : 'Sélectionner un professeur'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {showProfPicker && (
            <View style={styles.pickerOptions}>
              {professors.map((prof) => (
                <TouchableOpacity
                  key={prof._id}
                  style={styles.pickerOption}
                  onPress={() => {
                    setTeacher(prof._id);
                    setShowProfPicker(false);
                  }}
                >
                  <View>
                    <Text style={styles.pickerOptionText}>
                      {prof.firstName} {prof.lastName}
                    </Text>
                    <View style={styles.pickerSubtextRow}>
                      {prof.speciality && (
                        <>
                          <Ionicons name="school" size={12} color="#6C5CE7" />
                          <Text style={styles.pickerOptionSubtext}>
                            {prof.speciality}
                          </Text>
                          <Text style={styles.pickerDivider}> • </Text>
                        </>
                      )}
                      <Ionicons name="mail" size={12} color="#636E72" />
                      <Text style={styles.pickerOptionSubtext}>
                        {prof.email}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        )}

        {/* Progress */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Progression (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={progress}
            onChangeText={setProgress}
            keyboardType="number-pad"
            editable={!isSaving}
          />
        </View>

        {/* Next Lesson */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Prochaine leçon</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Les équations du second degré"
            value={nextLesson}
            onChangeText={setNextLesson}
            editable={!isSaving}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isEdit ? 'Enregistrer les modifications' : 'Créer le cours'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#6C5CE7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 5,
    elevation: 3,
    maxHeight: 250,
  },
  pickerOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pickerSubtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  pickerOptionSubtext: {
    fontSize: 13,
    color: '#666',
  },
  pickerDivider: {
    fontSize: 13,
    color: '#999',
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#A29BFE',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default CreateEditCourseScreen;
