import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  Paper,
} from '@mui/material';
import { Email, Send, CheckCircle } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { forgotPassword, clearError, clearResetStatus } from '../../store/slices/authSlice';
import AuthLayout from '../../components/layouts/AuthLayout';

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { isLoading, error, resetEmailSent } = useSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearResetStatus());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      await dispatch(forgotPassword(data.email)).unwrap();
    } catch (error) {
      // Error is handled by Redux
    }
  };

  if (resetEmailSent) {
    return (
      <AuthLayout>
        <Box sx={{ textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Check Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We've sent a password reset link to your email address. 
            Please check your inbox and follow the instructions to reset your password.
          </Typography>
          
          <Paper sx={{ p: 2, mb: 3, backgroundColor: 'info.light' }}>
            <Typography variant="body2" color="info.dark">
              <strong>Didn't receive the email?</strong><br />
              Check your spam folder or try again in a few minutes.
            </Typography>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => dispatch(clearResetStatus())}
              sx={{ py: 1.5 }}
            >
              Try Different Email
            </Button>
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Back to Sign In
            </Link>
          </Box>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Forgot Password?" 
      subtitle="Enter your email to receive a reset link"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Don't worry! Enter your email address below and we'll send you a link to reset your password.
        </Typography>

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Email Address"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
          )}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          startIcon={<Send />}
          sx={{ 
            mb: 3, 
            py: 1.5,
            fontWeight: 600,
            fontSize: '1.1rem',
          }}
        >
          {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Remember your password?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{ 
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>

        <Paper sx={{ mt: 3, p: 2, backgroundColor: 'warning.light' }}>
          <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 500 }}>
            <strong>Security Note:</strong><br />
            The reset link will expire in 1 hour for your security. 
            If you don't receive the email, please check your spam folder.
          </Typography>
        </Paper>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPasswordPage; 