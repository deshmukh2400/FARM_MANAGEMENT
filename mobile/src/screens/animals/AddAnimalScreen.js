import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  HelperText,
  ActivityIndicator,
  ProgressBar,
  Menu,
  Divider,
  Chip,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { theme } from '../../theme';
import VoiceGuidance from '../../components/VoiceGuidance';

const AddAnimalScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    category: '',
    breed: '',
    gender: '',
    dateOfBirth: new Date(),
    birthWeight: '',
    birthType: 'single',
    
    // Identification
    registrationNumber: '',
    earTagNumber: '',
    microchipId: '',
    
    // Parentage
    motherName: '',
    fatherName: '',
    
    // Photos
    photos: [],
    
    // Health Status
    healthStatus: 'healthy',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [birthTypeMenuVisible, setBirthTypeMenuVisible] = useState(false);
  const [healthMenuVisible, setHealthMenuVisible] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const categories = [
    { label: 'Cattle', value: 'cattle' },
    { label: 'Goat', value: 'goat' },
    { label: 'Sheep', value: 'sheep' },
    { label: 'Horse', value: 'horse' },
    { label: 'Pig', value: 'pig' },
    { label: 'Chicken', value: 'chicken' },
    { label: 'Other', value: 'other' },
  ];

  const genders = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];

  const birthTypes = [
    { label: 'Single', value: 'single' },
    { label: 'Twin', value: 'twin' },
    { label: 'Triplet', value: 'triplet' },
    { label: 'Multiple', value: 'multiple' },
  ];

  const healthStatuses = [
    { label: 'Healthy', value: 'healthy' },
    { label: 'Sick', value: 'sick' },
    { label: 'Injured', value: 'injured' },
    { label: 'Pregnant', value: 'pregnant' },
    { label: 'Lactating', value: 'lactating' },
  ];

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Animal name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }

    if (formData.birthWeight && (isNaN(formData.birthWeight) || parseFloat(formData.birthWeight) <= 0)) {
      newErrors.birthWeight = 'Please enter a valid birth weight';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    // Step 2 validation is optional for most fields
    setErrors(newErrors);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Basic information
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('breed', formData.breed.trim());
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth.toISOString());
      formDataToSend.append('birthType', formData.birthType);
      
      if (formData.birthWeight) {
        formDataToSend.append('birthWeight', formData.birthWeight);
      }
      
      // Identification
      if (formData.registrationNumber) {
        formDataToSend.append('registrationNumber', formData.registrationNumber.trim());
      }
      if (formData.earTagNumber) {
        formDataToSend.append('earTagNumber', formData.earTagNumber.trim());
      }
      if (formData.microchipId) {
        formDataToSend.append('microchipId', formData.microchipId.trim());
      }
      
      // Parentage
      if (formData.motherName) {
        formDataToSend.append('motherName', formData.motherName.trim());
      }
      if (formData.fatherName) {
        formDataToSend.append('fatherName', formData.fatherName.trim());
      }
      
      // Health status
      formDataToSend.append('healthStatus', formData.healthStatus);
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes.trim());
      }
      
      // Photos
      formData.photos.forEach((photo, index) => {
        formDataToSend.append('photos', {
          uri: photo.uri,
          type: photo.type,
          name: `animal_photo_${index}.jpg`,
        });
      });

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/animals`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        Alert.alert(
          'Success!',
          `${formData.name} has been successfully registered to your farm.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to register animal');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateFormData('dateOfBirth', selectedDate);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto = {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
      };
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, newPhoto],
      }));
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const renderStep1 = () => (
    <>
      <VoiceGuidance
        text="Step 1 of 2: Please enter the basic information about your animal."
        autoPlay={step === 1}
      />

      <Title style={styles.stepTitle}>Basic Information</Title>
      <Paragraph style={styles.stepSubtitle}>
        Tell us about your animal's basic details
      </Paragraph>

      {/* Animal Name */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Animal Name *"
          value={formData.name}
          onChangeText={(text) => updateFormData('name', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="tag" />}
          error={!!errors.name}
          disabled={loading}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>
      </View>

      {/* Category Selection */}
      <View style={styles.inputContainer}>
        <Menu
          visible={categoryMenuVisible}
          onDismiss={() => setCategoryMenuVisible(false)}
          anchor={
            <TextInput
              label="Category *"
              value={formData.category}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="paw" />}
              right={<TextInput.Icon icon="menu-down" />}
              onPressIn={() => setCategoryMenuVisible(true)}
              error={!!errors.category}
              disabled={loading}
              editable={false}
            />
          }
        >
          {categories.map((category) => (
            <Menu.Item
              key={category.value}
              onPress={() => {
                updateFormData('category', category.value);
                setCategoryMenuVisible(false);
              }}
              title={category.label}
            />
          ))}
        </Menu>
        <HelperText type="error" visible={!!errors.category}>
          {errors.category}
        </HelperText>
      </View>

      {/* Breed */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Breed *"
          value={formData.breed}
          onChangeText={(text) => updateFormData('breed', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="dna" />}
          error={!!errors.breed}
          disabled={loading}
        />
        <HelperText type="error" visible={!!errors.breed}>
          {errors.breed}
        </HelperText>
      </View>

      {/* Gender Selection */}
      <View style={styles.inputContainer}>
        <Menu
          visible={genderMenuVisible}
          onDismiss={() => setGenderMenuVisible(false)}
          anchor={
            <TextInput
              label="Gender *"
              value={formData.gender}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="gender-male-female" />}
              right={<TextInput.Icon icon="menu-down" />}
              onPressIn={() => setGenderMenuVisible(true)}
              error={!!errors.gender}
              disabled={loading}
              editable={false}
            />
          }
        >
          {genders.map((gender) => (
            <Menu.Item
              key={gender.value}
              onPress={() => {
                updateFormData('gender', gender.value);
                setGenderMenuVisible(false);
              }}
              title={gender.label}
            />
          ))}
        </Menu>
        <HelperText type="error" visible={!!errors.gender}>
          {errors.gender}
        </HelperText>
      </View>

      {/* Date of Birth */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Date of Birth"
          value={formData.dateOfBirth.toDateString()}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="calendar" />}
          right={<TextInput.Icon icon="calendar-edit" />}
          onPressIn={() => setShowDatePicker(true)}
          disabled={loading}
          editable={false}
        />
        {showDatePicker && (
          <DateTimePicker
            value={formData.dateOfBirth}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      {/* Birth Weight */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Birth Weight (kg)"
          value={formData.birthWeight}
          onChangeText={(text) => updateFormData('birthWeight', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="scale" />}
          keyboardType="numeric"
          error={!!errors.birthWeight}
          disabled={loading}
        />
        <HelperText type="error" visible={!!errors.birthWeight}>
          {errors.birthWeight}
        </HelperText>
      </View>

      {/* Birth Type */}
      <View style={styles.inputContainer}>
        <Menu
          visible={birthTypeMenuVisible}
          onDismiss={() => setBirthTypeMenuVisible(false)}
          anchor={
            <TextInput
              label="Birth Type"
              value={formData.birthType}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="baby" />}
              right={<TextInput.Icon icon="menu-down" />}
              onPressIn={() => setBirthTypeMenuVisible(true)}
              disabled={loading}
              editable={false}
            />
          }
        >
          {birthTypes.map((type) => (
            <Menu.Item
              key={type.value}
              onPress={() => {
                updateFormData('birthType', type.value);
                setBirthTypeMenuVisible(false);
              }}
              title={type.label}
            />
          ))}
        </Menu>
      </View>

      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.nextButton}
        contentStyle={styles.buttonContent}
        disabled={loading}
      >
        Next Step
      </Button>
    </>
  );

  const renderStep2 = () => (
    <>
      <VoiceGuidance
        text="Step 2 of 2: Add identification details, parentage information, and photos."
        autoPlay={step === 2}
      />

      <Title style={styles.stepTitle}>Additional Information</Title>
      <Paragraph style={styles.stepSubtitle}>
        Add identification, parentage, and photos (optional)
      </Paragraph>

      {/* Registration Number */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Registration Number"
          value={formData.registrationNumber}
          onChangeText={(text) => updateFormData('registrationNumber', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="card-account-details" />}
          disabled={loading}
        />
      </View>

      {/* Ear Tag Number */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Ear Tag Number"
          value={formData.earTagNumber}
          onChangeText={(text) => updateFormData('earTagNumber', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="tag-outline" />}
          disabled={loading}
        />
      </View>

      {/* Microchip ID */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Microchip ID"
          value={formData.microchipId}
          onChangeText={(text) => updateFormData('microchipId', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="chip" />}
          disabled={loading}
        />
      </View>

      {/* Mother Name */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Mother's Name"
          value={formData.motherName}
          onChangeText={(text) => updateFormData('motherName', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="human-female" />}
          disabled={loading}
        />
      </View>

      {/* Father Name */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Father's Name"
          value={formData.fatherName}
          onChangeText={(text) => updateFormData('fatherName', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="human-male" />}
          disabled={loading}
        />
      </View>

      {/* Health Status */}
      <View style={styles.inputContainer}>
        <Menu
          visible={healthMenuVisible}
          onDismiss={() => setHealthMenuVisible(false)}
          anchor={
            <TextInput
              label="Health Status"
              value={formData.healthStatus}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="heart-pulse" />}
              right={<TextInput.Icon icon="menu-down" />}
              onPressIn={() => setHealthMenuVisible(true)}
              disabled={loading}
              editable={false}
            />
          }
        >
          {healthStatuses.map((status) => (
            <Menu.Item
              key={status.value}
              onPress={() => {
                updateFormData('healthStatus', status.value);
                setHealthMenuVisible(false);
              }}
              title={status.label}
            />
          ))}
        </Menu>
      </View>

      {/* Notes */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Notes"
          value={formData.notes}
          onChangeText={(text) => updateFormData('notes', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="note-text" />}
          multiline
          numberOfLines={3}
          disabled={loading}
        />
      </View>

      {/* Photos Section */}
      <Card style={styles.photoCard}>
        <Card.Title title="Photos" left={(props) => <List.Icon {...props} icon="camera" />} />
        <Card.Content>
          <View style={styles.photoContainer}>
            {formData.photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
              <Ionicons name="add" size={32} color={theme.colors.primary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          onPress={handleBack}
          style={[styles.backButton, { flex: 1, marginRight: 8 }]}
          contentStyle={styles.buttonContent}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.submitButton, { flex: 2, marginLeft: 8 }]}
          contentStyle={styles.buttonContent}
          disabled={loading}
          loading={loading}
        >
          {loading ? 'Registering...' : 'Register Animal'}
        </Button>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Register New Animal</Title>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={step / 2}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>Step {step} of 2</Text>
          </View>
        </View>

        {/* Form Content */}
        <Card style={styles.formCard}>
          <Card.Content>
            {step === 1 ? renderStep1() : renderStep2()}
          </Card.Content>
        </Card>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Registering your animal...</Text>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  formCard: {
    borderRadius: 16,
    elevation: 4,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: theme.colors.onSurface,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.onSurfaceVariant,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: theme.colors.surface,
    fontSize: 16,
  },
  nextButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  backButton: {
    borderRadius: 8,
    borderColor: theme.colors.primary,
  },
  submitButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  photoCard: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  photoItem: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
  },
  addPhotoText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 4,
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

export default AddAnimalScreen; 