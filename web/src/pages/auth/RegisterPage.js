import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Business,
  LocationOn,
  Phone,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { registerUser, clearError } from '../../store/slices/authSlice';
import AuthLayout from '../../components/layouts/AuthLayout';

const steps = ['Personal Information', 'Farm Details', 'Account Setup'];

const personalSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
});

const farmSchema = yup.object({
  farmName: yup
    .string()
    .min(2, 'Farm name must be at least 2 characters')
    .required('Farm name is required'),
  farmLocation: yup
    .string()
    .min(3, 'Location must be at least 3 characters')
    .required('Farm location is required'),
  farmSize: yup
    .number()
    .positive('Farm size must be positive')
    .required('Farm size is required'),
});

const accountSchema = yup.object({
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
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

const RegisterPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const getCurrentSchema = () => {
    switch (activeStep) {
      case 0: return personalSchema;
      case 1: return farmSchema;
      case 2: return accountSchema;
      default: return personalSchema;
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    resolver: yupResolver(getCurrentSchema()),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      farmName: '',
      farmLocation: '',
      farmSize: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0: return ['name', 'email', 'phone'];
      case 1: return ['farmName', 'farmLocation', 'farmSize'];
      case 2: return ['password', 'confirmPassword', 'termsAccepted'];
      default: return [];
    }
  };

  const onSubmit = async (data) => {
    try {
      const registrationData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        farmName: data.farmName,
        farmLocation: data.farmLocation,
        farmSize: data.farmSize,
      };

      await dispatch(registerUser(registrationData)).unwrap();
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const renderPersonalInfo = () => (
    <Box>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Full Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}
      />

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
            sx={{ mb: 2 }}
          />
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Phone Number"
            error={!!errors.phone}
            helperText={errors.phone?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}
      />
    </Box>
  );

  const renderFarmDetails = () => (
    <Box>
      <Controller
        name="farmName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Farm Name"
            error={!!errors.farmName}
            helperText={errors.farmName?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Business color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}
      />

      <Controller
        name="farmLocation"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Farm Location"
            error={!!errors.farmLocation}
            helperText={errors.farmLocation?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}
      />

      <Controller
        name="farmSize"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Farm Size (acres)"
            type="number"
            error={!!errors.farmSize}
            helperText={errors.farmSize?.message}
            sx={{ mb: 2 }}
          />
        )}
      />
    </Box>
  );

  const renderAccountSetup = () => (
    <Box>
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Password"
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
            sx={{ mb: 2 }}
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Confirm Password"
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
            sx={{ mb: 2 }}
          />
        )}
      />

      <Controller
        name="termsAccepted"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={field.value}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="/terms" target="_blank" sx={{ color: 'primary.main' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" sx={{ color: 'primary.main' }}>
                  Privacy Policy
                </Link>
              </Typography>
            }
            sx={{ mb: 2 }}
          />
        )}
      />
      {errors.termsAccepted && (
        <Typography color="error" variant="body2" sx={{ mt: -1, mb: 2 }}>
          {errors.termsAccepted.message}
        </Typography>
      )}
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0: return renderPersonalInfo();
      case 1: return renderFarmDetails();
      case 2: return renderAccountSetup();
      default: return 'Unknown step';
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Start managing your farm today">
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={<PersonAdd />}
                sx={{ py: 1, px: 3 }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ py: 1, px: 3 }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
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

export default RegisterPage; 