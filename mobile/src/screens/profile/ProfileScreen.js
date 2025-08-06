import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Avatar,
  List,
  Switch,
  Divider,
  ActivityIndicator,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import { logout } from '../../store/slices/authSlice';
import VoiceGuidance from '../../components/VoiceGuidance';

const ProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [farmStats, setFarmStats] = useState({
    totalAnimals: 0,
    completedSchedules: 0,
    inventoryItems: 0,
    marketplaceListings: 0,
  });
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      showAnimalsPublicly: true,
      allowMatingSuggestions: true,
      showContactInfo: false,
    },
    accessibility: {
      voiceGuidance: true,
      largeText: false,
      highContrast: false,
    },
  });

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchFarmStats();
    fetchUserSettings();
  }, []);

  const fetchFarmStats = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile-stats`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFarmStats(data.stats || {});
      }
    } catch (error) {
      console.error('Failed to fetch farm stats:', error);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/settings`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
    }
  };

  const updateSettings = async (category, setting, value) => {
    try {
      const newSettings = {
        ...settings,
        [category]: {
          ...settings[category],
          [setting]: value,
        },
      };

      setSettings(newSettings);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/settings`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ settings: newSettings }),
        }
      );

      if (!response.ok) {
        // Revert on failure
        setSettings(settings);
        Alert.alert('Error', 'Failed to update settings');
      }
    } catch (error) {
      // Revert on failure
      setSettings(settings);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleFarmSettings = () => {
    navigation.navigate('FarmSettings');
  };

  const handleBackupData = async () => {
    Alert.alert(
      'Backup Data',
      'This will create a backup of your farm data. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Backup', onPress: performBackup },
      ]
    );
  };

  const performBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/backup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          'Backup Complete',
          `Your farm data has been backed up successfully. Backup ID: ${data.backupId}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to create backup');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out Farm Manager - the best app for livestock management! Download it now to manage your farm efficiently.',
        title: 'Farm Manager App',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSupport = () => {
    Alert.alert(
      'Support & Help',
      'Need help? Choose an option:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'FAQ', onPress: () => navigation.navigate('FAQ') },
        { text: 'Contact Support', onPress: () => navigation.navigate('ContactSupport') },
        { text: 'User Guide', onPress: () => navigation.navigate('UserGuide') },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Farm Manager',
      'Farm Manager v1.0.0\n\nA comprehensive livestock management system designed to help farmers manage their animals, schedules, inventory, and marketplace activities.\n\n© 2024 Farm Manager. All rights reserved.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        },
      ]
    );
  };

  const getSubscriptionBadge = () => {
    const plan = user?.subscription?.plan || 'free';
    const colors = {
      free: '#9E9E9E',
      basic: '#2196F3',
      premium: '#FF9800',
    };
    
    return (
      <Badge style={[styles.subscriptionBadge, { backgroundColor: colors[plan] }]}>
        {plan.toUpperCase()}
      </Badge>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <VoiceGuidance
          text="Welcome to your profile. Here you can manage your account settings and farm preferences."
          autoPlay={true}
        />

        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <Avatar.Text
                size={80}
                label={user?.name?.substring(0, 2)?.toUpperCase() || 'FM'}
                style={styles.profileAvatar}
              />
              <View style={styles.profileInfo}>
                <View style={styles.nameContainer}>
                  <Title style={styles.userName}>{user?.name || 'Farm Manager'}</Title>
                  {getSubscriptionBadge()}
                </View>
                <Paragraph style={styles.userEmail}>{user?.email}</Paragraph>
                <Text style={styles.farmName}>{user?.farmName || 'Your Farm'}</Text>
                <Text style={styles.joinDate}>
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <Button
              mode="outlined"
              onPress={handleEditProfile}
              style={styles.editProfileButton}
              icon="pencil"
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Farm Statistics */}
        <Card style={styles.statsCard}>
          <Card.Title title="Farm Overview" left={(props) => <List.Icon {...props} icon="chart-line" />} />
          <Card.Content>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{farmStats.totalAnimals}</Text>
                <Text style={styles.statLabel}>Animals</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{farmStats.completedSchedules}</Text>
                <Text style={styles.statLabel}>Completed Tasks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{farmStats.inventoryItems}</Text>
                <Text style={styles.statLabel}>Inventory Items</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{farmStats.marketplaceListings}</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Settings Sections */}
        
        {/* Farm Management */}
        <Card style={styles.settingsCard}>
          <Card.Title title="Farm Management" left={(props) => <List.Icon {...props} icon="barn" />} />
          <Card.Content>
            <List.Item
              title="Farm Settings"
              description="Update farm details and preferences"
              left={(props) => <List.Icon {...props} icon="cog" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleFarmSettings}
            />
            <Divider />
            <List.Item
              title="Backup Data"
              description="Create a backup of your farm data"
              left={(props) => <List.Icon {...props} icon="backup-restore" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleBackupData}
            />
          </Card.Content>
        </Card>

        {/* Notifications */}
        <Card style={styles.settingsCard}>
          <Card.Title title="Notifications" left={(props) => <List.Icon {...props} icon="bell" />} />
          <Card.Content>
            <List.Item
              title="Email Notifications"
              description="Receive updates via email"
              left={(props) => <List.Icon {...props} icon="email" />}
              right={() => (
                <Switch
                  value={settings.notifications.email}
                  onValueChange={(value) => updateSettings('notifications', 'email', value)}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Push Notifications"
              description="Receive push notifications on your device"
              left={(props) => <List.Icon {...props} icon="cellphone" />}
              right={() => (
                <Switch
                  value={settings.notifications.push}
                  onValueChange={(value) => updateSettings('notifications', 'push', value)}
                />
              )}
            />
            <Divider />
            <List.Item
              title="SMS Notifications"
              description="Receive important updates via SMS"
              left={(props) => <List.Icon {...props} icon="message-text" />}
              right={() => (
                <Switch
                  value={settings.notifications.sms}
                  onValueChange={(value) => updateSettings('notifications', 'sms', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Privacy Settings */}
        <Card style={styles.settingsCard}>
          <Card.Title title="Privacy & Sharing" left={(props) => <List.Icon {...props} icon="shield-account" />} />
          <Card.Content>
            <List.Item
              title="Show Animals Publicly"
              description="Allow others to see your animals in marketplace"
              left={(props) => <List.Icon {...props} icon="eye" />}
              right={() => (
                <Switch
                  value={settings.privacy.showAnimalsPublicly}
                  onValueChange={(value) => updateSettings('privacy', 'showAnimalsPublicly', value)}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Allow Mating Suggestions"
              description="Receive breeding suggestions from other farmers"
              left={(props) => <List.Icon {...props} icon="heart" />}
              right={() => (
                <Switch
                  value={settings.privacy.allowMatingSuggestions}
                  onValueChange={(value) => updateSettings('privacy', 'allowMatingSuggestions', value)}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Show Contact Information"
              description="Display your contact details to other farmers"
              left={(props) => <List.Icon {...props} icon="card-account-details" />}
              right={() => (
                <Switch
                  value={settings.privacy.showContactInfo}
                  onValueChange={(value) => updateSettings('privacy', 'showContactInfo', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Accessibility */}
        <Card style={styles.settingsCard}>
          <Card.Title title="Accessibility" left={(props) => <List.Icon {...props} icon="human-handsup" />} />
          <Card.Content>
            <List.Item
              title="Voice Guidance"
              description="Enable audio guidance for navigation"
              left={(props) => <List.Icon {...props} icon="volume-high" />}
              right={() => (
                <Switch
                  value={settings.accessibility.voiceGuidance}
                  onValueChange={(value) => updateSettings('accessibility', 'voiceGuidance', value)}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Large Text"
              description="Use larger text for better readability"
              left={(props) => <List.Icon {...props} icon="format-size" />}
              right={() => (
                <Switch
                  value={settings.accessibility.largeText}
                  onValueChange={(value) => updateSettings('accessibility', 'largeText', value)}
                />
              )}
            />
            <Divider />
            <List.Item
              title="High Contrast"
              description="Use high contrast colors for better visibility"
              left={(props) => <List.Icon {...props} icon="contrast-circle" />}
              right={() => (
                <Switch
                  value={settings.accessibility.highContrast}
                  onValueChange={(value) => updateSettings('accessibility', 'highContrast', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* App Information */}
        <Card style={styles.settingsCard}>
          <Card.Title title="App & Support" left={(props) => <List.Icon {...props} icon="information" />} />
          <Card.Content>
            <List.Item
              title="Share App"
              description="Tell others about Farm Manager"
              left={(props) => <List.Icon {...props} icon="share" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleShareApp}
            />
            <Divider />
            <List.Item
              title="Help & Support"
              description="Get help and contact support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleSupport}
            />
            <Divider />
            <List.Item
              title="About"
              description="App version and information"
              left={(props) => <List.Icon {...props} icon="information-outline" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleAbout}
            />
          </Card.Content>
        </Card>

        {/* Logout */}
        <Card style={[styles.settingsCard, styles.logoutCard]}>
          <Card.Content>
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={styles.logoutButton}
              contentStyle={styles.logoutButtonContent}
              icon="logout"
              textColor={theme.colors.error}
            >
              Logout
            </Button>
          </Card.Content>
        </Card>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 4,
  },
  profileContent: {
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginRight: 8,
  },
  subscriptionBadge: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  farmName: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  editProfileButton: {
    borderColor: theme.colors.primary,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
  },
  logoutCard: {
    marginBottom: 32,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
  logoutButtonContent: {
    height: 50,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.primary,
  },
});

export default ProfileScreen; 