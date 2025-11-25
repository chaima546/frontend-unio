import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCourseByIdApi } from '../../../services/api';

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
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadCourseDetails = async () => {
    try {
      setIsLoading(true);
      const data = await getCourseByIdApi(courseId);
      setCourse(data);
    } catch (error) {
      console.error('Error loading course details:', error);
      Alert.alert('Error', 'Failed to load course details');
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
        <ActivityIndicator size="large" color="#5B43D5" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>Course not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Details</Text>
        {(userRole === 'admin' || userRole === 'prof') && (
          <TouchableOpacity onPress={handleEdit} style={styles.editBtn}>
            <Ionicons name="create-outline" size={24} color="#5B43D5" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Course Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Name</Text>
          <Text style={styles.courseName}>{course.name}</Text>
        </View>

        {/* Description */}
        {course.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{course.description}</Text>
          </View>
        )}

        {/* Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${course.progress || 0}%` }]} />
            </View>
            <Text style={styles.progressText}>{course.progress || 0}%</Text>
          </View>
        </View>

        {/* Next Lesson */}
        {course.nextLesson && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Lesson</Text>
            <Text style={styles.nextLessonText}>{course.nextLesson}</Text>
          </View>
        )}

        {/* Teacher */}
        {course.teacher && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teacher</Text>
            <View style={styles.teacherCard}>
              <View style={styles.teacherIcon}>
                <Ionicons name="person" size={24} color="#5B43D5" />
              </View>
              <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>
                  {course.teacher.firstName} {course.teacher.lastName}
                </Text>
                <Text style={styles.teacherEmail}>{course.teacher.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Students */}
        {course.students && course.students.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Students ({course.students.length})
              </Text>
              {(userRole === 'admin' || userRole === 'prof') && (
                <TouchableOpacity 
                  style={styles.manageButton}
                  onPress={handleManageStudents}
                >
                  <Ionicons name="settings-outline" size={20} color="#5B43D5" />
                  <Text style={styles.manageButtonText}>Manage</Text>
                </TouchableOpacity>
              )}
            </View>
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
                  View all {course.students.length} students
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#5B43D5" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.metadataRow}>
            <Ionicons name="calendar-outline" size={18} color="#666" />
            <Text style={styles.metadataText}>
              Created: {new Date(course.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Ionicons name="time-outline" size={18} color="#666" />
            <Text style={styles.metadataText}>
              Last Updated: {new Date(course.updatedAt).toLocaleDateString()}
            </Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#5B43D5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  editBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5B43D5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B43D5',
    minWidth: 50,
    textAlign: 'right',
  },
  nextLessonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teacherIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
    color: '#666',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  studentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 13,
    color: '#999',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F0EBFF',
    borderRadius: 8,
  },
  manageButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B43D5',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B43D5',
  },
});
