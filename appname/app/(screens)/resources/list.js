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
  TextInput,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllResourcesApi, deleteResourceApi } from '../../../services/api';

export default function ResourcesList() {
  const router = useRouter();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadResources();
    }, [])
  );

  useEffect(() => {
    filterResources();
  }, [searchQuery, resources]);

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

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const response = await getAllResourcesApi();
      const resourcesData = response.ressources || response.data || response || [];
      setResources(resourcesData);
      setFilteredResources(resourcesData);
    } catch (error) {
      console.error('Error loading resources:', error);
      Alert.alert('Erreur', 'Impossible de charger les ressources');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResources();
    setRefreshing(false);
  };

  const filterResources = () => {
    if (!searchQuery.trim()) {
      setFilteredResources(resources);
      return;
    }

    const filtered = resources.filter(resource =>
      resource.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredResources(filtered);
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
              await deleteResourceApi(id);
              Alert.alert('Succès', 'Ressource supprimée');
              loadResources();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la ressource');
            }
          },
        },
      ]
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      file: 'document-text',
      link: 'link',
      video: 'videocam',
      image: 'image',
    };
    return icons[type] || 'document';
  };

  const getTypeColor = (type) => {
    const colors = {
      file: '#FF6B35',
      link: '#4ECDC4',
      video: '#FF4757',
      image: '#5F27CD',
    };
    return colors[type] || '#95A5A6';
  };

  const renderResource = ({ item }) => (
    <View style={styles.resourceCard}>
      <View style={styles.resourceHeader}>
        <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) }]}>
          <Ionicons name={getTypeIcon(item.type)} size={24} color="#FFF" />
        </View>
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceTitle}>{item.titre}</Text>
          <Text style={styles.resourceType}>{item.type?.toUpperCase()}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.resourceDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.courseId?.name && (
        <View style={styles.courseTag}>
          <Ionicons name="book-outline" size={14} color="#5B43D5" />
          <Text style={styles.courseText}>{item.courseId.name}</Text>
        </View>
      )}

      {item.uploadedByProf && (
        <View style={styles.profTag}>
          <Ionicons name="person-outline" size={14} color="#FF6B35" />
          <Text style={styles.profText}>
            {item.uploadedByProf.firstName} {item.uploadedByProf.lastName}
          </Text>
        </View>
      )}

      <View style={styles.resourceActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => Alert.alert('URL', item.url)}
        >
          <Ionicons name="eye-outline" size={20} color="#5B43D5" />
          <Text style={styles.viewButtonText}>Voir</Text>
        </TouchableOpacity>

        {userRole !== 'user' && (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push({
                pathname: '/(screens)/resources/create',
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
          </>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5B43D5" />
        <Text style={styles.loadingText}>Chargement des ressources...</Text>
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
        <Text style={styles.headerTitle}>Ressources</Text>
        {userRole !== 'user' && (
          <TouchableOpacity
            onPress={() => router.push('/(screens)/resources/create')}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={32} color="#5B43D5" />
          </TouchableOpacity>
        )}
        {userRole === 'user' && <View style={{ width: 32 }} />}
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#95A5A6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une ressource..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#95A5A6" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredResources.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredResources.filter(r => r.type === 'file').length}
          </Text>
          <Text style={styles.statLabel}>Fichiers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredResources.filter(r => r.type === 'video').length}
          </Text>
          <Text style={styles.statLabel}>Vidéos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredResources.filter(r => r.type === 'link').length}
          </Text>
          <Text style={styles.statLabel}>Liens</Text>
        </View>
      </View>

      <FlatList
        data={filteredResources}
        renderItem={renderResource}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B43D5']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={80} color="#BDC3C7" />
            <Text style={styles.emptyText}>Aucune ressource trouvée</Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? 'Essayez une autre recherche' : 'Créez votre première ressource'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
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
  resourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 2,
    shadowColor: '#FFA502',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  resourceHeader: {
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
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  resourceType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#95A5A6',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 10,
    lineHeight: 20,
  },
  courseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E0FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  courseText: {
    fontSize: 12,
    color: '#5B43D5',
    marginLeft: 5,
    fontWeight: '600',
  },
  profTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  profText: {
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 5,
    fontWeight: '600',
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E0FF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#5B43D5',
    marginLeft: 5,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8E0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
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
