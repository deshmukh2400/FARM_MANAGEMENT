import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Avatar,
  Chip,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import VoiceGuidance from '../../components/VoiceGuidance';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalAnimals: 0,
    healthyAnimals: 0,
    upcomingSchedules: 0,
    lowStockItems: 0,
    recentActivities: [],
    weatherInfo: null,
  });
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/dashboard`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const handleQuickAction = (action) => {
    switch (action) {
      case 'addAnimal':
        navigation.navigate('Animals', { screen: 'AddAnimal' });
        break;
      case 'viewAnimals':
        navigation.navigate('Animals');
        break;
      case 'viewSchedules':
        navigation.navigate('Schedules');
        break;
      case 'viewInventory':
        navigation.navigate('Inventory');
        break;
      case 'viewMarketplace':
        navigation.navigate('Marketplace');
        break;
      default:
        break;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderStatCard = (title, value, icon, color, onPress) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <Card.Content style={styles.statCardContent}>
        <View style={styles.statIcon}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickAction = (title, icon, color, onPress) => (
    <Card style={styles.quickActionCard} onPress={onPress}>
      <Card.Content style={styles.quickActionContent}>
        <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.quickActionTitle}>{title}</Text>
      </Card.Content>
    </Card>
  );

  const renderRecentActivity = (activity, index) => (
    <Card key={index} style={styles.activityCard}>
      <Card.Content style={styles.activityContent}>
        <View style={styles.activityIcon}>
          <Ionicons 
            name={activity.icon} 
            size={20} 
            color={theme.colors.primary} 
          />
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your farm data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <VoiceGuidance
          text={`${getGreeting()} ${user?.name}. Welcome to your farm dashboard.`}
          autoPlay={true}
        />

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Avatar.Text 
                size={50} 
                label={user?.name?.substring(0, 2)?.toUpperCase() || 'FM'} 
                style={styles.avatar}
              />
              <View style={styles.userDetails}>
                <Title style={styles.greeting}>{getGreeting()}!</Title>
                <Paragraph style={styles.userName}>{user?.name}</Paragraph>
                <Paragraph style={styles.farmName}>{user?.farmName || 'Your Farm'}</Paragraph>
              </View>
            </View>
            <Button
              mode="outlined"
              icon="account-cog"
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}
            >
              Profile
            </Button>
          </View>
        </View>

        {/* Weather Info */}
        {dashboardData.weatherInfo && (
          <Card style={styles.weatherCard}>
            <Card.Content style={styles.weatherContent}>
              <View style={styles.weatherIcon}>
                <Ionicons 
                  name="partly-sunny" 
                  size={32} 
                  color={theme.colors.primary} 
                />
              </View>
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTemp}>
                  {dashboardData.weatherInfo.temperature}°C
                </Text>
                <Text style={styles.weatherDesc}>
                  {dashboardData.weatherInfo.description}
                </Text>
                <Text style={styles.weatherLocation}>
                  {dashboardData.weatherInfo.location}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Statistics Section */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Farm Overview</Title>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Total Animals',
              dashboardData.totalAnimals,
              'paw',
              '#4CAF50',
              () => handleQuickAction('viewAnimals')
            )}
            {renderStatCard(
              'Healthy Animals',
              dashboardData.healthyAnimals,
              'heart',
              '#2196F3',
              () => handleQuickAction('viewAnimals')
            )}
            {renderStatCard(
              'Upcoming Tasks',
              dashboardData.upcomingSchedules,
              'calendar',
              '#FF9800',
              () => handleQuickAction('viewSchedules')
            )}
            {renderStatCard(
              'Low Stock Items',
              dashboardData.lowStockItems,
              'alert-circle',
              '#F44336',
              () => handleQuickAction('viewInventory')
            )}
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.quickActionsGrid}>
            {renderQuickAction(
              'Add Animal',
              'add-circle',
              '#4CAF50',
              () => handleQuickAction('addAnimal')
            )}
            {renderQuickAction(
              'View Animals',
              'paw',
              '#2196F3',
              () => handleQuickAction('viewAnimals')
            )}
            {renderQuickAction(
              'Schedules',
              'calendar',
              '#FF9800',
              () => handleQuickAction('viewSchedules')
            )}
            {renderQuickAction(
              'Inventory',
              'cube',
              '#9C27B0',
              () => handleQuickAction('viewInventory')
            )}
            {renderQuickAction(
              'Marketplace',
              'storefront',
              '#00BCD4',
              () => handleQuickAction('viewMarketplace')
            )}
          </View>
        </View>

        {/* Recent Activities Section */}
        {dashboardData.recentActivities.length > 0 && (
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Recent Activities</Title>
            <View style={styles.activitiesList}>
              {dashboardData.recentActivities.slice(0, 5).map(renderRecentActivity)}
            </View>
            <Button
              mode="text"
              onPress={() => {/* Navigate to full activity log */}}
              style={styles.viewAllButton}
            >
              View All Activities
            </Button>
          </View>
        )}

        {/* Alerts Section */}
        {(dashboardData.upcomingSchedules > 0 || dashboardData.lowStockItems > 0) && (
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Alerts & Reminders</Title>
            <View style={styles.alertsContainer}>
              {dashboardData.upcomingSchedules > 0 && (
                <Chip
                  icon="calendar-alert"
                  style={[styles.alertChip, { backgroundColor: '#FFF3E0' }]}
                  textStyle={{ color: '#F57C00' }}
                  onPress={() => handleQuickAction('viewSchedules')}
                >
                  {dashboardData.upcomingSchedules} upcoming tasks
                </Chip>
              )}
              {dashboardData.lowStockItems > 0 && (
                <Chip
                  icon="alert-circle"
                  style={[styles.alertChip, { backgroundColor: '#FFEBEE' }]}
                  textStyle={{ color: '#D32F2F' }}
                  onPress={() => handleQuickAction('viewInventory')}
                >
                  {dashboardData.lowStockItems} low stock items
                </Chip>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => handleQuickAction('addAnimal')}
        label="Add Animal"
      />
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
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: theme.colors.secondary,
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    marginBottom: 2,
  },
  farmName: {
    fontSize: 14,
    color: theme.colors.onPrimary,
    opacity: 0.8,
  },
  profileButton: {
    borderColor: theme.colors.onPrimary,
  },
  weatherCard: {
    margin: 20,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    marginRight: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  weatherDesc: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'capitalize',
  },
  weatherLocation: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.onSurface,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statIcon: {
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  quickActionContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.onSurface,
  },
  activitiesList: {
    marginBottom: 16,
  },
  activityCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  viewAllButton: {
    alignSelf: 'center',
  },
  alertsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  alertChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default DashboardScreen; 