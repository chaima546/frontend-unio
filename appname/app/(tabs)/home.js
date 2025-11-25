import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllCoursesApi, getAllEventsApi, getAllNotificationsApi } from '../../services/api';

const StudentHomeScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    coursesCount: 0,
    upcomingExams: 0,
    unreadNotifications: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('unistudious_user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        router.replace('/(auth)/studentLogin');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [coursesRes, eventsRes, notificationsRes] = await Promise.all([
        getAllCoursesApi(),
        getAllEventsApi(),
        getAllNotificationsApi()
      ]);

      const courses = coursesRes.courses || coursesRes || [];
      const events = eventsRes.calendriers || eventsRes.events || eventsRes || [];
      const notifications = notificationsRes.notifications || notificationsRes || [];

      // Count upcoming exams
      const now = new Date();
      const upcomingExams = events.filter(e => 
        e.type === 'examen' && new Date(e.debut) > now
      ).length;

      // Count unread notifications (assuming all are unread for now)
      const unreadCount = notifications.length;

      setStats({
        coursesCount: courses.length,
        upcomingExams,
        unreadNotifications: unreadCount
      });

      // Get first 2 courses for display
      setRecentCourses(courses.slice(0, 2));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      // Clear all authentication data
      await AsyncStorage.multiRemove([
        'unistudious_user_token',
        'unistudious_user_data',
        'userRole'
      ]);
      
      // Redirect to welcome screen
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
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
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B43D5']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userLevel}>{user?.niveauScolaire} {user?.section}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#5B43D5" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#E8E0FF' }]}>
          <Ionicons name="book" size={28} color="#5B43D5" />
          <Text style={styles.statNumber}>{stats.coursesCount}</Text>
          <Text style={styles.statLabel}>Cours</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFE8E0' }]}>
          <Ionicons name="calendar" size={28} color="#FF6B35" />
          <Text style={styles.statNumber}>{stats.upcomingExams}</Text>
          <Text style={styles.statLabel}>Examens</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E0F4FF' }]}>
          <Ionicons name="notifications" size={28} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.unreadNotifications}</Text>
          <Text style={styles.statLabel}>Alertes</Text>
        </View>
      </View>

      {/* Quick Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accès Rapide</Text>
        
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => router.push('/(screens)/courses/list')}
          >
            <Ionicons name="book-outline" size={32} color="#5B43D5" />
            <Text style={styles.quickAccessText}>Mes Cours</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => router.push('/(screens)/calendar/list')}
          >
            <Ionicons name="calendar-outline" size={32} color="#FF6B35" />
            <Text style={styles.quickAccessText}>Calendrier</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => router.push('/(screens)/resources/list')}
          >
            <Ionicons name="document-text-outline" size={32} color="#FFA000" />
            <Text style={styles.quickAccessText}>Ressources</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => router.push('/(screens)/notifications/list')}
          >
            <Ionicons name="notifications-outline" size={32} color="#4CAF50" />
            <Text style={styles.quickAccessText}>Notifications</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* My Courses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes Cours</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <View>
              <Text style={styles.courseTitle}>Physique - Mécanique</Text>
              <Text style={styles.courseProf}>Dr. Khaled Salah</Text>
            </View>
            <View style={[styles.courseBadge, { backgroundColor: '#E8E0FF' }]}>
              <Text style={[styles.courseBadgeText, { color: '#5B43D5' }]}>45%</Text>
            </View>
          </View>
          <View style={styles.courseFooter}>
            <View style={styles.courseInfo}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.courseInfoText}>Prochaine séance: Demain 10h</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <View>
              <Text style={styles.courseTitle}>Développement Web</Text>
              <Text style={styles.courseProf}>Dr. Nabil Zaied</Text>
            </View>
            <View style={[styles.courseBadge, { backgroundColor: '#FFE8E0' }]}>
              <Text style={[styles.courseBadgeText, { color: '#FF6B35' }]}>30%</Text>
            </View>
          </View>
          <View style={styles.courseFooter}>
            <View style={styles.courseInfo}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.courseInfoText}>Prochaine séance: Mercredi 14h</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Événements à Venir</Text>
        
        <View style={styles.eventCard}>
          <View style={[styles.eventDate, { backgroundColor: '#DC143C' }]}>
            <Text style={styles.eventDay}>25</Text>
            <Text style={styles.eventMonth}>OCT</Text>
          </View>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>Examen de Physique</Text>
            <Text style={styles.eventTime}>10:00 - 12:00</Text>
            <Text style={styles.eventLocation}>Salle A12</Text>
          </View>
        </View>

        <View style={styles.eventCard}>
          <View style={[styles.eventDate, { backgroundColor: '#FFA000' }]}>
            <Text style={styles.eventDay}>28</Text>
            <Text style={styles.eventMonth}>OCT</Text>
          </View>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>Projet Web - Deadline</Text>
            <Text style={styles.eventTime}>23:59</Text>
            <Text style={styles.eventLocation}>Soumission en ligne</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 5,
  },
  userLevel: {
    fontSize: 14,
    color: '#5B43D5',
    marginTop: 2,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  seeAllText: {
    color: '#5B43D5',
    fontSize: 14,
    fontWeight: '600',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  quickAccessText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  courseProf: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  courseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  courseBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseInfoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  eventDate: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventDay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventContent: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  eventTime: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  eventLocation: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
});

export default StudentHomeScreen;