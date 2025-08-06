import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Searchbar,
  Chip,
  FAB,
  ActivityIndicator,
  Menu,
  Divider,
  Badge,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import VoiceGuidance from '../../components/VoiceGuidance';

const { width } = Dimensions.get('window');

const SchedulesScreen = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all',
  });

  const { user } = useSelector((state) => state.auth);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/schedules`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.data || []);
        setFilteredSchedules(data.data || []);
      } else {
        Alert.alert('Error', 'Failed to fetch schedules');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedules();
  }, []);

  const filterAndSearchSchedules = useCallback(() => {
    let filtered = schedules;

    // Apply filters
    if (selectedFilters.type !== 'all') {
      filtered = filtered.filter(schedule => schedule.type === selectedFilters.type);
    }
    
    if (selectedFilters.status !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === selectedFilters.status);
    }
    
    if (selectedFilters.priority !== 'all') {
      filtered = filtered.filter(schedule => schedule.priority === selectedFilters.priority);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(schedule =>
        schedule.title?.toLowerCase().includes(query) ||
        schedule.animal?.basicInfo?.name?.toLowerCase().includes(query) ||
        schedule.description?.toLowerCase().includes(query)
      );
    }

    // Sort by scheduled date
    filtered.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    setFilteredSchedules(filtered);
  }, [schedules, selectedFilters, searchQuery]);

  useEffect(() => {
    filterAndSearchSchedules();
  }, [filterAndSearchSchedules]);

  const handleSchedulePress = (schedule) => {
    navigation.navigate('ScheduleDetail', { scheduleId: schedule._id });
  };

  const handleAddSchedule = () => {
    navigation.navigate('AddSchedule');
  };

  const handleCompleteSchedule = async (scheduleId) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/schedules/${scheduleId}/complete`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            completedDate: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        fetchSchedules(); // Refresh the list
        Alert.alert('Success', 'Schedule marked as completed');
      } else {
        Alert.alert('Error', 'Failed to complete schedule');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const clearFilters = () => {
    setSelectedFilters({
      type: 'all',
      status: 'all',
      priority: 'all',
    });
    setSearchQuery('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      case 'cancelled': return '#9E9E9E';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'vaccination': return 'medical-bag';
      case 'deworming': return 'pill';
      case 'mating': return 'heart';
      case 'health_check': return 'stethoscope';
      case 'breeding': return 'baby';
      default: return 'calendar';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;

    return date.toLocaleDateString();
  };

  const isOverdue = (scheduledDate, status) => {
    if (status === 'completed' || status === 'cancelled') return false;
    return new Date(scheduledDate) < new Date();
  };

  const renderScheduleCard = ({ item: schedule }) => {
    const overdue = isOverdue(schedule.scheduledDate, schedule.status);
    const actualStatus = overdue && schedule.status === 'pending' ? 'overdue' : schedule.status;

    return (
      <Card style={styles.scheduleCard} onPress={() => handleSchedulePress(schedule)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.scheduleInfo}>
              <View style={styles.scheduleIcon}>
                <Ionicons
                  name={getTypeIcon(schedule.type)}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.scheduleDetails}>
                <Title style={styles.scheduleTitle}>{schedule.title}</Title>
                <Paragraph style={styles.animalName}>
                  {schedule.animal?.basicInfo?.name || 'Unknown Animal'}
                </Paragraph>
                <Text style={styles.scheduleDate}>
                  {formatDate(schedule.scheduledDate)}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardActions}>
              <Badge
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(actualStatus) }
                ]}
              >
                {actualStatus}
              </Badge>
              {schedule.priority !== 'medium' && (
                <Badge
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(schedule.priority) }
                  ]}
                >
                  {schedule.priority}
                </Badge>
              )}
            </View>
          </View>

          {schedule.description && (
            <Paragraph style={styles.scheduleDescription} numberOfLines={2}>
              {schedule.description}
            </Paragraph>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.scheduleMetadata}>
              <Chip
                icon={getTypeIcon(schedule.type)}
                style={styles.typeChip}
                textStyle={styles.chipText}
              >
                {schedule.type.replace('_', ' ')}
              </Chip>
            </View>
            
            {schedule.status === 'pending' && !overdue && (
              <Button
                mode="outlined"
                onPress={() => handleCompleteSchedule(schedule._id)}
                style={styles.completeButton}
                contentStyle={styles.completeButtonContent}
              >
                Complete
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderFilterChips = () => {
    const activeFilters = [];
    
    if (selectedFilters.type !== 'all') {
      activeFilters.push({
        key: 'type',
        label: selectedFilters.type.replace('_', ' '),
        value: selectedFilters.type
      });
    }
    
    if (selectedFilters.status !== 'all') {
      activeFilters.push({
        key: 'status',
        label: selectedFilters.status,
        value: selectedFilters.status
      });
    }
    
    if (selectedFilters.priority !== 'all') {
      activeFilters.push({
        key: 'priority',
        label: selectedFilters.priority,
        value: selectedFilters.priority
      });
    }

    if (activeFilters.length === 0) return null;

    return (
      <View style={styles.filterChipsContainer}>
        {activeFilters.map((filter) => (
          <Chip
            key={filter.key}
            onClose={() => setSelectedFilters(prev => ({ ...prev, [filter.key]: 'all' }))}
            style={styles.filterChip}
          >
            {filter.label}
          </Chip>
        ))}
        <Button mode="text" onPress={clearFilters} style={styles.clearFiltersButton}>
          Clear All
        </Button>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={80} color={theme.colors.onSurfaceVariant} />
      <Title style={styles.emptyTitle}>No Schedules Found</Title>
      <Paragraph style={styles.emptyMessage}>
        {searchQuery || Object.values(selectedFilters).some(f => f !== 'all')
          ? 'Try adjusting your search or filters'
          : 'Start by creating your first schedule'
        }
      </Paragraph>
      <Button
        mode="contained"
        onPress={handleAddSchedule}
        style={styles.addFirstScheduleButton}
        icon="plus"
      >
        Create Your First Schedule
      </Button>
    </View>
  );

  const getScheduleStats = () => {
    const pending = schedules.filter(s => s.status === 'pending').length;
    const overdue = schedules.filter(s => isOverdue(s.scheduledDate, s.status)).length;
    const completed = schedules.filter(s => s.status === 'completed').length;
    
    return { pending, overdue, completed };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your schedules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getScheduleStats();

  return (
    <SafeAreaView style={styles.container}>
      <VoiceGuidance
        text={`You have ${stats.pending} pending schedules, ${stats.overdue} overdue, and ${stats.completed} completed.`}
        autoPlay={schedules.length > 0}
      />

      {/* Stats Header */}
      {schedules.length > 0 && (
        <View style={styles.statsHeader}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.error }]}>{stats.overdue}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      )}

      {/* Search and Filter Header */}
      <View style={styles.header}>
        <Searchbar
          placeholder="Search schedules by title, animal, or description..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />
        
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setFilterMenuVisible(true)}
              style={styles.filterButton}
              icon="filter-variant"
            >
              Filter
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, type: 'vaccination' }));
              setFilterMenuVisible(false);
            }}
            title="Vaccination"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, type: 'deworming' }));
              setFilterMenuVisible(false);
            }}
            title="Deworming"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, type: 'health_check' }));
              setFilterMenuVisible(false);
            }}
            title="Health Check"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, status: 'pending' }));
              setFilterMenuVisible(false);
            }}
            title="Pending"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, status: 'completed' }));
              setFilterMenuVisible(false);
            }}
            title="Completed"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, priority: 'urgent' }));
              setFilterMenuVisible(false);
            }}
            title="Urgent"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, priority: 'high' }));
              setFilterMenuVisible(false);
            }}
            title="High Priority"
          />
        </Menu>
      </View>

      {/* Active Filters */}
      {renderFilterChips()}

      {/* Schedules List */}
      <FlatList
        data={filteredSchedules}
        renderItem={renderScheduleCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddSchedule}
        label="Add Schedule"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    elevation: 2,
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
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    marginRight: 12,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  filterButton: {
    borderColor: theme.colors.primary,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  clearFiltersButton: {
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  scheduleCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  cardContent: {
    paddingVertical: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scheduleInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  scheduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: theme.colors.onSurface,
  },
  animalName: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
  },
  scheduleDate: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priorityBadge: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scheduleDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleMetadata: {
    flex: 1,
  },
  typeChip: {
    alignSelf: 'flex-start',
    height: 28,
  },
  chipText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  completeButton: {
    borderColor: '#4CAF50',
  },
  completeButtonContent: {
    height: 36,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    color: theme.colors.onSurface,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 24,
  },
  addFirstScheduleButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default SchedulesScreen; 