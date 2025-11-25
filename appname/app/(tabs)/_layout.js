import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabsLayout() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const userData = await AsyncStorage.getItem('unistudious_user_data');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('Tabs Layout - User role:', user.role);
        setUserRole(user.role);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  // If still loading, show nothing
  if (!userRole) {
    return null;
  }

  // Professors and admins get tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5B43D5',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: userRole === 'user' ? { display: 'none' } : {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil Étudiant',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          href: userRole === 'user' ? undefined : null,
          tabBarButton: userRole === 'user' ? () => null : undefined,
        }}
      />
      <Tabs.Screen
        name="profHome"
        options={{
          title: 'Accueil Prof',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          href: userRole === 'prof' ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="adminHome"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield" size={size} color={color} />
          ),
          href: userRole === 'admin' ? undefined : null,
        }}
      />
    </Tabs>
  );
}
