import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { registerProfApi } from '../../services/api';

const specialities = [
  'Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Informatique',
  'Français', 'Anglais', 'Arabe', 'Histoire', 'Géographie',
  'Économie', 'Philosophie', 'Sport', 'Arts', 'Musique'
];

export default function ProfRegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!email.trim()) newErrors.email = 'Email requis';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) newErrors.email = 'Email invalide';
    if (!password) newErrors.password = 'Mot de passe requis';
    else if (password.length < 6) newErrors.password = 'Min. 6 caractères';
    if (!speciality) newErrors.speciality = 'Spécialité requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await registerProfApi(firstName, lastName, `${firstName.toLowerCase()}.${lastName.toLowerCase()}`, email, password, '', speciality, '');
      if (res && res.token) {
        Alert.alert('Succès', 'Compte professeur créé avec succès');
        router.replace('/(auth)/profLogin');
      } else {
        Alert.alert('Erreur', res.message || 'Erreur lors de la création du compte');
      }
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Erreur serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inscription Professeur</Text>
      <View style={styles.inputGroup}>
        <Ionicons name="person" size={20} color="#FFA502" style={styles.icon} />
        <TextInput
          style={[styles.input, errors.firstName && styles.inputError]}
          placeholder="Prénom"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>
      {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      <View style={styles.inputGroup}>
        <Ionicons name="person" size={20} color="#FFA502" style={styles.icon} />
        <TextInput
          style={[styles.input, errors.lastName && styles.inputError]}
          placeholder="Nom"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>
      {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      <View style={styles.inputGroup}>
        <Ionicons name="mail" size={20} color="#FFA502" style={styles.icon} />
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      <View style={styles.inputGroup}>
        <Ionicons name="lock-closed" size={20} color="#FFA502" style={styles.icon} />
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Mot de passe"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      <View style={styles.inputGroup}>
        <Ionicons name="school" size={20} color="#FFA502" style={styles.icon} />
        <TouchableOpacity style={[styles.pickerButton, errors.speciality && styles.inputError]} onPress={() => setShowPicker(!showPicker)}>
          <Text style={styles.pickerText}>{speciality || 'Sélectionner une spécialité'}</Text>
          <Ionicons name={showPicker ? 'chevron-up' : 'chevron-down'} size={18} color="#FFA502" />
        </TouchableOpacity>
      </View>
      {errors.speciality && <Text style={styles.errorText}>{errors.speciality}</Text>}
      {showPicker && (
        <View style={styles.pickerOptions}>
          {specialities.map(spec => (
            <TouchableOpacity key={spec} style={styles.pickerOption} onPress={() => { setSpeciality(spec); setShowPicker(false); }}>
              <Text style={styles.pickerOptionText}>{spec}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
        <Text style={styles.registerButtonText}>{isLoading ? 'Enregistrement...' : 'S\'inscrire'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/(auth)/profLogin')}>
        <Text style={styles.loginLinkText}>Déjà inscrit ? Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 28,
    letterSpacing: 1,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#FF6B35',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 10,
    color: '#333',
    backgroundColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF6B35',
    borderWidth: 1,
    backgroundColor: '#FFF3E0',
  },
  errorText: {
    color: '#FF6B35',
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  pickerText: {
    fontSize: 17,
    color: '#333',
  },
  pickerOptions: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOpacity: 0.13,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  pickerOptionText: {
    fontSize: 17,
    color: '#FF6B35',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 28,
    marginTop: 28,
    marginBottom: 10,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loginLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#FF6B35',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
