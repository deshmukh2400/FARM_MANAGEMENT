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
  ProgressBar,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import VoiceGuidance from '../../components/VoiceGuidance';

const { width } = Dimensions.get('window');

const InventoryScreen = ({ navigation }) => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: 'all',
    status: 'all',
  });

  const { user } = useSelector((state) => state.auth);

  const fetchInventory = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/inventory`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInventory(data.data || []);
        setFilteredInventory(data.data || []);
      } else {
        Alert.alert('Error', 'Failed to fetch inventory');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInventory();
  }, []);

  const filterAndSearchInventory = useCallback(() => {
    let filtered = inventory;

    // Apply filters
    if (selectedFilters.category !== 'all') {
      filtered = filtered.filter(item => item.category === selectedFilters.category);
    }
    
    if (selectedFilters.status === 'lowStock') {
      filtered = filtered.filter(item => item.alerts?.lowStock);
    } else if (selectedFilters.status === 'nearExpiry') {
      filtered = filtered.filter(item => item.alerts?.nearExpiry);
    } else if (selectedFilters.status === 'expired') {
      filtered = filtered.filter(item => item.alerts?.expired);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    // Sort by alerts first, then by name
    filtered.sort((a, b) => {
      const aHasAlert = a.alerts?.lowStock || a.alerts?.nearExpiry || a.alerts?.expired;
      const bHasAlert = b.alerts?.lowStock || b.alerts?.nearExpiry || b.alerts?.expired;
      
      if (aHasAlert && !bHasAlert) return -1;
      if (!aHasAlert && bHasAlert) return 1;
      
      return (a.name || '').localeCompare(b.name || '');
    });

    setFilteredInventory(filtered);
  }, [inventory, selectedFilters, searchQuery]);

  useEffect(() => {
    filterAndSearchInventory();
  }, [filterAndSearchInventory]);

  const handleItemPress = (item) => {
    navigation.navigate('InventoryDetail', { itemId: item._id });
  };

  const handleAddItem = () => {
    navigation.navigate('AddInventoryItem');
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: 'all',
      status: 'all',
    });
    setSearchQuery('');
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'medicine': return 'medical-bag';
      case 'vaccine': return 'needle';
      case 'feed': return 'grain';
      case 'supplement': return 'pill';
      case 'equipment': return 'tools';
      default: return 'cube';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'medicine': return '#F44336';
      case 'vaccine': return '#2196F3';
      case 'feed': return '#4CAF50';
      case 'supplement': return '#FF9800';
      case 'equipment': return '#9C27B0';
      default: return theme.colors.primary;
    }
  };

  const getStockLevel = (item) => {
    const current = item.stock?.currentQuantity || 0;
    const min = item.stock?.minThreshold || 0;
    const max = item.stock?.maxCapacity || current;
    
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getStockLevelColor = (item) => {
    if (item.alerts?.expired) return '#F44336';
    if (item.alerts?.lowStock) return '#FF9800';
    if (item.alerts?.nearExpiry) return '#FF5722';
    return '#4CAF50';
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'No expiry date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Expired ${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 30) return `Expires in ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const renderInventoryCard = ({ item }) => {
    const stockLevel = getStockLevel(item);
    const stockColor = getStockLevelColor(item);
    const hasAlerts = item.alerts?.lowStock || item.alerts?.nearExpiry || item.alerts?.expired;

    return (
      <Card style={[styles.inventoryCard, hasAlerts && styles.alertCard]} onPress={() => handleItemPress(item)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.itemInfo}>
              <View style={[styles.itemIcon, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
                <Ionicons
                  name={getCategoryIcon(item.category)}
                  size={24}
                  color={getCategoryColor(item.category)}
                />
              </View>
              <View style={styles.itemDetails}>
                <Title style={styles.itemName}>{item.name}</Title>
                <Paragraph style={styles.itemBrand}>
                  {item.brand && `${item.brand} • `}{item.category}
                </Paragraph>
                <Text style={styles.itemQuantity}>
                  {item.stock?.currentQuantity || 0} {item.stock?.unit || 'units'}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardActions}>
              {hasAlerts && (
                <Badge style={styles.alertBadge}>
                  <Ionicons name="alert-circle" size={12} color="#FFFFFF" />
                </Badge>
              )}
            </View>
          </View>

          {/* Stock Level Bar */}
          <View style={styles.stockSection}>
            <View style={styles.stockHeader}>
              <Text style={styles.stockLabel}>Stock Level</Text>
              <Text style={[styles.stockPercentage, { color: stockColor }]}>
                {Math.round(stockLevel)}%
              </Text>
            </View>
            <ProgressBar
              progress={stockLevel / 100}
              color={stockColor}
              style={styles.stockBar}
            />
            {item.stock?.minThreshold && (
              <Text style={styles.minThreshold}>
                Min: {item.stock.minThreshold} {item.stock?.unit || 'units'}
              </Text>
            )}
          </View>

          {/* Expiry Information */}
          {item.dates?.expiryDate && (
            <View style={styles.expirySection}>
              <Ionicons 
                name="time-outline" 
                size={16} 
                color={item.alerts?.nearExpiry || item.alerts?.expired ? '#F44336' : theme.colors.onSurfaceVariant} 
              />
              <Text style={[
                styles.expiryText,
                (item.alerts?.nearExpiry || item.alerts?.expired) && { color: '#F44336' }
              ]}>
                {formatExpiryDate(item.dates.expiryDate)}
              </Text>
            </View>
          )}

          {/* Alerts */}
          {hasAlerts && (
            <View style={styles.alertsSection}>
              {item.alerts?.expired && (
                <Chip icon="alert-circle" style={[styles.alertChip, { backgroundColor: '#FFEBEE' }]} textStyle={{ color: '#D32F2F' }}>
                  Expired
                </Chip>
              )}
              {item.alerts?.lowStock && (
                <Chip icon="arrow-down" style={[styles.alertChip, { backgroundColor: '#FFF3E0' }]} textStyle={{ color: '#F57C00' }}>
                  Low Stock
                </Chip>
              )}
              {item.alerts?.nearExpiry && !item.alerts?.expired && (
                <Chip icon="clock-alert" style={[styles.alertChip, { backgroundColor: '#FFF3E0' }]} textStyle={{ color: '#F57C00' }}>
                  Near Expiry
                </Chip>
              )}
            </View>
          )}

          {/* Cost Information */}
          {item.pricing?.costPerUnit && (
            <View style={styles.costSection}>
              <Text style={styles.costText}>
                Cost: {item.pricing.currency || '$'}{item.pricing.costPerUnit}/{item.stock?.unit || 'unit'}
              </Text>
              <Text style={styles.totalValue}>
                Total Value: {item.pricing.currency || '$'}{((item.pricing.costPerUnit || 0) * (item.stock?.currentQuantity || 0)).toFixed(2)}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderFilterChips = () => {
    const activeFilters = [];
    
    if (selectedFilters.category !== 'all') {
      activeFilters.push({
        key: 'category',
        label: selectedFilters.category,
        value: selectedFilters.category
      });
    }
    
    if (selectedFilters.status !== 'all') {
      const statusLabels = {
        lowStock: 'Low Stock',
        nearExpiry: 'Near Expiry',
        expired: 'Expired'
      };
      activeFilters.push({
        key: 'status',
        label: statusLabels[selectedFilters.status] || selectedFilters.status,
        value: selectedFilters.status
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
      <Ionicons name="cube-outline" size={80} color={theme.colors.onSurfaceVariant} />
      <Title style={styles.emptyTitle}>No Inventory Items</Title>
      <Paragraph style={styles.emptyMessage}>
        {searchQuery || Object.values(selectedFilters).some(f => f !== 'all')
          ? 'Try adjusting your search or filters'
          : 'Start by adding medicines, feeds, or equipment to your inventory'
        }
      </Paragraph>
      <Button
        mode="contained"
        onPress={handleAddItem}
        style={styles.addFirstItemButton}
        icon="plus"
      >
        Add Your First Item
      </Button>
    </View>
  );

  const getInventoryStats = () => {
    const total = inventory.length;
    const lowStock = inventory.filter(item => item.alerts?.lowStock).length;
    const nearExpiry = inventory.filter(item => item.alerts?.nearExpiry).length;
    const expired = inventory.filter(item => item.alerts?.expired).length;
    
    return { total, lowStock, nearExpiry, expired };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your inventory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getInventoryStats();

  return (
    <SafeAreaView style={styles.container}>
      <VoiceGuidance
        text={`You have ${stats.total} inventory items. ${stats.lowStock} items are low in stock, ${stats.nearExpiry} are near expiry.`}
        autoPlay={inventory.length > 0}
      />

      {/* Stats Header */}
      {inventory.length > 0 && (
        <View style={styles.statsHeader}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.lowStock}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#F44336' }]}>{stats.nearExpiry}</Text>
            <Text style={styles.statLabel}>Near Expiry</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#D32F2F' }]}>{stats.expired}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
        </View>
      )}

      {/* Search and Filter Header */}
      <View style={styles.header}>
        <Searchbar
          placeholder="Search inventory by name, brand, or description..."
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
              setSelectedFilters(prev => ({ ...prev, category: 'medicine' }));
              setFilterMenuVisible(false);
            }}
            title="Medicine"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, category: 'vaccine' }));
              setFilterMenuVisible(false);
            }}
            title="Vaccine"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, category: 'feed' }));
              setFilterMenuVisible(false);
            }}
            title="Feed"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, category: 'equipment' }));
              setFilterMenuVisible(false);
            }}
            title="Equipment"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, status: 'lowStock' }));
              setFilterMenuVisible(false);
            }}
            title="Low Stock"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, status: 'nearExpiry' }));
              setFilterMenuVisible(false);
            }}
            title="Near Expiry"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, status: 'expired' }));
              setFilterMenuVisible(false);
            }}
            title="Expired"
          />
        </Menu>
      </View>

      {/* Active Filters */}
      {renderFilterChips()}

      {/* Inventory List */}
      <FlatList
        data={filteredInventory}
        renderItem={renderInventoryCard}
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
        onPress={handleAddItem}
        label="Add Item"
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
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
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
  inventoryCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
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
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: theme.colors.onSurface,
  },
  itemBrand: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  alertBadge: {
    backgroundColor: '#F44336',
  },
  stockSection: {
    marginBottom: 12,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  stockPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stockBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  minThreshold: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  expirySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expiryText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginLeft: 6,
  },
  alertsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  alertChip: {
    marginRight: 8,
    marginBottom: 4,
    height: 28,
  },
  costSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
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
  addFirstItemButton: {
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

export default InventoryScreen; 