import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
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
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { register, clearError } from '../../store/slices/authSlice';
import { theme } from '../../theme';
import VoiceGuidance from '../../components/VoiceGuidance';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    farmName: '',
    farmLocation: '',
    animalTypes: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.farmName.trim()) {
      newErrors.farmName = 'Farm name is required';
    }

    if (!formData.farmLocation.trim()) {
      newErrors.farmLocation = 'Farm location is required';
    }

    if (!formData.animalTypes.trim()) {
      newErrors.animalTypes = 'Please specify the animals you raise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    try {
      await dispatch(register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        farmName: formData.farmName.trim(),
        farmLocation: formData.farmLocation.trim(),
        animalTypes: formData.animalTypes.trim(),
      })).unwrap();
      
      Alert.alert(
        'Registration Successful!',
        'Welcome to Farm Manager. You can now start managing your farm.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      // Error handling is done in useEffect
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStep1 = () => (
    <>
      <VoiceGuidance
        text="Step 1 of 2: Please enter your personal information to create your account."
        autoPlay={step === 1}
      />

      <Title style={styles.stepTitle}>Personal Information</Title>
      <Paragraph style={styles.stepSubtitle}>
        Let's start with your basic details
      </Paragraph>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Full Name"
          value={formData.name}
          onChangeText={(text) => updateFormData('name', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="account" />}
          error={!!errors.name}
          disabled={loading}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Email Address"
          value={formData.email}
          onChangeText={(text) => updateFormData('email', text)}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          left={<TextInput.Icon icon="email" />}
          error={!!errors.email}
          disabled={loading}
        />
        <HelperText type="error" visible={!!errors.email}>
          {errors.email}
        </HelperText>
      </View>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Phone Number"
          value={formData.phone}
          onChangeText={(text) => updateFormData('phone', text)}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
          left={<TextInput.Icon icon="phone" />}
          error={!!errors.phone}
          disabled={loading}
        />
        <HelperText type="error" visible={!!errors.phone}>
          {errors.phone}
        </HelperText>
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Password"
          value={formData.password}
          onChangeText={(text) => updateFormData('password', text)}
          mode="outlined"
          secureTextEntry={!showPassword}
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          error={!!errors.password}
          disabled={loading}
        />
        <HelperText type="error" visible={!!errors.password}>
          {errors.password}
        </HelperText>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(text) => updateFormData('confirmPassword', text)}
          mode="outlined"
          secureTextEntry={!showConfirmPassword}
          style={styles.input}
          left={<TextInput.Icon icon="lock-check" />}
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
          error={!!errors.confirmPassword}
          disabled={loading}
        />
        <HelperText type="error" visible={!!errors.confirmPassword}>
          {errors.confirmPassword}
        </HelperText>
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
        text="Step 2 of 2: Please provide your farm information to complete registration."
        autoPlay={step === 2}
      />

      <Title style={styles.stepTitle}>Farm Information</Title>
      <Paragraph style={styles.stepSubtitle}>
        Tell us about your farm
      </Paragraph>

      {/* Farm Name Input */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Farm Name"
          value={formData.farmName}
          onChangeText={(text) => updateFormData('farmName', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="barn" />}
          error={!!errors.farmName}
          disabled={loading}
        />
        <HelperText type="error" visible={!!errors.farmName}>
          {errors.farmName}
        </HelperText>
      </View>

      {/* Farm Location Input */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Farm Location (City, State/Country)"
          value={formData.farmLocation}
          onChangeText={(text) => updateFormData('farmLocation', text)}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="map-marker" />}
          error={!!errors.farmLocation}
          disabled={loading}
        />
        <HelperText type="error" visible={!!errors.farmLocation}>
          {errors.farmLocation}
        </HelperText>
      </View>

      {/* Animal Types Input */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Animals You Raise (e.g., Cattle, Goats, Sheep)"
          value={formData.animalTypes}
          onChangeText={(text) => updateFormData('animalTypes', text)}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          left={<TextInput.Icon icon="cow" />}
          error={!!errors.animalTypes}
          disabled={loading}
        />
        <HelperText type="error" visible={!!errors.animalTypes}>
          {errors.animalTypes}
        </HelperText>
      </View>

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
          onPress={handleRegister}
          style={[styles.registerButton, { flex: 2, marginLeft: 8 }]}
          contentStyle={styles.buttonContent}
          disabled={loading}
          loading={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={40} color={theme.colors.primary} />
              <Title style={styles.appTitle}>Farm Manager</Title>
            </View>
            
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

          {/* Registration Form */}
          <Card style={styles.registerCard}>
            <Card.Content>
              {step === 1 ? renderStep1() : renderStep2()}
            </Card.Content>
          </Card>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              Sign In
            </Button>
          </View>

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Creating your account...</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 10,
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
  registerCard: {
    marginBottom: 20,
    elevation: 4,
    borderRadius: 16,
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
  registerButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
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

export default RegisterScreen; 