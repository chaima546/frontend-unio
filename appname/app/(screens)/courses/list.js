import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllCoursesApi, deleteCourseApi } from '../../../services/api';

const { width, height } = Dimensions.get('window');

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
      const userData = await AsyncStorage.getItem('unistudious_user_data');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('📌 User Role Loaded:', user.role);
        setUserRole(user.role);
      }
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
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Chargement des cours...</Text>
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Mes Cours</Text>
          {courses.length > 0 && (
            <View style={styles.courseBadge}>
              <Text style={styles.courseBadgeText}>{courses.length}</Text>
            </View>
          )}
        </View>
        {userRole !== 'user' && (
          <TouchableOpacity
            onPress={() => router.push('/(screens)/courses/create')}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        {userRole === 'user' && <View style={{ width: 28 }} />}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {courses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="book-outline" size={80} color="#6C5CE7" />
            </View>
            <Text style={styles.emptyTitle}>Aucun cours disponible</Text>
            <Text style={styles.emptySubtitle}>Les cours apparaîtront ici une fois ajoutés</Text>
            {userRole !== 'user' && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/(screens)/courses/create')}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Créer un cours</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          courses.map((course) => (
            <TouchableOpacity
              key={course._id}
              style={styles.courseCard}
              onPress={() => handleViewDetails(course)}
              activeOpacity={0.7}
            >
              <View style={styles.courseIconBadge}>
                <Ionicons name="book" size={24} color="#6C5CE7" />
              </View>
              
              <View style={styles.courseHeader}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.courseDescription} numberOfLines={2}>
                    {course.description || 'Aucune description'}
                  </Text>
                  <View style={styles.courseStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="people" size={16} color="#6C5CE7" />
                      <Text style={styles.statText}>
                        {course.students?.length || 0} étudiants
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="person" size={16} color="#FFA502" />
                      <Text style={styles.statText}>
                        {course.teacher?.firstName || 'Prof'} {course.teacher?.lastName || ''}
                        {course.teacher?.speciality && ` • ${course.teacher.speciality}`}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.circularProgress}>
                    <Text style={styles.progressText}>{course.progress || 0}%</Text>
                  </View>
                  <Text style={styles.progressLabel}>Progression</Text>
                </View>
              </View>

              {userRole !== 'user' && (
                <View style={styles.courseActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEdit(course);
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color="#6C5CE7" />
                    <Text style={styles.actionButtonText}>Modifier</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDelete(course._id, course.name);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  courseBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  courseBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  addButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 2,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#6C5CE7',
  },
  courseIconBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  courseInfo: {
    flex: 1,
    marginRight: 16,
  },
  courseName: {
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 6,
    lineHeight: 24,
  },
  courseDescription: {
    fontSize: Math.min(width * 0.036, 15),
    color: '#636E72',
    marginBottom: 12,
    lineHeight: 20,
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
    color: '#636E72',
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
    minWidth: 70,
  },
  circularProgress: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#6C5CE7',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6C5CE7',
  },
  progressLabel: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 6,
    fontWeight: '600',
  },
  courseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F0EBFF',
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C5CE7',
  },
  deleteButton: {
    backgroundColor: '#FFF0F0',
  },
  deleteButtonText: {
    color: '#FF6B6B',
  },
});

export default CoursesListScreen;
