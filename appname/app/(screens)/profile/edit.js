import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
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

const EditProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [niveauScolaire, setNiveauScolaire] = useState('');
  const [section, setSection] = useState('');
  const [speciality, setSpeciality] = useState('');

  // Pickers
  const [showNiveauPicker, setShowNiveauPicker] = useState(false);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [showSpecialityPicker, setShowSpecialityPicker] = useState(false);

  const niveaux = ['1ère', '2ème', '3ème', 'Bac'];
  const sections = ['Informatique', 'Sciences', 'Mathématiques', 'Économie', 'Lettres', 'Technologie', 'Sport'];
  const specialities = [
    'Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Informatique',
    'Français', 'Anglais', 'Arabe', 'Histoire', 'Géographie',
    'Économie', 'Philosophie', 'Sport', 'Arts', 'Musique'
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('unistudious_user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFirstName(parsedUser.firstName || '');
        setLastName(parsedUser.lastName || '');
        setUsername(parsedUser.username || '');
        setEmail(parsedUser.email || '');
        setNiveauScolaire(parsedUser.niveauScolaire || '');
        setSection(parsedUser.section || '');
        setSpeciality(parsedUser.speciality || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim()) {
      Alert.alert('Erreur', 'Tous les champs obligatoires doivent être remplis');
      return;
    }

    if (user.role === 'user' && niveauScolaire !== '1ère' && !section) {
      Alert.alert('Erreur', 'Veuillez sélectionner une section');
      return;
    }

    if (user.role === 'prof' && !speciality) {
      Alert.alert('Erreur', 'Veuillez sélectionner une spécialité');
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = {
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        ...(user.role === 'user' && {
          niveauScolaire,
          section: niveauScolaire === '1ère' ? null : section
        }),
        ...(user.role === 'prof' && { speciality })
      };

      await AsyncStorage.setItem('unistudious_user_data', JSON.stringify(updatedUser));
      
      Alert.alert(
        'Succès',
        'Profil mis à jour avec succès',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(screens)/profile')
          }
        ]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace('/');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le compte');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#FF6B6B';
      case 'prof': return '#FFA502';
      case 'user': return '#6C5CE7';
      default: return '#636E72';
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
      </View>
    );
  }

  const roleColor = getRoleColor(user.role);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[roleColor, roleColor + 'CC']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.push('/(screens)/profile')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le Profil</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Personnelles</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Prénom"
              editable={!isSaving}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Nom"
              editable={!isSaving}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom d'utilisateur *</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Nom d'utilisateur"
              editable={!isSaving}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSaving}
            />
          </View>
        </View>

        {/* Student Specific Fields */}
        {user.role === 'user' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Scolaires</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Niveau Scolaire *</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowNiveauPicker(!showNiveauPicker)}
                disabled={isSaving}
              >
                <Text style={styles.pickerText}>
                  {niveauScolaire || 'Sélectionner un niveau'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {showNiveauPicker && (
                <View style={styles.pickerOptions}>
                  {niveaux.map((niveau) => (
                    <TouchableOpacity
                      key={niveau}
                      style={styles.pickerOption}
                      onPress={() => {
                        setNiveauScolaire(niveau);
                        if (niveau === '1ère') {
                          setSection('');
                        }
                        setShowNiveauPicker(false);
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{niveau}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {niveauScolaire !== '1ère' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Section *</Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowSectionPicker(!showSectionPicker)}
                  disabled={isSaving}
                >
                  <Text style={styles.pickerText}>
                    {section || 'Sélectionner une section'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>

                {showSectionPicker && (
                  <View style={styles.pickerOptions}>
                    {sections.map((sec) => (
                      <TouchableOpacity
                        key={sec}
                        style={styles.pickerOption}
                        onPress={() => {
                          setSection(sec);
                          setShowSectionPicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>{sec}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Professor Specific Fields */}
        {user.role === 'prof' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Professionnelles</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Spécialité *</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowSpecialityPicker(!showSpecialityPicker)}
                disabled={isSaving}
              >
                <Text style={styles.pickerText}>
                  {speciality || 'Sélectionner une spécialité'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {showSpecialityPicker && (
                <View style={styles.pickerOptions}>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {specialities.map((spec) => (
                      <TouchableOpacity
                        key={spec}
                        style={styles.pickerOption}
                        onPress={() => {
                          setSpeciality(spec);
                          setShowSpecialityPicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>{spec}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Zone de Danger</Text>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={24} color="#FFF" />
            <Text style={styles.deleteButtonText}>Supprimer le compte</Text>
          </TouchableOpacity>
        </View>

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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D3436',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE6E9',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerText: {
    fontSize: 16,
    color: '#2D3436',
  },
  pickerOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DFE6E9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#2D3436',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#6C5CE7',
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#A29BFE',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dangerZone: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EditProfileScreen;
