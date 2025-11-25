import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllNotificationsApi, deleteNotificationApi } from '../../../services/api';

export default function NotificationsList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await getAllNotificationsApi();
      const notificationsData = response.notifications || response.data || response || [];
      
      // Sort by date (newest first)
      const sortedNotifications = notificationsData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Erreur', 'Impossible de charger les notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      'Confirmation',
      `Voulez-vous vraiment supprimer cette notification ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotificationApi(id);
              Alert.alert('Succès', 'Notification supprimée');
              loadNotifications();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la notification');
            }
          },
        },
      ]
    );
  };

  const getTypeColor = (type) => {
    const colors = {
      resource_added: '#3498DB',
      project_assigned: '#F39C12',
      grade_posted: '#2ECC71',
      general: '#9B59B6',
    };
    return colors[type] || '#95A5A6';
  };

  const getTypeIcon = (type) => {
    const icons = {
      resource_added: 'folder-open',
      project_assigned: 'briefcase',
      grade_posted: 'trophy',
      general: 'notifications',
    };
    return icons[type] || 'information-circle';
  };

  const getTypeLabel = (type) => {
    const labels = {
      resource_added: 'Ressource',
      project_assigned: 'Projet',
      grade_posted: 'Note',
      general: 'Général',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => {
        if (item.link) {
          Alert.alert('Notification', `Lien: ${item.link}`);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) }]}>
          <Ionicons name={getTypeIcon(item.type)} size={24} color="#FFF" />
        </View>
        <View style={styles.notificationInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationTime}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.typeBadge}>
        <Text style={[styles.typeBadgeText, { color: getTypeColor(item.type) }]}>
          {getTypeLabel(item.type)}
        </Text>
      </View>

      {item.sender && (
        <View style={styles.senderTag}>
          <Ionicons name="person-outline" size={14} color="#FF6B35" />
          <Text style={styles.senderText}>
            {item.sender.firstName} {item.sender.lastName}
          </Text>
        </View>
      )}

      {item.relatedCourse?.name && (
        <View style={styles.courseTag}>
          <Ionicons name="book-outline" size={14} color="#5B43D5" />
          <Text style={styles.courseText}>{item.relatedCourse.name}</Text>
        </View>
      )}

      {item.link && (
        <View style={styles.linkContainer}>
          <Ionicons name="link-outline" size={14} color="#3498DB" />
          <Text style={styles.linkText} numberOfLines={1}>{item.link}</Text>
        </View>
      )}

      {userRole !== 'user' && (
        <View style={styles.notificationActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item._id, item.title)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4757" />
            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5B43D5" />
        <Text style={styles.loadingText}>Chargement des notifications...</Text>
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
            router.replace('/(tabs)/home');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={() => router.push('/(screens)/notifications/create')}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={32} color="#5B43D5" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{notifications.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#E74C3C' }]}>{unreadCount}</Text>
          <Text style={styles.statLabel}>Non lues</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#2ECC71' }]}>
            {notifications.length - unreadCount}
          </Text>
          <Text style={styles.statLabel}>Lues</Text>
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B43D5']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color="#BDC3C7" />
            <Text style={styles.emptyText}>Aucune notification</Text>
            <Text style={styles.emptySubText}>Vous êtes à jour !</Text>
          </View>
        }
      />
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
  },
  statBox: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5B43D5',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  notificationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E74C3C',
    marginLeft: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  senderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  senderText: {
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 5,
    fontWeight: '600',
  },
  courseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E0FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  courseText: {
    fontSize: 12,
    color: '#5B43D5',
    marginLeft: 5,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  linkText: {
    fontSize: 12,
    color: '#3498DB',
    marginLeft: 5,
    flex: 1,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE0E0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FF4757',
    marginLeft: 5,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#95A5A6',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 10,
  },
});
