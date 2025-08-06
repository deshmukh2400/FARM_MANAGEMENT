import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

// Simplified Animal Registration Form
export const SimplifiedAnimalForm = ({ onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    gender: '',
    birthDate: '',
    breed: '',
    photo: null
  });

  const progressAnimation = useRef(new Animated.Value(0)).current;

  const steps = [
    {
      number: 1,
      title: 'Animal Type',
      subtitle: 'What animal do you want to add?',
      emoji: '🐄',
      fields: ['type']
    },
    {
      number: 2,
      title: 'Basic Info',
      subtitle: 'Tell us about your animal',
      emoji: '📝',
      fields: ['name', 'gender', 'breed']
    },
    {
      number: 3,
      title: 'Photo',
      subtitle: 'Take a picture of your animal',
      emoji: '📸',
      fields: ['photo']
    }
  ];

  const animalTypes = [
    { value: 'cattle', label: '🐄 Cow/Bull', image: '🐄' },
    { value: 'goat', label: '🐐 Goat', image: '🐐' },
    { value: 'sheep', label: '🐑 Sheep', image: '🐑' },
    { value: 'buffalo', label: '🐃 Buffalo', image: '🐃' }
  ];

  const genderOptions = [
    { value: 'male', label: '♂️ Male', color: '#4A90E2' },
    { value: 'female', label: '♀️ Female', color: '#F5A623' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      Animated.timing(progressAnimation, {
        toValue: currentStep / steps.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      Animated.timing(progressAnimation, {
        toValue: (currentStep - 2) / steps.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      if (currentStep === steps.length) {
        onSubmit(formData);
      } else {
        nextStep();
      }
    }
  };

  const validateCurrentStep = () => {
    const currentStepData = steps[currentStep - 1];
    const requiredFields = currentStepData.fields;
    
    for (let field of requiredFields) {
      if (!formData[field] || formData[field] === '') {
        Alert.alert(
          'Missing Information',
          `Please fill in all the required information for this step.`,
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>
              {steps[0].emoji} {steps[0].title}
            </Text>
            <Text style={styles.stepSubtitle}>{steps[0].subtitle}</Text>
            
            <View style={styles.animalTypeGrid}>
              {animalTypes.map((animal) => (
                <TouchableOpacity
                  key={animal.value}
                  style={[
                    styles.animalTypeButton,
                    formData.type === animal.value && styles.selectedAnimalType
                  ]}
                  onPress={() => updateFormData('type', animal.value)}
                >
                  <Text style={styles.animalTypeEmoji}>{animal.image}</Text>
                  <Text style={styles.animalTypeLabel}>{animal.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>
              {steps[1].emoji} {steps[1].title}
            </Text>
            <Text style={styles.stepSubtitle}>{steps[1].subtitle}</Text>
            
            {/* Animal Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                📝 Animal Name *
              </Text>
              <Text style={styles.inputHint}>
                Give your animal a name (e.g., Bella, Rocky)
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                placeholder="Enter animal name..."
                placeholderTextColor="#A0AEC0"
              />
            </View>

            {/* Gender Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                ⚥ Gender *
              </Text>
              <Text style={styles.inputHint}>
                Is your animal male or female?
              </Text>
              <View style={styles.genderRow}>
                {genderOptions.map((gender) => (
                  <TouchableOpacity
                    key={gender.value}
                    style={[
                      styles.genderButton,
                      formData.gender === gender.value && {
                        backgroundColor: gender.color + '20',
                        borderColor: gender.color
                      }
                    ]}
                    onPress={() => updateFormData('gender', gender.value)}
                  >
                    <Text style={styles.genderLabel}>{gender.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Breed */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                🧬 Breed
              </Text>
              <Text style={styles.inputHint}>
                What breed is your animal? (Optional)
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.breed}
                onChangeText={(text) => updateFormData('breed', text)}
                placeholder="Enter breed (e.g., Holstein, Jersey)..."
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>
              {steps[2].emoji} {steps[2].title}
            </Text>
            <Text style={styles.stepSubtitle}>{steps[2].subtitle}</Text>
            
            <View style={styles.photoSection}>
              {formData.photo ? (
                <View style={styles.photoPreview}>
                  <Image source={{ uri: formData.photo }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.retakeButton}
                    onPress={() => takePhoto()}
                  >
                    <Icon name="camera-alt" size={20} color="#4A90E2" />
                    <Text style={styles.retakeText}>Take New Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.photoButton}
                  onPress={() => takePhoto()}
                >
                  <Icon name="camera-alt" size={48} color="#4A90E2" />
                  <Text style={styles.photoButtonText}>
                    📸 Take Photo
                  </Text>
                  <Text style={styles.photoHint}>
                    Take a clear picture of your animal
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => updateFormData('photo', 'skipped')}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  const takePhoto = () => {
    // Implement camera functionality
    Alert.alert('Camera', 'Camera functionality would be implemented here');
    updateFormData('photo', 'dummy_photo_url');
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep} of {steps.length}
        </Text>
      </View>

      {/* Step Indicators */}
      <View style={styles.stepIndicators}>
        {steps.map((step, index) => (
          <View
            key={step.number}
            style={[
              styles.stepIndicator,
              currentStep >= step.number && styles.activeStepIndicator,
              currentStep === step.number && styles.currentStepIndicator
            ]}
          >
            <Text style={[
              styles.stepNumber,
              currentStep >= step.number && styles.activeStepNumber
            ]}>
              {currentStep > step.number ? '✓' : step.number}
            </Text>
          </View>
        ))}
      </View>

      {/* Form Content */}
      <ScrollView style={styles.formContainer}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={prevStep}
          >
            <Icon name="arrow-back" size={20} color="#4A90E2" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, { flex: currentStep === 1 ? 1 : 0.7 }]}
          onPress={handleSubmit}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length ? '✅ Add Animal' : 'Next'}
          </Text>
          {currentStep < steps.length && (
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Cancel Button */}
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={onCancel}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

// Simplified Expense Form
export const SimplifiedExpenseForm = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const expenseCategories = [
    { value: 'feed', label: '🌾 Feed & Food', color: '#8B572A' },
    { value: 'veterinary', label: '💊 Medicine & Vet', color: '#F5A623' },
    { value: 'equipment', label: '🛠️ Equipment', color: '#7ED321' },
    { value: 'labor', label: '👷 Workers', color: '#4A90E2' },
    { value: 'utilities', label: '⚡ Electricity & Water', color: '#50E3C2' },
    { value: 'other', label: '📦 Other', color: '#BD10E0' }
  ];

  const handleSubmit = () => {
    if (!amount || !category) {
      Alert.alert(
        'Missing Information',
        'Please fill in the amount and select a category.',
        [{ text: 'OK' }]
      );
      return;
    }

    onSubmit({
      amount: parseFloat(amount),
      category,
      description: description || 'No description provided'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.formTitle}>💰 Add Expense</Text>
      <Text style={styles.formSubtitle}>Record money you spent on your farm</Text>

      <ScrollView style={styles.formContainer}>
        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>💵 How much did you spend? *</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor="#A0AEC0"
            />
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>📂 What did you buy? *</Text>
          <View style={styles.categoryGrid}>
            {expenseCategories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryButton,
                  category === cat.value && {
                    backgroundColor: cat.color + '20',
                    borderColor: cat.color
                  }
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>📝 Details (Optional)</Text>
          <Text style={styles.inputHint}>
            Add more details about this expense
          </Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., Bought 50kg rice bran for cows..."
            placeholderTextColor="#A0AEC0"
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>💾 Save Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Progress Bar Styles
  progressContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },

  // Step Indicators
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  activeStepIndicator: {
    backgroundColor: '#4A90E2',
  },
  currentStepIndicator: {
    backgroundColor: '#4A90E2',
    transform: [{ scale: 1.2 }],
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  activeStepNumber: {
    color: '#FFFFFF',
  },

  // Form Content
  formContainer: {
    flex: 1,
    padding: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Animal Type Selection
  animalTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  animalTypeButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
  },
  selectedAnimalType: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF8FF',
  },
  animalTypeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  animalTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
  },

  // Input Groups
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    minHeight: 50,
  },

  // Gender Selection
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },

  // Photo Section
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoButton: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    marginTop: 8,
  },
  photoHint: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  photoPreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retakeText: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 4,
  },
  skipButton: {
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#718096',
    textDecorationLine: 'underline',
  },

  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    flex: 0.3,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    marginLeft: 4,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },

  // Form Styles
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginTop: 16,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Amount Input
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A90E2',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    paddingVertical: 16,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 0.3,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '600',
  },
  submitButton: {
    flex: 0.7,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default {
  SimplifiedAnimalForm,
  SimplifiedExpenseForm,
}; 