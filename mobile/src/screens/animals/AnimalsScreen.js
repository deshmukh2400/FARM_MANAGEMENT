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

const AnimalsScreen = ({ navigation }) => {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: 'all',
    gender: 'all',
    healthStatus: 'all',
  });

  const { user } = useSelector((state) => state.auth);

  const fetchAnimals = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/animals`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnimals(data.data || []);
        setFilteredAnimals(data.data || []);
      } else {
        Alert.alert('Error', 'Failed to fetch animals');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnimals();
  }, []);

  const filterAndSearchAnimals = useCallback(() => {
    let filtered = animals;

    // Apply filters
    if (selectedFilters.category !== 'all') {
      filtered = filtered.filter(animal => 
        animal.basicInfo?.category === selectedFilters.category
      );
    }
    
    if (selectedFilters.gender !== 'all') {
      filtered = filtered.filter(animal => 
        animal.basicInfo?.gender === selectedFilters.gender
      );
    }
    
    if (selectedFilters.healthStatus !== 'all') {
      filtered = filtered.filter(animal => 
        animal.currentStatus?.healthStatus === selectedFilters.healthStatus
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(animal =>
        animal.basicInfo?.name?.toLowerCase().includes(query) ||
        animal.registrationNumber?.toLowerCase().includes(query) ||
        animal.basicInfo?.breed?.toLowerCase().includes(query)
      );
    }

    setFilteredAnimals(filtered);
  }, [animals, selectedFilters, searchQuery]);

  useEffect(() => {
    filterAndSearchAnimals();
  }, [filterAndSearchAnimals]);

  const handleAnimalPress = (animal) => {
    navigation.navigate('AnimalDetail', { animalId: animal._id });
  };

  const handleAddAnimal = () => {
    navigation.navigate('AddAnimal');
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: 'all',
      gender: 'all',
      healthStatus: 'all',
    });
    setSearchQuery('');
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#4CAF50';
      case 'sick': return '#F44336';
      case 'injured': return '#FF9800';
      case 'pregnant': return '#9C27B0';
      case 'lactating': return '#2196F3';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getAnimalIcon = (category) => {
    switch (category) {
      case 'cattle': return 'cow';
      case 'goat': return 'goat';
      case 'sheep': return 'sheep';
      case 'horse': return 'horse';
      case 'pig': return 'pig';
      case 'chicken': return 'egg';
      default: return 'paw';
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Unknown';
    
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years}y ${remainingMonths}m`;
    }
  };

  const renderAnimalCard = ({ item: animal }) => (
    <Card style={styles.animalCard} onPress={() => handleAnimalPress(animal)}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.animalInfo}>
            <View style={styles.animalIcon}>
              <Ionicons
                name={getAnimalIcon(animal.basicInfo?.category)}
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.animalDetails}>
              <Title style={styles.animalName}>
                {animal.basicInfo?.name || 'Unnamed'}
              </Title>
              <Paragraph style={styles.animalBreed}>
                {animal.basicInfo?.breed} • {animal.basicInfo?.gender}
              </Paragraph>
              <Text style={styles.animalAge}>
                Age: {calculateAge(animal.basicInfo?.dateOfBirth)}
              </Text>
            </View>
          </View>
          
          <View style={styles.cardActions}>
            <Badge
              style={[
                styles.healthBadge,
                { backgroundColor: getHealthStatusColor(animal.currentStatus?.healthStatus) }
              ]}
            >
              {animal.currentStatus?.healthStatus || 'Unknown'}
            </Badge>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.animalStats}>
            <Text style={styles.statText}>
              ID: {animal.registrationNumber || 'Not assigned'}
            </Text>
            {animal.currentStatus?.lastWeightRecord && (
              <Text style={styles.statText}>
                Weight: {animal.currentStatus.lastWeightRecord}kg
              </Text>
            )}
          </View>
          
          <View style={styles.statusChips}>
            {animal.currentStatus?.isForSale && (
              <Chip
                icon="currency-usd"
                style={styles.statusChip}
                textStyle={styles.chipText}
              >
                For Sale
              </Chip>
            )}
            {animal.currentStatus?.isAvailableForMating && (
              <Chip
                icon="heart"
                style={styles.statusChip}
                textStyle={styles.chipText}
              >
                Breeding
              </Chip>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFilterChips = () => {
    const activeFilters = [];
    
    if (selectedFilters.category !== 'all') {
      activeFilters.push({
        key: 'category',
        label: selectedFilters.category,
        value: selectedFilters.category
      });
    }
    
    if (selectedFilters.gender !== 'all') {
      activeFilters.push({
        key: 'gender',
        label: selectedFilters.gender,
        value: selectedFilters.gender
      });
    }
    
    if (selectedFilters.healthStatus !== 'all') {
      activeFilters.push({
        key: 'healthStatus',
        label: selectedFilters.healthStatus,
        value: selectedFilters.healthStatus
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
      <Ionicons name="paw-outline" size={80} color={theme.colors.onSurfaceVariant} />
      <Title style={styles.emptyTitle}>No Animals Found</Title>
      <Paragraph style={styles.emptyMessage}>
        {searchQuery || Object.values(selectedFilters).some(f => f !== 'all')
          ? 'Try adjusting your search or filters'
          : 'Start by adding your first animal to the farm'
        }
      </Paragraph>
      <Button
        mode="contained"
        onPress={handleAddAnimal}
        style={styles.addFirstAnimalButton}
        icon="plus"
      >
        Add Your First Animal
      </Button>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your animals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <VoiceGuidance
        text={`You have ${animals.length} animals registered. Use search or filters to find specific animals.`}
        autoPlay={animals.length > 0}
      />

      {/* Search and Filter Header */}
      <View style={styles.header}>
        <Searchbar
          placeholder="Search animals by name, breed, or ID..."
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
              setSelectedFilters(prev => ({ ...prev, category: 'cattle' }));
              setFilterMenuVisible(false);
            }}
            title="Cattle"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, category: 'goat' }));
              setFilterMenuVisible(false);
            }}
            title="Goats"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, category: 'sheep' }));
              setFilterMenuVisible(false);
            }}
            title="Sheep"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, gender: 'male' }));
              setFilterMenuVisible(false);
            }}
            title="Male"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, gender: 'female' }));
              setFilterMenuVisible(false);
            }}
            title="Female"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, healthStatus: 'healthy' }));
              setFilterMenuVisible(false);
            }}
            title="Healthy"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, healthStatus: 'sick' }));
              setFilterMenuVisible(false);
            }}
            title="Sick"
          />
        </Menu>
      </View>

      {/* Active Filters */}
      {renderFilterChips()}

      {/* Animals List */}
      <FlatList
        data={filteredAnimals}
        renderItem={renderAnimalCard}
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
        onPress={handleAddAnimal}
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
  animalCard: {
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
  animalInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  animalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  animalDetails: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: theme.colors.onSurface,
  },
  animalBreed: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  animalAge: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  healthBadge: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  animalStats: {
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusChip: {
    marginLeft: 4,
    marginBottom: 4,
    height: 28,
  },
  chipText: {
    fontSize: 12,
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
  addFirstAnimalButton: {
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

export default AnimalsScreen; 