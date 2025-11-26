import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfDashboardApi } from '../../services/api';

const ProfHomeScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    coursesCount: 0,
    studentsCount: 0,
    resourcesCount: 0
  });

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
        const parsedUser = JSON.parse(userData);
        // Redirect students to their dashboard
        if (parsedUser.role === 'user') {
          router.replace('/(tabs)/home');
          return;
        }
        // Only allow professors
        if (parsedUser.role !== 'prof') {
          router.replace('/(auth)/studentLogin');
          return;
        }
        setUser(parsedUser);
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
      const dashboardData = await getProfDashboardApi();
      
      // Use stats from backend response
      if (dashboardData.stats) {
        setStats({
          coursesCount: dashboardData.stats.totalCourses || 0,
          studentsCount: dashboardData.stats.totalStudents || 0,
          resourcesCount: dashboardData.stats.totalResources || 0
        });
      }
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
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, Professeur</Text>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => router.push('/(screens)/profile')} 
            style={styles.profileButton}
          >
            <Ionicons name="person-circle-outline" size={28} color="#FF6B35" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#FFE8E0' }]}>
          <Ionicons name="book" size={32} color="#FF6B35" />
          <Text style={styles.statNumber}>{stats.coursesCount}</Text>
          <Text style={styles.statLabel}>Cours</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E0F4FF' }]}>
          <Ionicons name="people" size={32} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.studentsCount}</Text>
          <Text style={styles.statLabel}>Étudiants</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF4E0' }]}>
          <Ionicons name="document-text" size={32} color="#FFA000" />
          <Text style={styles.statNumber}>{stats.resourcesCount}</Text>
          <Text style={styles.statLabel}>Ressources</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions Rapides</Text>
        
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(screens)/courses/create')}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFE8E0' }]}>
            <Ionicons name="add-circle" size={28} color="#FF6B35" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Créer un cours</Text>
            <Text style={styles.actionSubtitle}>Ajouter un nouveau cours</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(screens)/courses/list')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E0F4FF' }]}>
            <Ionicons name="list" size={28} color="#2196F3" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Gérer les cours</Text>
            <Text style={styles.actionSubtitle}>Voir tous les cours</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(screens)/resources/create')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E0F4FF' }]}>
            <Ionicons name="cloud-upload" size={28} color="#2196F3" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Ajouter une ressource</Text>
            <Text style={styles.actionSubtitle}>Documents, vidéos, liens</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(screens)/resources/list')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E0F4FF' }]}>
            <Ionicons name="folder-open" size={28} color="#2196F3" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Gérer les ressources</Text>
            <Text style={styles.actionSubtitle}>Voir toutes les ressources</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(screens)/calendar/create')}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFF4E0' }]}>
            <Ionicons name="calendar" size={28} color="#FFA000" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Planifier un événement</Text>
            <Text style={styles.actionSubtitle}>Examen, TD, cours...</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(screens)/calendar/list')}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFF4E0' }]}>
            <Ionicons name="calendar-outline" size={28} color="#FFA000" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Voir le calendrier</Text>
            <Text style={styles.actionSubtitle}>Tous les événements</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(screens)/notifications/create')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="notifications" size={28} color="#4CAF50" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Envoyer une notification</Text>
            <Text style={styles.actionSubtitle}>Informer vos étudiants</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(screens)/notifications/list')}>
          <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="notifications-outline" size={28} color="#4CAF50" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Voir les notifications</Text>
            <Text style={styles.actionSubtitle}>Historique des notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* My Courses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Cours</Text>
        
        <TouchableOpacity style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>Développement Web</Text>
            <View style={styles.courseBadge}>
              <Text style={styles.courseBadgeText}>3ème Info</Text>
            </View>
          </View>
          <Text style={styles.courseStudents}>32 étudiants inscrits</Text>
          <View style={styles.courseProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '45%' }]} />
            </View>
            <Text style={styles.progressText}>45%</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>Algorithmique</Text>
            <View style={styles.courseBadge}>
              <Text style={styles.courseBadgeText}>Bac Math</Text>
            </View>
          </View>
          <Text style={styles.courseStudents}>28 étudiants inscrits</Text>
          <View style={styles.courseProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressText}>60%</Text>
          </View>
        </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  profileButton: {
    padding: 10,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  courseBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  courseBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  courseStudents: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  courseProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});

export default ProfHomeScreen;
