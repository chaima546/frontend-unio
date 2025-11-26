import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCourseByIdApi } from '../../../services/api';

const { width } = Dimensions.get('window');

const formatDate = (dateString) => {
  if (!dateString) return 'Non disponible';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Non disponible';
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  } catch (error) {
    return 'Non disponible';
  }
};

export default function CourseDetails() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadUserRole();
    loadCourseDetails();
  }, []);

  const loadUserRole = async () => {
    try {
      const userData = await AsyncStorage.getItem('unistudious_user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadCourseDetails = async () => {
    try {
      setIsLoading(true);
      const data = await getCourseByIdApi(courseId);
      console.log('Course data loaded:', data);
      setCourse(data);
    } catch (error) {
      console.error('Error loading course details:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du cours');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: '/(screens)/courses/edit',
      params: { courseId: course._id }
    });
  };

  const handleManageStudents = () => {
    router.push({
      pathname: '/(screens)/courses/manage-students',
      params: { courseId: course._id }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Chargement du cours...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#FF6B6B" />
        </View>
        <Text style={styles.errorTitle}>Cours introuvable</Text>
        <Text style={styles.errorText}>Ce cours n'existe pas ou a été supprimé</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#FFF" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du Cours</Text>
        {(userRole === 'admin' || userRole === 'prof') && (
          <TouchableOpacity onPress={handleEdit} style={styles.editBtn}>
            <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        {userRole === 'user' && <View style={{ width: 40 }} />}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.courseIconLarge}>
            <Ionicons name="book" size={40} color="#6C5CE7" />
          </View>
          <Text style={styles.courseName}>{course.name}</Text>
          
          {/* Circular Progress */}
          <View style={styles.circularProgressLarge}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>{course.progress || 0}%</Text>
              <Text style={styles.progressLabel}>Complété</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {course.description && (
          <View style={styles.section}>
            <View style={styles.sectionIconHeader}>
              <Ionicons name="document-text" size={20} color="#6C5CE7" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>{course.description}</Text>
          </View>
        )}

        {/* Next Lesson */}
        {course.nextLesson && (
          <View style={styles.section}>
            <View style={styles.sectionIconHeader}>
              <Ionicons name="play-circle" size={20} color="#FFA502" />
              <Text style={styles.sectionTitle}>Prochaine Leçon</Text>
            </View>
            <View style={styles.nextLessonCard}>
              <Ionicons name="videocam" size={24} color="#FFA502" />
              <Text style={styles.nextLessonText}>{course.nextLesson}</Text>
            </View>
          </View>
        )}

        {/* Teacher */}
        {course.teacher && (
          <View style={styles.section}>
            <View style={styles.sectionIconHeader}>
              <Ionicons name="person" size={20} color="#6C5CE7" />
              <Text style={styles.sectionTitle}>Professeur</Text>
            </View>
            <View style={styles.teacherCard}>
              <View style={styles.teacherIcon}>
                <Ionicons name="person" size={28} color="#6C5CE7" />
              </View>
              <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>
                  {course.teacher.firstName} {course.teacher.lastName}
                </Text>
                {course.teacher.speciality && (
                  <View style={styles.teacherSpecialityRow}>
                    <Ionicons name="school" size={14} color="#6C5CE7" />
                    <Text style={styles.teacherSpeciality}>{course.teacher.speciality}</Text>
                  </View>
                )}
                <View style={styles.teacherEmailRow}>
                  <Ionicons name="mail" size={14} color="#636E72" />
                  <Text style={styles.teacherEmail}>{course.teacher.email}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Students */}
        {course.students && course.students.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconHeader}>
                <Ionicons name="people" size={20} color="#6C5CE7" />
                <Text style={styles.sectionTitle}>
                  Étudiants
                </Text>
              </View>
              <View style={styles.studentBadge}>
                <Text style={styles.studentBadgeText}>{course.students.length}</Text>
              </View>
            </View>
            {(userRole === 'admin' || userRole === 'prof') && (
              <TouchableOpacity 
                style={styles.manageButton}
                onPress={handleManageStudents}
              >
                <Ionicons name="settings-outline" size={20} color="#6C5CE7" />
                <Text style={styles.manageButtonText}>Gérer les étudiants</Text>
              </TouchableOpacity>
            )}
            {course.students.slice(0, 5).map((student, index) => (
              <View key={student._id || index} style={styles.studentCard}>
                <View style={styles.studentIcon}>
                  <Ionicons name="person-outline" size={20} color="#666" />
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {student.firstName} {student.lastName}
                  </Text>
                  <Text style={styles.studentEmail}>{student.email}</Text>
                </View>
              </View>
            ))}
            {course.students.length > 5 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={handleManageStudents}
              >
                <Text style={styles.viewAllText}>
                  Voir tous les {course.students.length} étudiants
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#6C5CE7" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <View style={styles.sectionIconHeader}>
            <Ionicons name="information-circle" size={20} color="#6C5CE7" />
            <Text style={styles.sectionTitle}>Informations</Text>
          </View>
          <View style={styles.metadataCard}>
            <View style={styles.metadataRow}>
              <View style={styles.metadataIconContainer}>
                <Ionicons name="calendar-outline" size={18} color="#6C5CE7" />
              </View>
              <View>
                <Text style={styles.metadataLabel}>Date de création</Text>
                <Text style={styles.metadataText}>
                  {formatDate(course.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.metadataRow}>
              <View style={styles.metadataIconContainer}>
                <Ionicons name="time-outline" size={18} color="#FFA502" />
              </View>
              <View>
                <Text style={styles.metadataLabel}>Dernière modification</Text>
                <Text style={styles.metadataText}>
                  {formatDate(course.updatedAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#636E72',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 40,
  },
  errorIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#6C5CE7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  editBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  courseIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  courseName: {
    fontSize: Math.min(width * 0.06, 26),
    fontWeight: '800',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 32,
  },
  circularProgressLarge: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0EBFF',
    borderWidth: 8,
    borderColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6C5CE7',
  },
  progressLabel: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    letterSpacing: 0.3,
  },
  descriptionText: {
    fontSize: 16,
    color: '#636E72',
    lineHeight: 26,
  },
  nextLessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF9F0',
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA502',
  },
  nextLessonText: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '600',
    flex: 1,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
  },
  teacherIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 6,
  },
  teacherSpecialityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  teacherSpeciality: {
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  teacherEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teacherEmail: {
    fontSize: 14,
    color: '#636E72',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentBadge: {
    backgroundColor: '#F0EBFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 36,
    alignItems: 'center',
  },
  studentBadgeText: {
    color: '#6C5CE7',
    fontSize: 14,
    fontWeight: '700',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F0EBFF',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C5CE7',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  studentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 13,
    color: '#636E72',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6C5CE7',
  },
  metadataCard: {
    gap: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  metadataIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 13,
    color: '#636E72',
    marginBottom: 4,
    fontWeight: '600',
  },
  metadataText: {
    fontSize: 15,
    color: '#2D3436',
    fontWeight: '500',
  },
});
