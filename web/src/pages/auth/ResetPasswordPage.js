import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, Check } from '@mui/icons-material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { resetPassword, clearError, clearResetStatus } from '../../store/slices/authSlice';
import AuthLayout from '../../components/layouts/AuthLayout';

const schema = yup.object({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, passwordResetSuccess } = useSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearResetStatus());
  }, [dispatch]);

  useEffect(() => {
    if (passwordResetSuccess) {
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  }, [passwordResetSuccess, navigate]);

  const onSubmit = async (data) => {
    try {
      await dispatch(resetPassword({ 
        resetToken: token, 
        newPassword: data.password 
      })).unwrap();
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: 'grey.400' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: '', color: 'grey.400' },
      { strength: 1, label: 'Very Weak', color: 'error.main' },
      { strength: 2, label: 'Weak', color: 'warning.main' },
      { strength: 3, label: 'Fair', color: 'info.main' },
      { strength: 4, label: 'Good', color: 'success.light' },
      { strength: 5, label: 'Strong', color: 'success.main' },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(password);

  if (passwordResetSuccess) {
    return (
      <AuthLayout>
        <Box sx={{ textAlign: 'center' }}>
          <Check sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Password Reset Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your password has been successfully reset. You will be redirected to the login page in a moment.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ py: 1.5, px: 4 }}
          >
            Continue to Login
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Create a new secure password"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Box sx={{ mb: 2 }}>
              <TextField
                {...field}
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {password && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      height: 4,
                      flex: 1,
                      backgroundColor: 'grey.200',
                      borderRadius: 2,
                      mr: 2,
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                        backgroundColor: passwordStrength.color,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: passwordStrength.color, minWidth: 60 }}
                  >
                    {passwordStrength.label}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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
          sx={{ 
            mb: 3, 
            py: 1.5,
            fontWeight: 600,
            fontSize: '1.1rem',
          }}
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
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
      </Box>
    </AuthLayout>
  );
};

export default ResetPasswordPage; 