import React, { useState } from 'react';
import {
  View,
  StyleSheet,
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
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import VoiceGuidance from '../../components/VoiceGuidance';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setLoading(true);

    try {
      // API call to request password reset
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        Alert.alert(
          'Reset Link Sent',
          'If an account with that email exists, a password reset link has been sent.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to send reset link');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <VoiceGuidance
            text="Password reset link has been sent to your email address."
            autoPlay={true}
          />

          <View style={styles.successContainer}>
            <Ionicons 
              name="mail-outline" 
              size={80} 
              color={theme.colors.primary} 
              style={styles.successIcon}
            />
            
            <Title style={styles.successTitle}>Check Your Email</Title>
            
            <Paragraph style={styles.successMessage}>
              If an account with that email exists, we've sent you a password reset link.
            </Paragraph>
            
            <Paragraph style={styles.instructionText}>
              Please check your email and follow the instructions to reset your password.
            </Paragraph>

            <Button
              mode="contained"
              onPress={handleBackToLogin}
              style={styles.backButton}
              contentStyle={styles.buttonContent}
            >
              Back to Sign In
            </Button>

            <Button
              mode="text"
              onPress={() => setIsSubmitted(false)}
              style={styles.resendButton}
            >
              Resend Email
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <VoiceGuidance
          text="Enter your email address to receive a password reset link."
          autoPlay={true}
        />

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="lock-open" size={60} color={theme.colors.primary} />
          <Title style={styles.title}>Forgot Password?</Title>
          <Paragraph style={styles.subtitle}>
            No worries! Enter your email address and we'll send you a reset link.
          </Paragraph>
        </View>

        {/* Reset Form */}
        <Card style={styles.resetCard}>
          <Card.Content>
            <View style={styles.inputContainer}>
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
                error={!!emailError}
                disabled={loading}
              />
              <HelperText type="error" visible={!!emailError}>
                {emailError}
              </HelperText>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </Button>
          </Card.Content>
        </Card>

        {/* Back to Login */}
        <View style={styles.backSection}>
          <Button
            mode="outlined"
            onPress={handleBackToLogin}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
            disabled={loading}
            icon="arrow-left"
          >
            Back to Sign In
          </Button>
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Sending reset link...</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    color: theme.colors.onSurface,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 24,
  },
  resetCard: {
    marginBottom: 24,
    elevation: 4,
    borderRadius: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: theme.colors.surface,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  backSection: {
    alignItems: 'center',
  },
  loginButton: {
    borderRadius: 8,
    borderColor: theme.colors.primary,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: theme.colors.onSurface,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 24,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  backButton: {
    marginBottom: 16,
    borderRadius: 8,
    width: '100%',
  },
  resendButton: {
    marginTop: 8,
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

export default ForgotPasswordScreen; 