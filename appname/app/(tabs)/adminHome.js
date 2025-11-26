import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllUsersApi, getAllProfsApi, getAllCoursesApi, getAllEventsApi, getRecentActivityApi } from '../../services/api';

const AdminHomeScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({
    studentsCount: 0,
    professorsCount: 0,
    coursesCount: 0,
    eventsCount: 0
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
        // Redirect based on role
        if (parsedUser.role === 'user') {
          router.replace('/(tabs)/home');
          return;
        }
        if (parsedUser.role === 'prof') {
          router.replace('/(tabs)/profHome');
          return;
        }
        // Only allow admins
        if (parsedUser.role !== 'admin') {
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
      const [usersRes, profsRes, coursesRes, eventsRes, activityRes] = await Promise.all([
        getAllUsersApi(),
        getAllProfsApi(),
        getAllCoursesApi(),
        getAllEventsApi(),
        getRecentActivityApi(10)
      ]);

      const users = usersRes.users || usersRes || [];
      const profs = profsRes.profs || profsRes || [];
      const courses = coursesRes.courses || coursesRes || [];
      const events = eventsRes.calendriers || eventsRes.events || eventsRes || [];

      // Filter students only (role = 'user')
      const students = users.filter(u => u.role === 'user');

      setStats({
        studentsCount: students.length,
        professorsCount: profs.length,
        coursesCount: courses.length,
        eventsCount: events.length
      });

      // Set recent activities
      if (activityRes && activityRes.activities) {
        setRecentActivities(activityRes.activities);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 30) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return past.toLocaleDateString('fr-FR');
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
        <ActivityIndicator size="large" color="#DC143C" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC143C']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="shield-checkmark" size={32} color="#DC143C" />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Tableau de Bord</Text>
            <Text style={styles.userName}>Administrateur</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => router.push('/(screens)/profile')} 
            style={styles.profileButton}
          >
            <Ionicons name="person-circle-outline" size={28} color="#DC143C" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#DC143C" />
          </TouchableOpacity>
        </View>
      </View>

      {/* System Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="people" size={32} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.studentsCount}</Text>
          <Text style={styles.statLabel}>Étudiants</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFE0E0' }]}>
          <Ionicons name="school" size={32} color="#DC143C" />
          <Text style={styles.statNumber}>{stats.professorsCount}</Text>
          <Text style={styles.statLabel}>Professeurs</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF4E0' }]}>
          <Ionicons name="book" size={32} color="#FFA000" />
          <Text style={styles.statNumber}>{stats.coursesCount}</Text>
          <Text style={styles.statLabel}>Cours</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="calendar" size={32} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.eventsCount}</Text>
          <Text style={styles.statLabel}>Événements</Text>
        </View>
      </View>

      {/* Management Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gestion Système</Text>
        
        <TouchableOpacity 
          style={styles.managementCard}
          onPress={() => router.push('/(screens)/users/list')}
        >
          <View style={[styles.managementIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="people" size={28} color="#2196F3" />
          </View>
          <View style={styles.managementContent}>
            <Text style={styles.managementTitle}>Gestion des Utilisateurs</Text>
            <Text style={styles.managementSubtitle}>Étudiants, professeurs, admins</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.managementCard}
          onPress={() => router.push('/(screens)/courses/list')}
        >
          <View style={[styles.managementIcon, { backgroundColor: '#FFF4E0' }]}>
            <Ionicons name="book" size={28} color="#FFA000" />
          </View>
          <View style={styles.managementContent}>
            <Text style={styles.managementTitle}>Gestion des Cours</Text>
            <Text style={styles.managementSubtitle}>Créer, modifier, supprimer</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.managementCard}
          onPress={() => router.push('/(screens)/resources/list')}
        >
          <View style={[styles.managementIcon, { backgroundColor: '#E0F4FF' }]}>
            <Ionicons name="folder-open" size={28} color="#2196F3" />
          </View>
          <View style={styles.managementContent}>
            <Text style={styles.managementTitle}>Gestion des Ressources</Text>
            <Text style={styles.managementSubtitle}>Documents et fichiers</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.managementCard}
          onPress={() => router.push('/(screens)/calendar/list')}
        >
          <View style={[styles.managementIcon, { backgroundColor: '#FFF4E0' }]}>
            <Ionicons name="calendar" size={28} color="#FFA000" />
          </View>
          <View style={styles.managementContent}>
            <Text style={styles.managementTitle}>Calendrier des Événements</Text>
            <Text style={styles.managementSubtitle}>Examens, cours, projets</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.managementCard}
          onPress={() => router.push('/(screens)/notifications/list')}
        >
          <View style={[styles.managementIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="notifications" size={28} color="#4CAF50" />
          </View>
          <View style={styles.managementContent}>
            <Text style={styles.managementTitle}>Gestion des Notifications</Text>
            <Text style={styles.managementSubtitle}>Envoyer et gérer</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.managementCard}>
          <View style={[styles.managementIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="stats-chart" size={28} color="#4CAF50" />
          </View>
          <View style={styles.managementContent}>
            <Text style={styles.managementTitle}>Statistiques</Text>
            <Text style={styles.managementSubtitle}>Rapports et analyses</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.managementCard}>
          <View style={[styles.managementIcon, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="settings" size={28} color="#9C27B0" />
          </View>
          <View style={styles.managementContent}>
            <Text style={styles.managementTitle}>Paramètres Système</Text>
            <Text style={styles.managementSubtitle}>Configuration générale</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activité Récente</Text>
        
        {recentActivities.length === 0 ? (
          <View style={styles.activityCard}>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Aucune activité récente</Text>
            </View>
          </View>
        ) : (
          recentActivities.slice(0, 5).map((activity, index) => (
            <View key={index} style={styles.activityCard}>
              <View style={[styles.activityDot, { backgroundColor: activity.color }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{getTimeAgo(activity.timestamp)}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* System Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>État du Système</Text>
        
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Serveur</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.statusText}>En ligne</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Base de données</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.statusText}>Connecté</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Espace de stockage</Text>
            <Text style={styles.statusValue}>65% utilisé</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 15,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC143C',
    marginTop: 2,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    paddingBottom: 5,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    margin: '1.5%',
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 13,
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
  managementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  managementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  managementContent: {
    flex: 1,
  },
  managementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  managementSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusLabel: {
    fontSize: 15,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default AdminHomeScreen;
