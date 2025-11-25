import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker'; 
import { registerUserApi } from '../../services/api'; 
import { Ionicons } from '@expo/vector-icons';

// Définitions des constantes basées sur le nouveau schéma Mongoose
const NIVEAUX_SCOLAIRES = [
  "1ère", 
  "2ème", 
  "3ème", 
  "Bac", 
];

const SECTIONS = [
  "Informatique", 
  "Sciences", 
  "Mathématiques", 
  "Économie", 
  "Lettres", 
  "Technologie", 
  "Sport"
];

const StudentSignUpScreen = () => {
  const router = useRouter();

  // 1. Déclaration des états pour les champs du formulaire
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Champs spécifiques à l'inscription étudiant (role='user')
  // Le premier élément est "1ère", défini comme défaut dans le schéma.
  const [niveauScolaire, setNiveauScolaire] = useState(NIVEAUX_SCOLAIRES[0]); 
  
  // Section initialisée à null car le niveau par défaut ("1ère") ne nécessite pas de section.
  const [section, setSection] = useState(null); 
  
  // Les états 'department' et 'speciality' ont été retirés.
  
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  /**
   * Logique pour la gestion du changement de niveau scolaire.
   * Si le niveau est "1ère", la section est désélectionnée (null).
   * Sinon, la section est définie par défaut sur "Sciences" (si elle est null).
   */
  const handleNiveauChange = (value) => {
    setNiveauScolaire(value);
    
    // Si l'utilisateur sélectionne "1ère", la section doit être null (validation backend)
    if (value === '1ère') {
      setSection(null);
    } else if (!section) {
      // Si l'utilisateur change vers un autre niveau et qu'aucune section n'est sélectionnée,
      // on utilise la valeur par défaut du backend ("Sciences", qui est SECTIONS[1])
      setSection(SECTIONS[1]);
    }
  };

  const handleRegister = async () => {
    const isFirstGrade = niveauScolaire === '1ère';

    // 2. Validation des champs
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
    if (!acceptTerms) {
      Alert.alert("Erreur", "Veuillez accepter les conditions d'utilisation.");
      return;
    }

    // Validation supplémentaire pour la section si ce n'est pas le niveau "1ère"
    if (!isFirstGrade && !section) {
       Alert.alert("Erreur", "Veuillez choisir une section pour ce niveau.");
       return;
    }

    setIsLoading(true);

    try {
      // 3. Appel API d'inscription
      // L'appel a été mis à jour en retirant 'department' et 'speciality'.
      
      const data = await registerUserApi(
        firstName,        // Champ requis
        lastName,         // Champ requis
        username, 
        email, 
        password, 
        'user',           // Rôle fixe pour ce formulaire (étudiant)
        niveauScolaire, 
        // Envoie la section sélectionnée, sinon null si le niveau est "1ère"
        isFirstGrade ? null : section
      );

      // 4. Inscription réussie :
      // ÉTAPE FUTURE : Appeler la fonction login du AuthContext pour stocker le jeton.
      
      Alert.alert("Succès", `Bienvenue ${data.user.username} ! Vous pouvez maintenant vous connecter.`);
      
      // Redirection vers la page de connexion
      router.push('/(auth)/studentLogin'); 

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur réseau. Impossible de créer le compte.";
      Alert.alert("Échec de l'inscription", errorMessage);
      console.error("Erreur d'inscription:", error.response || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const goToLogin = () => {
    router.push('/(auth)/studentLogin'); 
  };
  
  // Condition de rendu pour le sélecteur de section
  const showSectionPicker = niveauScolaire !== '1ère';

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Créer un compte étudiant</Text>
        <Text style={styles.subtitle}>Rejoignez Unistudious en quelques étapes.</Text>

        {/* Champs d'entrée de texte */}
        <View style={styles.inputGroup}>
          <TextInput style={styles.inputHalf} placeholder="Prénom (First Name)" value={firstName} onChangeText={setFirstName} editable={!isLoading}/>
          <TextInput style={styles.inputHalf} placeholder="Nom (Last Name)" value={lastName} onChangeText={setLastName} editable={!isLoading}/>
        </View>
        <TextInput style={styles.input} placeholder="Nom d'utilisateur" value={username} onChangeText={setUsername} autoCapitalize="none" editable={!isLoading}/>
        <TextInput style={styles.input} placeholder="Adresse e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!isLoading}/>
        <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry editable={!isLoading}/>
        <TextInput style={styles.input} placeholder="Confirmer mot de passe" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry editable={!isLoading}/>

        {/* Sélecteur de Niveau Scolaire */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Niveau Scolaire :</Text>
          <Picker
            selectedValue={niveauScolaire}
            // Utilise la nouvelle fonction qui gère la logique de la section
            onValueChange={handleNiveauChange}
            style={styles.picker}
            enabled={!isLoading}
          >
            {NIVEAUX_SCOLAIRES.map(n => <Picker.Item key={n} label={n} value={n} />)}
          </Picker>
        </View>

        {/* Sélecteur de Section (Rendu conditionnel) */}
        {showSectionPicker && (
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Section :</Text>
            <Picker
              selectedValue={section || SECTIONS[0]} // Utilise la première section si 'section' est null
              onValueChange={(itemValue) => setSection(itemValue)}
              style={styles.picker}
              enabled={!isLoading}
            >
              {SECTIONS.map(s => <Picker.Item key={s} label={s} value={s} />)}
            </Picker>
          </View>
        )}
        
        {/* Case à cocher d'acceptation */}
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAcceptTerms(!acceptTerms)} disabled={isLoading}>
          <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
            {acceptTerms && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Text style={styles.checkboxText}>J accepte les conditions d utilisation.</Text>
        </TouchableOpacity>

        {/* Bouton d'Inscription */}
        <TouchableOpacity 
          style={[styles.primaryButton, isLoading || !acceptTerms && styles.primaryButtonDisabled]} 
          onPress={handleRegister}
          disabled={isLoading || !acceptTerms}
        >
          {isLoading ? (
             <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>S inscrire</Text>
          )}
        </TouchableOpacity>

        {/* Lien Connexion */}
        <View style={styles.linkContainer}>
          <Text style={styles.textBase}>Déjà un compte ? </Text>
          <TouchableOpacity onPress={goToLogin} disabled={isLoading}>
            <Text style={styles.linkText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#FFFFFF', paddingBottom: 50 },
  container: { flex: 1, padding: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 30, textAlign: 'center' },
  
  // Gestion de deux inputs sur une ligne
  inputGroup: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 0 },
  inputHalf: {
    width: '48%',
    height: 55,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15,
  },
  
  input: {
    width: '100%',
    height: 55,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15,
  },
  
  // Styles du sélecteur (Picker)
  pickerContainer: {
    width: '100%',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginBottom: Platform.OS === 'ios' ? -10 : 0, // Ajustement pour iOS
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 120 : 50, // Picker iOS est plus grand par défaut
  },

  // Styles de la case à cocher
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 25,
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#5B43D5',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5B43D5',
    borderColor: '#5B43D5',
  },
  checkboxText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Styles du bouton principal
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#5B43D5', // Violet
    marginBottom: 20,
    shadowColor: '#5B43D5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#A092D8',
  },
  primaryButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  
  // Styles du lien de connexion
  linkContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  textBase: { fontSize: 15, color: '#666' },
  linkText: { 
    color: '#5B43D5', 
    fontSize: 15, 
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default StudentSignUpScreen;
