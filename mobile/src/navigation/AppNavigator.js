import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { loadUser } from '../store/slices/authSlice';
import { theme } from '../theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AnimalsScreen from '../screens/animals/AnimalsScreen';
import AnimalDetailScreen from '../screens/animals/AnimalDetailScreen';
import AddAnimalScreen from '../screens/animals/AddAnimalScreen';
import SchedulesScreen from '../screens/schedules/SchedulesScreen';
import InventoryScreen from '../screens/inventory/InventoryScreen';
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Components
import LoadingScreen from '../components/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: theme.colors.background },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const AnimalsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.onPrimary,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="AnimalsList" 
      component={AnimalsScreen} 
      options={{ title: 'My Animals' }}
    />
    <Stack.Screen 
      name="AnimalDetail" 
      component={AnimalDetailScreen}
      options={{ title: 'Animal Details' }}
    />
    <Stack.Screen 
      name="AddAnimal" 
      component={AddAnimalScreen}
      options={{ title: 'Register Animal' }}
    />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Animals':
            iconName = focused ? 'paw' : 'paw-outline';
            break;
          case 'Schedules':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          case 'Inventory':
            iconName = focused ? 'cube' : 'cube-outline';
            break;
          case 'Marketplace':
            iconName = focused ? 'storefront' : 'storefront-outline';
            break;
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        paddingBottom: 5,
        height: 60,
      },
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.onPrimary,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <Tab.Screen 
      name="Animals" 
      component={AnimalsStack}
      options={{ headerShown: false }}
    />
    <Tab.Screen 
      name="Schedules" 
      component={SchedulesScreen}
      options={{ title: 'Schedules' }}
    />
    <Tab.Screen 
      name="Inventory" 
      component={InventoryScreen}
      options={{ title: 'Inventory' }}
    />
    <Tab.Screen 
      name="Marketplace" 
      component={MarketplaceScreen}
      options={{ title: 'Marketplace' }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.onPrimary,
    }}
  >
    <Stack.Screen 
      name="MainTabs" 
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <MainStack /> : <AuthStack />;
};

export default AppNavigator; 