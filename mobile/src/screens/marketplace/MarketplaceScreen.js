import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
  Image,
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
  Avatar,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import VoiceGuidance from '../../components/VoiceGuidance';

const { width } = Dimensions.get('window');

const MarketplaceScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    category: 'all',
    priceRange: 'all',
  });

  const { user } = useSelector((state) => state.auth);

  const fetchListings = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/marketplace`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setListings(data.data || []);
        setFilteredListings(data.data || []);
      } else {
        Alert.alert('Error', 'Failed to fetch marketplace listings');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchListings();
  }, []);

  const filterAndSearchListings = useCallback(() => {
    let filtered = listings;

    // Apply filters
    if (selectedFilters.type !== 'all') {
      filtered = filtered.filter(listing => listing.type === selectedFilters.type);
    }
    
    if (selectedFilters.category !== 'all') {
      filtered = filtered.filter(listing => listing.animal?.basicInfo?.category === selectedFilters.category);
    }
    
    if (selectedFilters.priceRange !== 'all') {
      const [min, max] = selectedFilters.priceRange.split('-').map(Number);
      filtered = filtered.filter(listing => {
        const price = listing.pricing?.price || 0;
        if (max) return price >= min && price <= max;
        return price >= min;
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(listing =>
        listing.animal?.basicInfo?.name?.toLowerCase().includes(query) ||
        listing.animal?.basicInfo?.breed?.toLowerCase().includes(query) ||
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.owner?.name?.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredListings(filtered);
  }, [listings, selectedFilters, searchQuery]);

  useEffect(() => {
    filterAndSearchListings();
  }, [filterAndSearchListings]);

  const handleListingPress = (listing) => {
    navigation.navigate('MarketplaceDetail', { listingId: listing._id });
  };

  const handleCreateListing = () => {
    navigation.navigate('CreateListing');
  };

  const handleContactSeller = async (listing) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/marketplace/${listing._id}/inquire`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Hi, I'm interested in your ${listing.animal?.basicInfo?.name}. Could you please provide more details?`,
          }),
        }
      );

      if (response.ok) {
        Alert.alert(
          'Inquiry Sent',
          'Your inquiry has been sent to the seller. They will contact you soon.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to send inquiry');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const clearFilters = () => {
    setSelectedFilters({
      type: 'all',
      category: 'all',
      priceRange: 'all',
    });
    setSearchQuery('');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale': return 'currency-usd';
      case 'mating_service': return 'heart';
      case 'lease': return 'calendar-clock';
      case 'exchange': return 'swap-horizontal';
      default: return 'tag';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sale': return '#4CAF50';
      case 'mating_service': return '#E91E63';
      case 'lease': return '#2196F3';
      case 'exchange': return '#FF9800';
      default: return theme.colors.primary;
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

  const formatPrice = (pricing) => {
    if (!pricing?.price) return 'Price on request';
    const currency = pricing.currency || '$';
    return `${currency}${pricing.price.toLocaleString()}`;
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Unknown age';
    
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days old`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years}y ${remainingMonths}m old`;
    }
  };

  const renderListingCard = ({ item: listing }) => (
    <Card style={styles.listingCard} onPress={() => handleListingPress(listing)}>
      <View style={styles.cardImageContainer}>
        {listing.animal?.photos && listing.animal.photos.length > 0 ? (
          <Image 
            source={{ uri: listing.animal.photos[0].url }} 
            style={styles.animalImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.animalImage, styles.placeholderImage]}>
            <Ionicons 
              name={getAnimalIcon(listing.animal?.basicInfo?.category)} 
              size={40} 
              color={theme.colors.onSurfaceVariant} 
            />
          </View>
        )}
        
        <View style={styles.imageOverlay}>
          <Badge 
            style={[styles.typeBadge, { backgroundColor: getTypeColor(listing.type) }]}
          >
            {listing.type.replace('_', ' ')}
          </Badge>
          {listing.pricing?.negotiable && (
            <Chip style={styles.negotiableChip} textStyle={styles.negotiableText}>
              Negotiable
            </Chip>
          )}
        </View>
      </View>

      <Card.Content style={styles.cardContent}>
        <View style={styles.listingHeader}>
          <View style={styles.animalInfo}>
            <Title style={styles.animalName}>
              {listing.animal?.basicInfo?.name || 'Unnamed Animal'}
            </Title>
            <Paragraph style={styles.animalDetails}>
              {listing.animal?.basicInfo?.breed} • {listing.animal?.basicInfo?.gender}
            </Paragraph>
            <Text style={styles.animalAge}>
              {calculateAge(listing.animal?.basicInfo?.dateOfBirth)}
            </Text>
          </View>
          
          <View style={styles.priceSection}>
            <Text style={styles.price}>{formatPrice(listing.pricing)}</Text>
          </View>
        </View>

        {listing.description && (
          <Paragraph style={styles.description} numberOfLines={2}>
            {listing.description}
          </Paragraph>
        )}

        <View style={styles.sellerInfo}>
          <Avatar.Text 
            size={32} 
            label={listing.owner?.name?.substring(0, 2)?.toUpperCase() || 'FM'} 
            style={styles.sellerAvatar}
          />
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>{listing.owner?.name || 'Unknown Seller'}</Text>
            <Text style={styles.sellerLocation}>{listing.location || 'Location not specified'}</Text>
          </View>
          
          <Button
            mode="outlined"
            onPress={() => handleContactSeller(listing)}
            style={styles.contactButton}
            contentStyle={styles.contactButtonContent}
          >
            Contact
          </Button>
        </View>

        <View style={styles.listingFooter}>
          <View style={styles.listingMeta}>
            <Chip
              icon={getAnimalIcon(listing.animal?.basicInfo?.category)}
              style={styles.categoryChip}
              textStyle={styles.chipText}
            >
              {listing.animal?.basicInfo?.category || 'animal'}
            </Chip>
            <Chip
              icon={getTypeIcon(listing.type)}
              style={[styles.typeChip, { backgroundColor: `${getTypeColor(listing.type)}20` }]}
              textStyle={[styles.chipText, { color: getTypeColor(listing.type) }]}
            >
              {listing.type.replace('_', ' ')}
            </Chip>
          </View>
          
          <Text style={styles.postedDate}>
            Posted {new Date(listing.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFilterChips = () => {
    const activeFilters = [];
    
    if (selectedFilters.type !== 'all') {
      activeFilters.push({
        key: 'type',
        label: selectedFilters.type.replace('_', ' '),
        value: selectedFilters.type
      });
    }
    
    if (selectedFilters.category !== 'all') {
      activeFilters.push({
        key: 'category',
        label: selectedFilters.category,
        value: selectedFilters.category
      });
    }
    
    if (selectedFilters.priceRange !== 'all') {
      const priceLabels = {
        '0-1000': 'Under $1,000',
        '1000-5000': '$1,000 - $5,000',
        '5000-10000': '$5,000 - $10,000',
        '10000': 'Over $10,000'
      };
      activeFilters.push({
        key: 'priceRange',
        label: priceLabels[selectedFilters.priceRange] || selectedFilters.priceRange,
        value: selectedFilters.priceRange
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
      <Ionicons name="storefront-outline" size={80} color={theme.colors.onSurfaceVariant} />
      <Title style={styles.emptyTitle}>No Listings Found</Title>
      <Paragraph style={styles.emptyMessage}>
        {searchQuery || Object.values(selectedFilters).some(f => f !== 'all')
          ? 'Try adjusting your search or filters'
          : 'No animals are currently available in the marketplace'
        }
      </Paragraph>
      <Button
        mode="contained"
        onPress={handleCreateListing}
        style={styles.createListingButton}
        icon="plus"
      >
        Create Your First Listing
      </Button>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading marketplace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <VoiceGuidance
        text={`Welcome to the marketplace. There are ${filteredListings.length} animals available for sale or breeding.`}
        autoPlay={listings.length > 0}
      />

      {/* Search and Filter Header */}
      <View style={styles.header}>
        <Searchbar
          placeholder="Search animals, breeds, or sellers..."
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
              setSelectedFilters(prev => ({ ...prev, type: 'sale' }));
              setFilterMenuVisible(false);
            }}
            title="For Sale"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, type: 'mating_service' }));
              setFilterMenuVisible(false);
            }}
            title="Mating Service"
          />
          <Divider />
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
              setSelectedFilters(prev => ({ ...prev, priceRange: '0-1000' }));
              setFilterMenuVisible(false);
            }}
            title="Under $1,000"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, priceRange: '1000-5000' }));
              setFilterMenuVisible(false);
            }}
            title="$1,000 - $5,000"
          />
          <Menu.Item
            onPress={() => {
              setSelectedFilters(prev => ({ ...prev, priceRange: '5000-10000' }));
              setFilterMenuVisible(false);
            }}
            title="$5,000 - $10,000"
          />
        </Menu>
      </View>

      {/* Active Filters */}
      {renderFilterChips()}

      {/* Listings */}
      <FlatList
        data={filteredListings}
        renderItem={renderListingCard}
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
        onPress={handleCreateListing}
        label="Create Listing"
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
  listingCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
  },
  animalImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeBadge: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  negotiableChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 28,
  },
  negotiableText: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  cardContent: {
    paddingVertical: 16,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.onSurface,
  },
  animalDetails: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  animalAge: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  description: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 16,
    lineHeight: 20,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  sellerAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  sellerLocation: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  contactButton: {
    borderColor: theme.colors.primary,
  },
  contactButtonContent: {
    height: 36,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingMeta: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryChip: {
    marginRight: 8,
    height: 28,
  },
  typeChip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  postedDate: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
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
  createListingButton: {
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

export default MarketplaceScreen; 