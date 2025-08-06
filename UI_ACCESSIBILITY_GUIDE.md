import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AccessibleNavigation = ({ currentScreen }) => {
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);
  const [showHelp, setShowHelp] = useState(false);

  // Navigation items with large, clear icons and text
  const navigationItems = [
    {
      id: 'dashboard',
      title: 'Home',
      subtitle: 'Farm Overview',
      icon: 'home',
      emoji: '🏠',
      color: '#4A90E2',
      screen: 'Dashboard'
    },
    {
      id: 'animals',
      title: 'My Animals',
      subtitle: 'Cattle & Goats',
      icon: 'pets',
      emoji: '🐄',
      color: '#7ED321',
      screen: 'Animals'
    },
    {
      id: 'health',
      title: 'Health Care',
      subtitle: 'Medicine & Vaccines',
      icon: 'local-hospital',
      emoji: '💊',
      color: '#F5A623',
      screen: 'Health'
    },
    {
      id: 'feed',
      title: 'Feed & Food',
      subtitle: 'Feeding Schedule',
      icon: 'grass',
      emoji: '🌾',
      color: '#8B572A',
      screen: 'Inventory'
    },
    {
      id: 'money',
      title: 'Money',
      subtitle: 'Income & Expenses',
      icon: 'attach-money',
      emoji: '💰',
      color: '#50E3C2',
      screen: 'Financial'
    },
    {
      id: 'marketplace',
      title: 'Buy & Sell',
      subtitle: 'Animal Market',
      icon: 'store',
      emoji: '🏪',
      color: '#BD10E0',
      screen: 'Marketplace'
    }
  ];

  const handleNavigation = (item) => {
    // Provide audio feedback if available
    // playSound('navigation_click');
    navigation.navigate(item.screen);
  };

  const showHelpDialog = () => {
    Alert.alert(
      'How to Use This App',
      'Tap on any large button to go to that section. Each button shows what you can do there.',
      [
        { text: 'OK', style: 'default' },
        { text: 'Call Support', onPress: () => callSupport() }
      ]
    );
  };

  const callSupport = () => {
    // Implement phone call to support
    Alert.alert('Support', 'Call +1-800-FARM-HELP for assistance');
  };

  return (
    <View style={styles.container}>
      {/* Header with user greeting */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>
            Hello, {user?.name || 'Farmer'}! 👋
          </Text>
          <Text style={styles.farmName}>
            {user?.farmDetails?.farmName || 'Your Farm'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={showHelpDialog}
          accessibilityLabel="Get help using this app"
        >
          <Icon name="help" size={24} color="#4A90E2" />
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      {/* Main navigation grid */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.navigationGrid}>
          {navigationItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navigationItem,
                { backgroundColor: item.color + '15' },
                currentScreen === item.id && styles.activeItem
              ]}
              onPress={() => handleNavigation(item)}
              accessibilityLabel={`Go to ${item.title} - ${item.subtitle}`}
              accessibilityRole="button"
            >
              {/* Large emoji for visual recognition */}
              <Text style={styles.emoji}>{item.emoji}</Text>
              
              {/* Icon for additional visual cue */}
              <Icon 
                name={item.icon} 
                size={32} 
                color={item.color} 
                style={styles.icon}
              />
              
              {/* Large, clear text */}
              <Text style={[styles.itemTitle, { color: item.color }]}>
                {item.title}
              </Text>
              <Text style={styles.itemSubtitle}>
                {item.subtitle}
              </Text>
              
              {/* Visual indicator for current screen */}
              {currentScreen === item.id && (
                <View style={styles.activeIndicator}>
                  <Icon name="check-circle" size={20} color="#4A90E2" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick actions section */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionRow}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('AddAnimal')}
            >
              <Text style={styles.quickActionEmoji}>➕🐄</Text>
              <Text style={styles.quickActionText}>Add Animal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('RecordHealth')}
            >
              <Text style={styles.quickActionEmoji}>💊📝</Text>
              <Text style={styles.quickActionText}>Record Medicine</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('AddExpense')}
            >
              <Text style={styles.quickActionEmoji}>💰📊</Text>
              <Text style={styles.quickActionText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency contact */}
        <View style={styles.emergencySection}>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => Alert.alert('Emergency', 'Call veterinarian or support?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call Vet', onPress: () => {} },
              { text: 'Call Support', onPress: callSupport }
            ])}
          >
            <Icon name="emergency" size={24} color="#FF3B30" />
            <Text style={styles.emergencyText}>🚨 Emergency Help</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  farmName: {
    fontSize: 16,
    color: '#718096',
  },
  helpButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EBF8FF',
  },
  helpText: {
    fontSize: 12,
    color: '#4A90E2',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  navigationItem: {
    width: '48%',
    aspectRatio: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  activeItem: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF8FF',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  icon: {
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#4A5568',
    textAlign: 'center',
  },
  emergencySection: {
    marginTop: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FED7D7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
});

export default AccessibleNavigation; 