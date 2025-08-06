import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Alert,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  PhotoCamera,
  Add,
  Delete,
  Save,
  Male,
  Female,
  Pets,
  Info,
  HealthAndSafety,
  Timeline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createAnimal } from '../../store/slices/animalsSlice';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const steps = ['Basic Information', 'Physical Details', 'Health & Records'];

const basicInfoSchema = yup.object({
  name: yup.string().required('Animal name is required'),
  category: yup.string().required('Category is required'),
  breed: yup.string().required('Breed is required'),
  gender: yup.string().required('Gender is required'),
  dateOfBirth: yup.date().required('Date of birth is required'),
  registrationNumber: yup.string(),
});

const physicalDetailsSchema = yup.object({
  birthWeight: yup.number().positive('Birth weight must be positive'),
  currentWeight: yup.number().positive('Current weight must be positive'),
  birthType: yup.string(),
  colorMarkings: yup.string(),
});

const healthSchema = yup.object({
  currentStatus: yup.string(),
  lastCheckup: yup.date(),
  veterinarian: yup.string(),
  allergies: yup.string(),
  medications: yup.string(),
});

const AddAnimalPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.animals);

  const getCurrentSchema = () => {
    switch (activeStep) {
      case 0: return basicInfoSchema;
      case 1: return physicalDetailsSchema;
      case 2: return healthSchema;
      default: return basicInfoSchema;
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    watch,
  } = useForm({
    resolver: yupResolver(getCurrentSchema()),
    mode: 'onChange',
    defaultValues: {
      name: '',
      category: '',
      breed: '',
      gender: '',
      dateOfBirth: null,
      registrationNumber: '',
      birthWeight: '',
      currentWeight: '',
      birthType: 'single',
      colorMarkings: '',
      motherId: '',
      fatherId: '',
      currentStatus: 'good',
      lastCheckup: null,
      veterinarian: '',
      allergies: '',
      medications: '',
    },
  });

  const watchedCategory = watch('category');

  const breedOptions = {
    cattle: ['Holstein', 'Angus', 'Hereford', 'Brahman', 'Jersey', 'Simmental'],
    goat: ['Boer', 'Nubian', 'Alpine', 'Saanen', 'LaMancha', 'Kiko'],
    sheep: ['Dorper', 'Merino', 'Suffolk', 'Romney', 'Corriedale', 'Border Leicester'],
    horse: ['Arabian', 'Thoroughbred', 'Quarter Horse', 'Clydesdale', 'Mustang'],
    pig: ['Yorkshire', 'Duroc', 'Hampshire', 'Landrace', 'Berkshire'],
    chicken: ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Sussex', 'Orpington'],
  };

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
      case 0: return ['name', 'category', 'breed', 'gender', 'dateOfBirth'];
      case 1: return ['birthWeight', 'currentWeight', 'birthType'];
      case 2: return ['currentStatus'];
      default: return [];
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrls(prev => [...prev, e.target.result]);
          setPhotos(prev => [...prev, file]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      const animalData = {
        basicInfo: {
          name: data.name,
          category: data.category,
          breed: data.breed,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          registrationNumber: data.registrationNumber,
          birthWeight: data.birthWeight,
          birthType: data.birthType,
          colorMarkings: data.colorMarkings,
        },
        parentage: {
          motherId: data.motherId,
          fatherId: data.fatherId,
        },
        growth: {
          currentWeight: data.currentWeight,
          weightHistory: data.currentWeight ? [{
            weight: data.currentWeight,
            date: new Date().toISOString(),
            recordedBy: 'user',
          }] : [],
        },
        health: {
          currentStatus: data.currentStatus,
          lastCheckup: data.lastCheckup,
          veterinarian: data.veterinarian,
          allergies: data.allergies,
          medications: data.medications,
          records: [],
        },
        photos: [], // Photos would be uploaded separately
      };

      await dispatch(createAnimal(animalData)).unwrap();
      navigate('/animals');
    } catch (error) {
      console.error('Failed to create animal:', error);
    }
  };

  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Animal Name *"
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Pets />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="registrationNumber"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Registration Number"
              error={!!errors.registrationNumber}
              helperText={errors.registrationNumber?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category *</InputLabel>
              <Select {...field} label="Category *">
                <MenuItem value="cattle">Cattle</MenuItem>
                <MenuItem value="goat">Goat</MenuItem>
                <MenuItem value="sheep">Sheep</MenuItem>
                <MenuItem value="horse">Horse</MenuItem>
                <MenuItem value="pig">Pig</MenuItem>
                <MenuItem value="chicken">Chicken</MenuItem>
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.category.message}
                </Typography>
              )}
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="breed"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.breed}>
              <InputLabel>Breed *</InputLabel>
              <Select {...field} label="Breed *" disabled={!watchedCategory}>
                {watchedCategory && breedOptions[watchedCategory]?.map((breed) => (
                  <MenuItem key={breed} value={breed}>
                    {breed}
                  </MenuItem>
                ))}
              </Select>
              {errors.breed && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.breed.message}
                </Typography>
              )}
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.gender}>
              <FormLabel component="legend">Gender *</FormLabel>
              <RadioGroup {...field} row>
                <FormControlLabel 
                  value="male" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Male sx={{ mr: 1 }} />
                      Male
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="female" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Female sx={{ mr: 1 }} />
                      Female
                    </Box>
                  } 
                />
              </RadioGroup>
              {errors.gender && (
                <Typography variant="caption" color="error">
                  {errors.gender.message}
                </Typography>
              )}
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Date of Birth *"
                maxDate={new Date()}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth?.message}
                  />
                )}
              />
            )}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Parentage Information
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="motherId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Mother (Dam) ID"
              helperText="Optional: ID of the mother animal"
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="fatherId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Father (Sire) ID"
              helperText="Optional: ID of the father animal"
            />
          )}
        />
      </Grid>
    </Grid>
  );

  const renderPhysicalDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Controller
          name="birthWeight"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Birth Weight"
              type="number"
              error={!!errors.birthWeight}
              helperText={errors.birthWeight?.message}
              InputProps={{
                endAdornment: <InputAdornment position="end">kg</InputAdornment>,
              }}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="currentWeight"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Current Weight"
              type="number"
              error={!!errors.currentWeight}
              helperText={errors.currentWeight?.message}
              InputProps={{
                endAdornment: <InputAdornment position="end">kg</InputAdornment>,
              }}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="birthType"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Birth Type</InputLabel>
              <Select {...field} label="Birth Type">
                <MenuItem value="single">Single</MenuItem>
                <MenuItem value="twins">Twins</MenuItem>
                <MenuItem value="triplets">Triplets</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="colorMarkings"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Color & Markings"
              placeholder="Describe the animal's color and distinctive markings"
              multiline
              rows={2}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Photos
        </Typography>
        <Paper
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: 'grey.300',
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => document.getElementById('photo-upload').click()}
        >
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
          <PhotoCamera sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Upload Photos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click to select photos or drag and drop them here
          </Typography>
        </Paper>

        {previewUrls.length > 0 && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {previewUrls.map((url, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removePhoto(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </Grid>
  );

  const renderHealthInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Controller
          name="currentStatus"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Health Status</InputLabel>
              <Select {...field} label="Health Status">
                <MenuItem value="excellent">
                  <Chip icon={<HealthAndSafety />} label="Excellent" color="success" size="small" />
                </MenuItem>
                <MenuItem value="good">
                  <Chip icon={<HealthAndSafety />} label="Good" color="info" size="small" />
                </MenuItem>
                <MenuItem value="fair">
                  <Chip icon={<HealthAndSafety />} label="Fair" color="warning" size="small" />
                </MenuItem>
                <MenuItem value="poor">
                  <Chip icon={<HealthAndSafety />} label="Poor" color="error" size="small" />
                </MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Controller
            name="lastCheckup"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Last Health Checkup"
                maxDate={new Date()}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    helperText="Optional: Date of last veterinary checkup"
                  />
                )}
              />
            )}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="veterinarian"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Veterinarian"
              placeholder="Name of primary veterinarian"
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="allergies"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Known Allergies"
              placeholder="List any known allergies"
              multiline
              rows={2}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="medications"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Current Medications"
              placeholder="List any current medications or treatments"
              multiline
              rows={3}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> You can add detailed health records, vaccination history, 
            and weight tracking after the animal is registered.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0: return renderBasicInfo();
      case 1: return renderPhysicalDetails();
      case 2: return renderHealthInfo();
      default: return 'Unknown step';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/animals')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Register New Animal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add a new animal to your farm management system
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Typography variant="body2">{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {getStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                size="large"
              >
                Back
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    startIcon={<Save />}
                    sx={{ px: 4 }}
                  >
                    {isLoading ? 'Registering...' : 'Register Animal'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    size="large"
                    sx={{ px: 4 }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddAnimalPage; 