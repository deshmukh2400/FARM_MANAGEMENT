import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  Share,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Chip,
  Avatar,
  ActivityIndicator,
  Menu,
  Divider,
  List,
  Badge,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import VoiceGuidance from '../../components/VoiceGuidance';

const { width, height } = Dimensions.get('window');

const AnimalDetailScreen = ({ route, navigation }) => {
  const { animalId } = route.params;
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchAnimalDetails();
  }, [animalId]);

  const fetchAnimalDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/animals/${animalId}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnimal(data.data);
      } else {
        Alert.alert('Error', 'Failed to fetch animal details');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditAnimal', { animalId });
    setMenuVisible(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Animal',
      'Are you sure you want to delete this animal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]
    );
    setMenuVisible(false);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/animals/${animalId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Animal deleted successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to delete animal');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${animal.basicInfo?.name} - a ${animal.basicInfo?.breed} ${animal.basicInfo?.category} from my farm!`,
        title: 'Share Animal',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
    setMenuVisible(false);
  };

  const handleAddSchedule = () => {
    navigation.navigate('Schedules', { 
      screen: 'AddSchedule', 
      params: { animalId, animalName: animal.basicInfo?.name }
    });
  };

  const handleAddWeight = () => {
    // Navigate to add weight record screen
    navigation.navigate('AddWeightRecord', { animalId });
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

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Basic Information */}
      <Card style={styles.infoCard}>
        <Card.Title title="Basic Information" left={(props) => <List.Icon {...props} icon="information" />} />
        <Card.Content>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{animal.basicInfo?.category || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Breed</Text>
              <Text style={styles.infoValue}>{animal.basicInfo?.breed || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{animal.basicInfo?.gender || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{calculateAge(animal.basicInfo?.dateOfBirth)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Birth Weight</Text>
              <Text style={styles.infoValue}>{animal.basicInfo?.birthWeight ? `${animal.basicInfo.birthWeight}kg` : 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Birth Type</Text>
              <Text style={styles.infoValue}>{animal.basicInfo?.birthType || 'N/A'}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Current Status */}
      <Card style={styles.infoCard}>
        <Card.Title title="Current Status" left={(props) => <List.Icon {...props} icon="heart-pulse" />} />
        <Card.Content>
          <View style={styles.statusContainer}>
            <Badge
              style={[
                styles.healthBadge,
                { backgroundColor: getHealthStatusColor(animal.currentStatus?.healthStatus) }
              ]}
            >
              {animal.currentStatus?.healthStatus || 'Unknown'}
            </Badge>
            
            {animal.currentStatus?.lastWeightRecord && (
              <View style={styles.weightInfo}>
                <Text style={styles.weightLabel}>Current Weight</Text>
                <Text style={styles.weightValue}>{animal.currentStatus.lastWeightRecord}kg</Text>
              </View>
            )}
          </View>
          
          <View style={styles.statusChips}>
            {animal.currentStatus?.isForSale && (
              <Chip icon="currency-usd" style={styles.statusChip}>For Sale</Chip>
            )}
            {animal.currentStatus?.isAvailableForMating && (
              <Chip icon="heart" style={styles.statusChip}>Available for Breeding</Chip>
            )}
            {animal.currentStatus?.isPregnant && (
              <Chip icon="baby" style={styles.statusChip}>Pregnant</Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Parentage Information */}
      {(animal.parentage?.mother || animal.parentage?.father) && (
        <Card style={styles.infoCard}>
          <Card.Title title="Parentage" left={(props) => <List.Icon {...props} icon="family-tree" />} />
          <Card.Content>
            <View style={styles.parentageContainer}>
              {animal.parentage?.mother && (
                <View style={styles.parentInfo}>
                  <Text style={styles.parentLabel}>Mother</Text>
                  <Text style={styles.parentValue}>{animal.parentage.mother}</Text>
                </View>
              )}
              {animal.parentage?.father && (
                <View style={styles.parentInfo}>
                  <Text style={styles.parentLabel}>Father</Text>
                  <Text style={styles.parentValue}>{animal.parentage.father}</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Identification */}
      <Card style={styles.infoCard}>
        <Card.Title title="Identification" left={(props) => <List.Icon {...props} icon="card-account-details" />} />
        <Card.Content>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Registration Number</Text>
              <Text style={styles.infoValue}>{animal.registrationNumber || 'Not assigned'}</Text>
            </View>
            {animal.identification?.earTagNumber && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ear Tag</Text>
                <Text style={styles.infoValue}>{animal.identification.earTagNumber}</Text>
              </View>
            )}
            {animal.identification?.microchipId && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Microchip ID</Text>
                <Text style={styles.infoValue}>{animal.identification.microchipId}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderHealthTab = () => (
    <View style={styles.tabContent}>
      {/* Health Records */}
      <Card style={styles.infoCard}>
        <Card.Title title="Vaccination Records" left={(props) => <List.Icon {...props} icon="medical-bag" />} />
        <Card.Content>
          {animal.healthRecords?.vaccinations?.length > 0 ? (
            animal.healthRecords.vaccinations.map((vaccination, index) => (
              <View key={index} style={styles.healthRecord}>
                <Text style={styles.healthRecordTitle}>{vaccination.vaccineName}</Text>
                <Text style={styles.healthRecordDate}>
                  {new Date(vaccination.dateAdministered).toLocaleDateString()}
                </Text>
                <Text style={styles.healthRecordDetails}>
                  Dose: {vaccination.dosage} | Route: {vaccination.route}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noRecordsText}>No vaccination records found</Text>
          )}
        </Card.Content>
      </Card>

      {/* Deworming Records */}
      <Card style={styles.infoCard}>
        <Card.Title title="Deworming Records" left={(props) => <List.Icon {...props} icon="pill" />} />
        <Card.Content>
          {animal.healthRecords?.deworming?.length > 0 ? (
            animal.healthRecords.deworming.map((treatment, index) => (
              <View key={index} style={styles.healthRecord}>
                <Text style={styles.healthRecordTitle}>{treatment.medicine}</Text>
                <Text style={styles.healthRecordDate}>
                  {new Date(treatment.dateAdministered).toLocaleDateString()}
                </Text>
                <Text style={styles.healthRecordDetails}>
                  Dose: {treatment.dosage}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noRecordsText}>No deworming records found</Text>
          )}
        </Card.Content>
      </Card>

      {/* Weight Records */}
      <Card style={styles.infoCard}>
        <Card.Title 
          title="Weight Records" 
          left={(props) => <List.Icon {...props} icon="scale" />}
          right={(props) => (
            <Button mode="outlined" onPress={handleAddWeight} style={styles.addButton}>
              Add Weight
            </Button>
          )}
        />
        <Card.Content>
          {animal.growthRecords?.weightRecords?.length > 0 ? (
            animal.growthRecords.weightRecords.slice(0, 5).map((record, index) => (
              <View key={index} style={styles.weightRecord}>
                <Text style={styles.weightRecordValue}>{record.weight}kg</Text>
                <Text style={styles.weightRecordDate}>
                  {new Date(record.date).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noRecordsText}>No weight records found</Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading animal details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!animal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={theme.colors.error} />
          <Text style={styles.errorText}>Animal not found</Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <VoiceGuidance
        text={`Viewing details for ${animal.basicInfo?.name}, a ${animal.basicInfo?.breed} ${animal.basicInfo?.category}.`}
        autoPlay={true}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.animalHeaderInfo}>
            <Avatar.Icon
              size={60}
              icon={getAnimalIcon(animal.basicInfo?.category)}
              style={[styles.animalAvatar, { backgroundColor: theme.colors.primary }]}
            />
            <View style={styles.animalHeaderDetails}>
              <Title style={styles.animalName}>{animal.basicInfo?.name || 'Unnamed'}</Title>
              <Paragraph style={styles.animalSubtitle}>
                {animal.basicInfo?.breed} • {animal.basicInfo?.gender}
              </Paragraph>
              <Text style={styles.animalId}>ID: {animal.registrationNumber || 'Not assigned'}</Text>
            </View>
          </View>
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                icon="dots-vertical"
                style={styles.menuButton}
              >
                Actions
              </Button>
            }
          >
            <Menu.Item onPress={handleEdit} title="Edit Animal" icon="pencil" />
            <Menu.Item onPress={handleShare} title="Share" icon="share" />
            <Divider />
            <Menu.Item onPress={handleDelete} title="Delete" icon="delete" />
          </Menu>
        </View>
      </View>

      {/* Photo Section */}
      {animal.photos && animal.photos.length > 0 && (
        <View style={styles.photoSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {animal.photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo.url }} style={styles.animalPhoto} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Button
          mode={activeTab === 'overview' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('overview')}
          style={styles.tabButton}
        >
          Overview
        </Button>
        <Button
          mode={activeTab === 'health' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('health')}
          style={styles.tabButton}
        >
          Health
        </Button>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' ? renderOverviewTab() : renderHealthTab()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={handleAddSchedule}
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          icon="calendar-plus"
        >
          Add Schedule
        </Button>
        <Button
          mode="outlined"
          onPress={handleEdit}
          style={styles.actionButton}
          icon="pencil"
        >
          Edit Animal
        </Button>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    marginVertical: 16,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  animalHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  animalAvatar: {
    marginRight: 16,
  },
  animalHeaderDetails: {
    flex: 1,
  },
  animalName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.onSurface,
  },
  animalSubtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  animalId: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  menuButton: {
    borderColor: theme.colors.primary,
  },
  photoSection: {
    paddingVertical: 16,
  },
  animalPhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginLeft: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 16,
    paddingRight: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    textTransform: 'capitalize',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthBadge: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 16,
  },
  weightInfo: {
    flex: 1,
  },
  weightLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  weightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  parentageContainer: {
    flexDirection: 'row',
  },
  parentInfo: {
    flex: 1,
    marginRight: 16,
  },
  parentLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  parentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  healthRecord: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  healthRecordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  healthRecordDate: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  healthRecordDetails: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  weightRecord: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  weightRecordValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  weightRecordDate: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  noRecordsText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  addButton: {
    borderColor: theme.colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default AnimalDetailScreen; 