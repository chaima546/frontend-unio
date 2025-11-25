import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserByIdApi, deleteUserApi } from '../../../services/api';

const UserDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadUser();
    }
  }, [params.id]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const response = await getUserByIdApi(params.id);
      setUser(response.user);
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'utilisateur');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUserApi(params.id);
      setDeleteModal(false);
      Alert.alert('Succès', 'Utilisateur supprimé avec succès', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          }
        }
      ]);
    } catch (error) {
      console.error('Error deleting user:', error);
      setDeleteModal(false);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de supprimer l\'utilisateur');
    }
  };

  const cancelDelete = () => {
    setDeleteModal(false);
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
      case 'admin': return 'Administrateur';
      case 'prof': return 'Professeur';
      case 'user': return 'Étudiant';
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B43D5" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de l'utilisateur</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/(screens)/users/edit?id=${params.id}`)}
        >
          <Ionicons name="create" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Text>
          </View>
          <Text style={styles.fullName}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) }]}>
            <Text style={styles.roleBadgeText}>{getRoleLabel(user.role)}</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Personnelles</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail" size={20} color="#5B43D5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person" size={20} color="#5B43D5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nom d'utilisateur</Text>
              <Text style={styles.infoValue}>{user.username}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-checkmark" size={20} color="#5B43D5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Rôle</Text>
              <Text style={styles.infoValue}>{getRoleLabel(user.role)}</Text>
            </View>
          </View>
        </View>

        {/* Academic Info (for students) */}
        {user.role === 'user' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Académiques</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="school" size={20} color="#5B43D5" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Niveau Scolaire</Text>
                <Text style={styles.infoValue}>{user.niveauScolaire}</Text>
              </View>
            </View>

            {user.section && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="bookmark" size={20} color="#5B43D5" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Section</Text>
                  <Text style={styles.infoValue}>{user.section}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métadonnées</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={20} color="#5B43D5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Créé le</Text>
              <Text style={styles.infoValue}>
                {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={20} color="#5B43D5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Dernière modification</Text>
              <Text style={styles.infoValue}>
                {new Date(user.updatedAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="finger-print" size={20} color="#5B43D5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>ID</Text>
              <Text style={[styles.infoValue, { fontSize: 12, fontFamily: 'monospace' }]}>{user._id}</Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Zone de danger</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Supprimer cet utilisateur</Text>
          </TouchableOpacity>
          <Text style={styles.dangerWarning}>
            Cette action est irréversible. Toutes les données associées seront supprimées.
          </Text>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModal}
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
              <Text style={styles.modalUserName}>"{user?.firstName} {user?.lastName}"</Text> ?
            </Text>
            
            <Text style={styles.modalWarning}>
              Cette action est irréversible. Toutes les données associées seront supprimées.
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
  editButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#5B43D5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dangerSection: {
    backgroundColor: '#fff',
    marginBottom: 30,
    padding: 20,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC143C',
    marginBottom: 15,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC143C',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  dangerWarning: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
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

export default UserDetailScreen;
