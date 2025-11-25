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
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllEventsApi, deleteEventApi } from '../../../services/api';

export default function CalendarList() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, personnel, classe, projet, examen
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
    }, [])
  );

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

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await getAllEventsApi();
      const eventsData = response.calendriers || response.data || response || [];
      
      // Sort events by date
      const sortedEvents = eventsData.sort((a, b) => 
        new Date(a.debut) - new Date(b.debut)
      );
      
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleDelete = (id, titre) => {
    Alert.alert(
      'Confirmation',
      `Voulez-vous vraiment supprimer "${titre}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEventApi(id);
              Alert.alert('Succès', 'Événement supprimé');
              loadEvents();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'événement');
            }
          },
        },
      ]
    );
  };

  const getTypeColor = (type) => {
    const colors = {
      personnel: '#3498DB',
      classe: '#2ECC71',
      projet: '#F39C12',
      examen: '#E74C3C',
    };
    return colors[type] || '#95A5A6';
  };

  const getTypeIcon = (type) => {
    const icons = {
      personnel: 'person',
      classe: 'people',
      projet: 'folder',
      examen: 'school',
    };
    return icons[type] || 'calendar';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.type === filter);

  const upcomingCount = events.filter(e => isUpcoming(e.debut)).length;

  const renderEvent = ({ item }) => {
    const upcoming = isUpcoming(item.debut);
    
    return (
      <View
        style={[styles.eventCard, !upcoming && styles.pastEvent]}
      >
        <View style={styles.eventHeader}>
          <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]}>
            <Ionicons name={getTypeIcon(item.type)} size={24} color="#FFF" />
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{item.titre}</Text>
            <Text style={[styles.eventType, { color: getTypeColor(item.type) }]}>
              {item.type?.toUpperCase()}
            </Text>
          </View>
          {!upcoming && (
            <View style={styles.pastBadge}>
              <Text style={styles.pastBadgeText}>Passé</Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.dateContainer}>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={16} color="#5B43D5" />
            <Text style={styles.dateText}>Début: {formatDate(item.debut)}</Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="flag-outline" size={16} color="#FF6B35" />
            <Text style={styles.dateText}>Fin: {formatDate(item.fin)}</Text>
          </View>
        </View>

        {item.courseId?.name && (
          <View style={styles.courseTag}>
            <Ionicons name="book-outline" size={14} color="#5B43D5" />
            <Text style={styles.courseText}>{item.courseId.name}</Text>
          </View>
        )}

        {userRole !== 'user' && (
          <View style={styles.eventActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push({
                pathname: '/(screens)/calendar/create',
                params: { id: item._id }
              })}
            >
              <Ionicons name="pencil-outline" size={20} color="#FF6B35" />
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item._id, item.titre)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4757" />
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5B43D5" />
        <Text style={styles.loadingText}>Chargement du calendrier...</Text>
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
        <Text style={styles.headerTitle}>Calendrier</Text>
        {userRole !== 'user' && (
          <TouchableOpacity
            onPress={() => router.push('/(screens)/calendar/create')}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={32} color="#5B43D5" />
          </TouchableOpacity>
        )}
        {userRole === 'user' && <View style={{ width: 32 }} />}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{events.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#2ECC71' }]}>{upcomingCount}</Text>
          <Text style={styles.statLabel}>À venir</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#E74C3C' }]}>
            {events.filter(e => e.type === 'examen').length}
          </Text>
          <Text style={styles.statLabel}>Examens</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#F39C12' }]}>
            {events.filter(e => e.type === 'projet').length}
          </Text>
          <Text style={styles.statLabel}>Projets</Text>
        </View>
      </View>

      <ScrollView 
        horizontal 
        style={styles.filterContainer}
        showsHorizontalScrollIndicator={false}
      >
        {[
          { key: 'all', label: 'Tous', icon: 'apps' },
          { key: 'personnel', label: 'Personnel', icon: 'person' },
          { key: 'classe', label: 'Classe', icon: 'people' },
          { key: 'projet', label: 'Projet', icon: 'folder' },
          { key: 'examen', label: 'Examen', icon: 'school' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.filterButton,
              filter === item.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(item.key)}
          >
            <Ionicons
              name={item.icon}
              size={18}
              color={filter === item.key ? '#FFF' : '#5B43D5'}
            />
            <Text
              style={[
                styles.filterButtonText,
                filter === item.key && styles.filterButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B43D5']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color="#BDC3C7" />
            <Text style={styles.emptyText}>Aucun événement trouvé</Text>
            <Text style={styles.emptySubText}>Créez votre premier événement</Text>
          </View>
        }
      />
    </View>
  );
}

// Missing ScrollView import
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5B43D5',
  },
  statLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginTop: 3,
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#5B43D5',
  },
  filterButtonActive: {
    backgroundColor: '#5B43D5',
    borderColor: '#5B43D5',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B43D5',
    marginLeft: 5,
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  listContainer: {
    padding: 15,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 2,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  pastEvent: {
    opacity: 0.6,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeIndicator: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 6,
    lineHeight: 24,
  },
  eventType: {
    fontSize: 12,
    fontWeight: '600',
  },
  pastBadge: {
    backgroundColor: '#95A5A6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pastBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 10,
    lineHeight: 20,
  },
  dateContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 13,
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
  },
  courseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E0FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  courseText: {
    fontSize: 12,
    color: '#5B43D5',
    marginLeft: 5,
    fontWeight: '600',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8E0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
  },
  editButtonText: {
    color: '#FF6B35',
    marginLeft: 5,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE0E0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
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
