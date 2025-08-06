import React, { useEffect, useState } from 'react';
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
  Paper,
  IconButton,
  Alert,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Male,
  Female,
  Pets,
  HealthAndSafety,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { fetchAnimalById, updateAnimal } from '../../store/slices/animalsSlice';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const schema = yup.object({
  name: yup.string().required('Animal name is required'),
  category: yup.string().required('Category is required'),
  breed: yup.string().required('Breed is required'),
  gender: yup.string().required('Gender is required'),
  dateOfBirth: yup.date().required('Date of birth is required'),
  registrationNumber: yup.string(),
  birthWeight: yup.number().positive('Birth weight must be positive').nullable(),
  currentWeight: yup.number().positive('Current weight must be positive').nullable(),
  birthType: yup.string(),
  colorMarkings: yup.string(),
  currentStatus: yup.string(),
  veterinarian: yup.string(),
  allergies: yup.string(),
  medications: yup.string(),
});

const EditAnimalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentAnimal, isLoading, error } = useSelector((state) => state.animals);

  const [formLoading, setFormLoading] = useState(true);

  const breedOptions = {
    cattle: ['Holstein', 'Angus', 'Hereford', 'Brahman', 'Jersey', 'Simmental'],
    goat: ['Boer', 'Nubian', 'Alpine', 'Saanen', 'LaMancha', 'Kiko'],
    sheep: ['Dorper', 'Merino', 'Suffolk', 'Romney', 'Corriedale', 'Border Leicester'],
    horse: ['Arabian', 'Thoroughbred', 'Quarter Horse', 'Clydesdale', 'Mustang'],
    pig: ['Yorkshire', 'Duroc', 'Hampshire', 'Landrace', 'Berkshire'],
    chicken: ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Sussex', 'Orpington'],
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      category: '',
      breed: '',
      gender: '',
      dateOfBirth: null,
      registrationNumber: '',
      birthWeight: null,
      currentWeight: null,
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

  useEffect(() => {
    if (id) {
      dispatch(fetchAnimalById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentAnimal) {
      const formData = {
        name: currentAnimal.basicInfo?.name || '',
        category: currentAnimal.basicInfo?.category || '',
        breed: currentAnimal.basicInfo?.breed || '',
        gender: currentAnimal.basicInfo?.gender || '',
        dateOfBirth: currentAnimal.basicInfo?.dateOfBirth ? new Date(currentAnimal.basicInfo.dateOfBirth) : null,
        registrationNumber: currentAnimal.basicInfo?.registrationNumber || '',
        birthWeight: currentAnimal.basicInfo?.birthWeight || null,
        currentWeight: currentAnimal.growth?.currentWeight || null,
        birthType: currentAnimal.basicInfo?.birthType || 'single',
        colorMarkings: currentAnimal.basicInfo?.colorMarkings || '',
        motherId: currentAnimal.parentage?.motherId || '',
        fatherId: currentAnimal.parentage?.fatherId || '',
        currentStatus: currentAnimal.health?.currentStatus || 'good',
        lastCheckup: currentAnimal.health?.lastCheckup ? new Date(currentAnimal.health.lastCheckup) : null,
        veterinarian: currentAnimal.health?.veterinarian || '',
        allergies: currentAnimal.health?.allergies || '',
        medications: currentAnimal.health?.medications || '',
      };
      
      reset(formData);
      setFormLoading(false);
    }
  }, [currentAnimal, reset]);

  const onSubmit = async (data) => {
    try {
      const updatedAnimal = {
        ...currentAnimal,
        basicInfo: {
          ...currentAnimal.basicInfo,
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
          ...currentAnimal.parentage,
          motherId: data.motherId,
          fatherId: data.fatherId,
        },
        growth: {
          ...currentAnimal.growth,
          currentWeight: data.currentWeight,
        },
        health: {
          ...currentAnimal.health,
          currentStatus: data.currentStatus,
          lastCheckup: data.lastCheckup,
          veterinarian: data.veterinarian,
          allergies: data.allergies,
          medications: data.medications,
        },
      };

      await dispatch(updateAnimal({ animalId: id, animalData: updatedAnimal })).unwrap();
      navigate(`/animals/${id}`);
    } catch (error) {
      console.error('Failed to update animal:', error);
    }
  };

  if (formLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!currentAnimal) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Animal not found
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(`/animals/${id}`)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Edit Animal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update information for {currentAnimal.basicInfo?.name}
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information */}
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Basic Information
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
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
            </Grid>

            {/* Physical Details */}
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Physical Details
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
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
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Parentage */}
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Parentage Information
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
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

            {/* Health Information */}
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Health Information
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="currentStatus"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Health Status</InputLabel>
                      <Select {...field} label="Health Status">
                        <MenuItem value="excellent">Excellent</MenuItem>
                        <MenuItem value="good">Good</MenuItem>
                        <MenuItem value="fair">Fair</MenuItem>
                        <MenuItem value="poor">Poor</MenuItem>
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
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/animals/${id}`)}
                size="large"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={<Save />}
                sx={{ px: 4 }}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditAnimalPage; 