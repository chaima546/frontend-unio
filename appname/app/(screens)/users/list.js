import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllUsersApi, deleteUserApi } from '../../../services/api';

const UsersListScreen = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // all, user, prof, admin
  const [userRole, setUserRole] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    userId: null,
    userName: ''
  });

  useEffect(() => {
    loadUserRole();
  }, []);

  // Reload users whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
    }, [])
  );

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterRole, users]);

  const loadUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllUsersApi();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.niveauScolaire?.toLowerCase().includes(query) ||
        user.section?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = (userId, userName) => {
    setDeleteModal({
      visible: true,
      userId,
      userName
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteUserApi(deleteModal.userId);
      setDeleteModal({ visible: false, userId: null, userName: '' });
      
      // Show success message
      Alert.alert('Succès', 'Utilisateur supprimé avec succès', [
        {
          text: 'OK',
          onPress: () => {
            // Auto refresh the list
            loadUsers();
          }
        }
      ]);
    } catch (error) {
      console.error('Error deleting user:', error);
      setDeleteModal({ visible: false, userId: null, userName: '' });
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de supprimer l\'utilisateur');
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ visible: false, userId: null, userName: '' });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return '#DC143C';
      case 'prof': return '#FF6B35';
      case 'user': return '#4CAF50';
      default: return '#999';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'prof': return 'Professeur';
      case 'user': return 'Étudiant';
      default: return role;
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {item.firstName?.[0]}{item.lastName?.[0]}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.userMeta}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(item.role) }]}>
              <Text style={styles.roleBadgeText}>{getRoleLabel(item.role)}</Text>
            </View>
            {item.role === 'user' && (
              <Text style={styles.userLevel}>
                {item.niveauScolaire}{item.section ? ` - ${item.section}` : ''}
              </Text>
            )}
          </View>
        </View>
      </View>

      {userRole === 'admin' && (
        <View style={styles.userActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => router.push(`/(screens)/users/detail?id=${item._id}`)}
          >
            <Ionicons name="eye" size={18} color="#2196F3" />
            <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>Voir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => router.push(`/(screens)/users/edit?id=${item._id}`)}
          >
            <Ionicons name="create" size={18} color="#FF6B35" />
            <Text style={[styles.actionButtonText, { color: '#FF6B35' }]}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item._id, `${item.firstName} ${item.lastName}`)}
          >
            <Ionicons name="trash" size={18} color="#DC143C" />
            <Text style={[styles.actionButtonText, { color: '#DC143C' }]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B43D5" />
        <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
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
            router.replace('/(tabs)/adminHome');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Utilisateurs</Text>
        {userRole === 'admin' && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(screens)/users/create')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom, email, niveau..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filterRole === 'all' && styles.filterTabActive]}
          onPress={() => setFilterRole('all')}
        >
          <Text style={[styles.filterTabText, filterRole === 'all' && styles.filterTabTextActive]}>
            Tous ({users.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterRole === 'user' && styles.filterTabActive]}
          onPress={() => setFilterRole('user')}
        >
          <Text style={[styles.filterTabText, filterRole === 'user' && styles.filterTabTextActive]}>
            Étudiants ({users.filter(u => u.role === 'user').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterRole === 'prof' && styles.filterTabActive]}
          onPress={() => setFilterRole('prof')}
        >
          <Text style={[styles.filterTabText, filterRole === 'prof' && styles.filterTabTextActive]}>
            Profs ({users.filter(u => u.role === 'prof').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterRole === 'admin' && styles.filterTabActive]}
          onPress={() => setFilterRole('admin')}
        >
          <Text style={[styles.filterTabText, filterRole === 'admin' && styles.filterTabTextActive]}>
            Admins ({users.filter(u => u.role === 'admin').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B43D5']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery || filterRole !== 'all' ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
            </Text>
          </View>
        }
      />

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModal.visible}
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={50} color="#DC143C" />
              <Text style={styles.modalTitle}>Confirmer la suppression</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              Voulez-vous vraiment supprimer l'utilisateur{'\n'}
              <Text style={styles.modalUserName}>"{deleteModal.userName}"</Text> ?
            </Text>
            
            <Text style={styles.modalWarning}>
              Cette action est irréversible.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDelete}
              >
                <Ionicons name="trash" size={18} color="#fff" />
                <Text style={styles.confirmButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#5B43D5',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 3,
    alignItems: 'center',
    elevation: 1,
  },
  filterTabActive: {
    backgroundColor: '#5B43D5',
  },
  filterTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
    paddingTop: 5,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5B43D5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 8,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  userLevel: {
    fontSize: 12,
    color: '#666',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: '#E3F2FD',
  },
  editButton: {
    backgroundColor: '#FFF4E0',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  modalUserName: {
    fontWeight: 'bold',
    color: '#DC143C',
  },
  modalWarning: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#DC143C',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UsersListScreen;
