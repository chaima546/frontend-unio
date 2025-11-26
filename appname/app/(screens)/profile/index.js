import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('unistudious_user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/(screens)/profile/edit');
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrateur', color: '#FF6B6B', icon: 'shield-checkmark' };
      case 'prof':
        return { label: 'Professeur', color: '#FFA502', icon: 'school' };
      case 'user':
        return { label: 'Étudiant', color: '#6C5CE7', icon: 'person' };
      default:
        return { label: role, color: '#636E72', icon: 'person' };
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

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#FF6B6B" />
        <Text style={styles.errorText}>Utilisateur non trouvé</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.replace('/')}>
          <Text style={styles.errorButtonText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const roleInfo = getRoleDisplay(user.role);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[roleInfo.color, roleInfo.color + 'CC']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => {
            if (user.role === 'admin') {
              router.push('/adminHome');
            } else if (user.role === 'prof') {
              router.push('/profHome');
            } else {
              router.push('/home');
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <TouchableOpacity
          onPress={handleEditProfile}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatarContainer, { backgroundColor: roleInfo.color + '20' }]}>
            <Ionicons name={roleInfo.icon} size={60} color={roleInfo.color} />
          </View>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: roleInfo.color }]}>
            <Text style={styles.roleText}>{roleInfo.label}</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Personnelles</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="person-outline" size={20} color="#6C5CE7" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nom d'utilisateur</Text>
                <Text style={styles.infoValue}>{user.username}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="mail-outline" size={20} color="#6C5CE7" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            {user.role === 'user' && (
              <>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="school-outline" size={20} color="#6C5CE7" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Niveau Scolaire</Text>
                    <Text style={styles.infoValue}>{user.niveauScolaire || 'Non défini'}</Text>
                  </View>
                </View>

                {user.section && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Ionicons name="book-outline" size={20} color="#6C5CE7" />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Section</Text>
                      <Text style={styles.infoValue}>{user.section}</Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {user.role === 'prof' && user.speciality && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="flask-outline" size={20} color="#FFA502" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Spécialité</Text>
                  <Text style={styles.infoValue}>{user.speciality}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#F0EBFF' }]}>
                <Ionicons name="create-outline" size={20} color="#6C5CE7" />
              </View>
              <Text style={styles.actionText}>Modifier le profil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#636E72" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(screens)/profile/change-password')}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#FFF0F0' }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#FF6B6B" />
              </View>
              <Text style={styles.actionText}>Changer le mot de passe</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#636E72" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="notifications-outline" size={20} color="#00B8D4" />
              </View>
              <Text style={styles.actionText}>Paramètres de notification</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#636E72" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#636E72',
    marginTop: 20,
    marginBottom: 30,
  },
  errorButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  editButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: -30,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: Math.min(width * 0.06, 26),
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#636E72',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionText: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FF6B6B',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
