import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllCoursesApi, getAllEventsApi, getAllNotificationsApi } from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 55) / 2;

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
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user && user.role === 'user') {
      loadDashboardData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('unistudious_user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('Student Home - User role:', parsedUser.role);
        
        // Redirect admins and professors to their dashboards
        if (parsedUser.role === 'admin') {
          console.log('Redirecting admin to adminHome');
          router.replace('/(tabs)/adminHome');
          return;
        }
        if (parsedUser.role === 'prof') {
          console.log('Redirecting prof to profHome');
          router.replace('/(tabs)/profHome');
          return;
        }
        // Only set user if they are a student
        if (parsedUser.role === 'user') {
          console.log('Loading student dashboard');
          setUser(parsedUser);
        } else {
          console.log('Unknown role, redirecting to login');
          router.replace('/(auth)/studentLogin');
        }
      } else {
        console.log('No user data, redirecting to login');
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
      );

      // Count unread notifications
      const unreadCount = notifications.filter(n => !n.isRead).length;

      setStats({
        coursesCount: courses.length,
        upcomingExams: upcomingExams.length,
        unreadNotifications: unreadCount
      });

      // Get first 3 courses for display
      setRecentCourses(courses.slice(0, 3));
      
      // Get next 3 upcoming events
      const sortedEvents = events
        .filter(e => new Date(e.debut) > now)
        .sort((a, b) => new Date(a.debut) - new Date(b.debut))
        .slice(0, 3);
      setUpcomingEvents(sortedEvents);
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
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
    };
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6C5CE7" />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C5CE7']} />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#6C5CE7', '#A29BFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Bonjour 👋</Text>
                <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
                <View style={styles.levelBadge}>
                  <Ionicons name="school-outline" size={14} color="#6C5CE7" />
                  <Text style={styles.userLevel}>{user?.niveauScolaire} {user?.section || ''}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
              <View style={styles.statMiniCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="book" size={20} color="#6C5CE7" />
                </View>
                <Text style={styles.statMiniNumber}>{stats.coursesCount}</Text>
                <Text style={styles.statMiniLabel}>Cours</Text>
              </View>
              <View style={styles.statMiniCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FFE8E0' }]}>
                  <Ionicons name="calendar" size={20} color="#FF6B6B" />
                </View>
                <Text style={styles.statMiniNumber}>{stats.upcomingExams}</Text>
                <Text style={styles.statMiniLabel}>Examens</Text>
              </View>
              <View style={styles.statMiniCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="notifications" size={20} color="#2196F3" />
                </View>
                <Text style={styles.statMiniNumber}>{stats.unreadNotifications}</Text>
                <Text style={styles.statMiniLabel}>Alertes</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#6C5CE7' }]}
              onPress={() => router.push('/(screens)/courses/list')}
            >
              <Ionicons name="book-outline" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Mes Cours</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
              onPress={() => router.push('/(screens)/calendar/list')}
            >
              <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Calendrier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FFA502' }]}
              onPress={() => router.push('/(screens)/resources/list')}
            >
              <MaterialCommunityIcons name="folder-open" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Ressources</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#26DE81' }]}
              onPress={() => router.push('/(screens)/notifications/list')}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Notifications</Text>
            </TouchableOpacity>
          </View>

          {/* My Courses Section */}
          {recentCourses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📚 Mes Cours</Text>
                <TouchableOpacity onPress={() => router.push('/(screens)/courses/list')}>
                  <Text style={styles.seeAllText}>Voir tout →</Text>
                </TouchableOpacity>
              </View>
              
              {recentCourses.map((course, index) => (
                <TouchableOpacity 
                  key={course._id || index} 
                  style={styles.courseCard}
                  onPress={() => router.push(`/(screens)/courses/details?id=${course._id}`)}
                >
                  <View style={styles.courseCardLeft}>
                    <View style={[styles.courseIcon, { backgroundColor: `hsl(${index * 120}, 70%, 95%)` }]}>
                      <Ionicons 
                        name="book" 
                        size={24} 
                        color={`hsl(${index * 120}, 70%, 50%)`} 
                      />
                    </View>
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseTitle} numberOfLines={1}>{course.name}</Text>
                      <Text style={styles.courseProf} numberOfLines={1}>
                        {course.teacher?.firstName} {course.teacher?.lastName}
                      </Text>
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${course.progress || 0}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{course.progress || 0}%</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🗓️ Événements à Venir</Text>
                <TouchableOpacity onPress={() => router.push('/(screens)/calendar/list')}>
                  <Text style={styles.seeAllText}>Voir tout →</Text>
                </TouchableOpacity>
              </View>
              
              {upcomingEvents.map((event, index) => {
                const dateInfo = formatDate(event.debut);
                const eventColors = {
                  'examen': '#FF6B6B',
                  'projet': '#FFA502',
                  'classe': '#6C5CE7',
                  'personnel': '#26DE81'
                };
                const color = eventColors[event.type] || '#6C5CE7';
                
                return (
                  <View key={event._id || index} style={styles.eventCard}>
                    <View style={[styles.eventDate, { backgroundColor: color }]}>
                      <Text style={styles.eventDay}>{dateInfo.day}</Text>
                      <Text style={styles.eventMonth}>{dateInfo.month}</Text>
                    </View>
                    <View style={styles.eventContent}>
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle} numberOfLines={1}>{event.titre}</Text>
                        <View style={[styles.eventTypeBadge, { backgroundColor: color + '20' }]}>
                          <Text style={[styles.eventTypeText, { color }]}>
                            {event.type?.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      {event.description && (
                        <Text style={styles.eventDescription} numberOfLines={1}>
                          {event.description}
                        </Text>
                      )}
                      <View style={styles.eventFooter}>
                        <View style={styles.eventTime}>
                          <Ionicons name="time-outline" size={14} color="#999" />
                          <Text style={styles.eventTimeText}>
                            {new Date(event.debut).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Empty State */}
          {recentCourses.length === 0 && upcomingEvents.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={80} color="#CCCCCC" />
              <Text style={styles.emptyStateTitle}>Aucune donnée disponible</Text>
              <Text style={styles.emptyStateText}>
                Vos cours et événements apparaîtront ici
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
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
    color: '#6C5CE7',
    fontWeight: '600',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: Math.min(width * 0.07, 30),
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  userLevel: {
    fontSize: 13,
    color: '#6C5CE7',
    fontWeight: '700',
    marginLeft: 6,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statMiniNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
    marginTop: 4,
  },
  statMiniLabel: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 4,
    fontWeight: '600',
  },
  mainContent: {
    padding: 20,
    paddingTop: 25,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionButton: {
    width: CARD_WIDTH,
    padding: 22,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Math.min(width * 0.052, 22),
    fontWeight: '800',
    color: '#2D3436',
    letterSpacing: 0.3,
  },
  seeAllText: {
    color: '#6C5CE7',
    fontSize: 14,
    fontWeight: '700',
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  courseCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  courseIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  courseProf: {
    fontSize: 13,
    color: '#636E72',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C5CE7',
    minWidth: 35,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  eventDate: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventDay: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  eventMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  eventContent: {
    flex: 1,
    justifyContent: 'center',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    flex: 1,
    marginRight: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  eventDescription: {
    fontSize: 13,
    color: '#636E72',
    marginBottom: 6,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTimeText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 6,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default StudentHomeScreen;