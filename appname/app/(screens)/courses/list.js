import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllCoursesApi, deleteCourseApi } from '../../../services/api';

const CoursesListScreen = () => {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCourses();
    }, [])
  );

  const loadUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      console.log('📌 User Role Loaded:', role);
      setUserRole(role);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await getAllCoursesApi();
      setCourses(data.courses || data);
    } catch (error) {
      console.error('Error loading courses:', error);
      Alert.alert('Erreur', 'Impossible de charger les cours');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses();
  };

  const handleDelete = (courseId, courseName) => {
    Alert.alert(
      'Supprimer le cours',
      `Êtes-vous sûr de vouloir supprimer "${courseName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCourseApi(courseId);
              Alert.alert('Succès', 'Cours supprimé');
              loadCourses();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le cours');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (course) => {
    router.push({
      pathname: '/(screens)/courses/edit',
      params: { courseId: course._id }
    });
  };

  const handleViewDetails = (course) => {
    router.push({
      pathname: '/(screens)/courses/details',
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/home');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tous les Cours</Text>
        <TouchableOpacity
          onPress={() => router.push('/(screens)/courses/create')}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={28} color="#5B43D5" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {courses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Aucun cours disponible</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(screens)/courses/create')}
            >
              <Text style={styles.createButtonText}>Créer un cours</Text>
            </TouchableOpacity>
          </View>
        ) : (
          courses.map((course) => (
            <TouchableOpacity
              key={course._id}
              style={styles.courseCard}
              onPress={() => handleViewDetails(course)}
            >
              <View style={styles.courseHeader}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.courseDescription} numberOfLines={2}>
                    {course.description || 'Aucune description'}
                  </Text>
                  <View style={styles.courseStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="people" size={16} color="#666" />
                      <Text style={styles.statText}>
                        {course.students?.length || 0} étudiants
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="person" size={16} color="#666" />
                      <Text style={styles.statText}>
                        {course.teacher?.firstName || 'Prof'} {course.teacher?.lastName || ''}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>{course.progress || 0}%</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${course.progress || 0}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>

              {userRole !== 'user' && (
                <View style={styles.courseActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(course)}
                  >
                    <Ionicons name="create-outline" size={20} color="#5B43D5" />
                    <Text style={styles.actionButtonText}>Modifier</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(course._id, course.name)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#DC143C" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                      Supprimer
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#5B43D5',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  courseInfo: {
    flex: 1,
    marginRight: 15,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  courseStats: {
    flexDirection: 'row',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  progressContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  progressText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5B43D5',
    marginBottom: 5,
  },
  progressBar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5B43D5',
  },
  courseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F0F0FF',
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B43D5',
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: '#FFE0E0',
  },
  deleteButtonText: {
    color: '#DC143C',
  },
});

export default CoursesListScreen;
