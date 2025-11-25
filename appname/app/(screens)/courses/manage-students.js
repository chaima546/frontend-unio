import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getCourseByIdApi, 
  getAllUsersApi, 
  assignStudentsToCourseApi,
  removeStudentsFromCourseApi 
} from '../../../services/api';

export default function ManageStudents() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const [course, setCourse] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadUserRole();
    loadData();
  }, []);

  const loadUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
      if (role !== 'prof' && role !== 'admin') {
        Alert.alert('Access Denied', 'Only professors and admins can manage students');
        router.back();
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load course details
      const courseData = await getCourseByIdApi(courseId);
      setCourse(courseData.course);
      setEnrolledStudents(courseData.course.students || []);

      // Load all students
      const usersData = await getAllUsersApi();
      const students = usersData.users.filter(u => u.role === 'user');
      setAllStudents(students);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignStudent = async (studentId) => {
    try {
      await assignStudentsToCourseApi(courseId, [studentId]);
      Alert.alert('Success', 'Student assigned to course');
      loadData(); // Reload to get updated data
    } catch (error) {
      console.error('Error assigning student:', error);
      Alert.alert('Error', 'Failed to assign student');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this student from the course?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeStudentsFromCourseApi(courseId, [studentId]);
              Alert.alert('Success', 'Student removed from course');
              loadData();
            } catch (error) {
              console.error('Error removing student:', error);
              Alert.alert('Error', 'Failed to remove student');
            }
          },
        },
      ]
    );
  };

  const isStudentEnrolled = (studentId) => {
    return enrolledStudents.some(s => s._id === studentId);
  };

  const filteredStudents = allStudents.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const email = student.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const renderStudent = ({ item }) => {
    const enrolled = isStudentEnrolled(item._id);

    return (
      <View style={styles.studentCard}>
        <View style={styles.studentIcon}>
          <Ionicons 
            name={enrolled ? "person" : "person-outline"} 
            size={24} 
            color={enrolled ? "#5B43D5" : "#666"} 
          />
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
          {item.niveauScolaire && (
            <Text style={styles.studentLevel}>
              {item.niveauScolaire} {item.section ? `- ${item.section}` : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.actionButton,
            enrolled ? styles.removeButton : styles.addButton,
          ]}
          onPress={() => enrolled ? handleRemoveStudent(item._id) : handleAssignStudent(item._id)}
        >
          <Ionicons
            name={enrolled ? "remove-circle" : "add-circle"}
            size={28}
            color={enrolled ? "#FF6B6B" : "#5B43D5"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B43D5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Manage Students</Text>
          <Text style={styles.headerSubtitle}>{course?.name}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{enrolledStudents.length}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{allStudents.length}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students by name or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Student List */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudent}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No students found' : 'No students available'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backBtn: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5B43D5',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  studentLevel: {
    fontSize: 12,
    color: '#999',
  },
  actionButton: {
    padding: 4,
  },
  addButton: {
    opacity: 0.8,
  },
  removeButton: {
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
