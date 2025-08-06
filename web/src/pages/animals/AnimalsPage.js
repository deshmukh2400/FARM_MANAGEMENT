import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Menu,
  Avatar,
  Fab,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Pets,
  Male,
  Female,
  Cake,
  MonitorWeight,
  HealthAndSafety,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnimals, deleteAnimal, setFilters } from '../../store/slices/animalsSlice';
import { format, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';

const AnimalsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { animals, isLoading, error, filters } = useSelector((state) => state.animals);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    dispatch(fetchAnimals());
  }, [dispatch]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    dispatch(setFilters({ search: value }));
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  const handleMenuOpen = (event, animal) => {
    setAnchorEl(event.currentTarget);
    setSelectedAnimal(animal);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAnimal(null);
  };

  const handleViewAnimal = () => {
    navigate(`/animals/${selectedAnimal._id}`);
    handleMenuClose();
  };

  const handleEditAnimal = () => {
    navigate(`/animals/${selectedAnimal._id}/edit`);
    handleMenuClose();
  };

  const handleDeleteAnimal = async () => {
    if (window.confirm('Are you sure you want to delete this animal?')) {
      try {
        await dispatch(deleteAnimal(selectedAnimal._id)).unwrap();
      } catch (error) {
        console.error('Failed to delete animal:', error);
      }
    }
    handleMenuClose();
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Unknown';
    
    const birth = new Date(birthDate);
    const now = new Date();
    
    const years = differenceInYears(now, birth);
    const months = differenceInMonths(now, birth) % 12;
    const days = differenceInDays(now, birth) % 30;

    if (years > 0) {
      return `${years}y ${months}m`;
    } else if (months > 0) {
      return `${months}m ${days}d`;
    } else {
      return `${days} days`;
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const getAnimalIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'cattle': return '🐄';
      case 'goat': return '🐐';
      case 'sheep': return '🐑';
      case 'horse': return '🐎';
      case 'pig': return '🐷';
      case 'chicken': return '🐔';
      default: return '🐾';
    }
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = !searchTerm || 
      animal.basicInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.basicInfo?.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.basicInfo?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filters.category === 'all' || 
      animal.basicInfo?.category === filters.category;

    const matchesGender = filters.gender === 'all' || 
      animal.basicInfo?.gender === filters.gender;

    const matchesStatus = filters.status === 'all' || 
      animal.health?.currentStatus?.toLowerCase() === filters.status.toLowerCase();

    return matchesSearch && matchesCategory && matchesGender && matchesStatus;
  });

  const renderAnimalCard = (animal) => (
    <Card 
      key={animal._id}
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
      onClick={() => navigate(`/animals/${animal._id}`)}
    >
      <CardMedia
        sx={{ 
          height: 200,
          position: 'relative',
          background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {animal.photos && animal.photos.length > 0 ? (
          <img
            src={animal.photos[0].url}
            alt={animal.basicInfo?.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Typography variant="h1" sx={{ fontSize: '4rem' }}>
            {getAnimalIcon(animal.basicInfo?.category)}
          </Typography>
        )}
        
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, animal);
            }}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
          <Chip
            label={animal.basicInfo?.category || 'Animal'}
            size="small"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.9)',
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          />
        </Box>
      </CardMedia>

      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
            {animal.basicInfo?.name || 'Unnamed Animal'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            {animal.basicInfo?.gender === 'male' ? (
              <Male color="info" fontSize="small" />
            ) : (
              <Female color="secondary" fontSize="small" />
            )}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {animal.basicInfo?.breed} • ID: {animal.basicInfo?.registrationNumber || 'N/A'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Cake fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {calculateAge(animal.basicInfo?.dateOfBirth)}
          </Typography>
        </Box>

        {animal.growth?.currentWeight && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <MonitorWeight fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {animal.growth.currentWeight} kg
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Chip
            icon={<HealthAndSafety />}
            label={animal.health?.currentStatus || 'Unknown'}
            color={getHealthStatusColor(animal.health?.currentStatus)}
            size="small"
            variant="outlined"
          />
          
          <Typography variant="caption" color="text.secondary">
            Added {format(new Date(animal.createdAt), 'MMM dd')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderEmptyState = () => (
    <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
      <Pets sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        No Animals Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {searchTerm || Object.values(filters).some(f => f !== 'all') 
          ? 'Try adjusting your search criteria or filters'
          : 'Start by registering your first animal'
        }
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => navigate('/animals/add')}
        size="large"
      >
        Register First Animal
      </Button>
    </Paper>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            My Animals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your livestock
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/animals/add')}
          size="large"
          sx={{ px: 3 }}
        >
          Add Animal
        </Button>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
              {animals.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Animals
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
              {animals.filter(a => a.health?.currentStatus === 'excellent').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Healthy
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
              {animals.filter(a => a.basicInfo?.gender === 'male').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Male
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 700 }}>
              {animals.filter(a => a.basicInfo?.gender === 'female').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Female
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search animals..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="cattle">Cattle</MenuItem>
                <MenuItem value="goat">Goats</MenuItem>
                <MenuItem value="sheep">Sheep</MenuItem>
                <MenuItem value="horse">Horses</MenuItem>
                <MenuItem value="pig">Pigs</MenuItem>
                <MenuItem value="chicken">Chickens</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={filters.gender}
                label="Gender"
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <MenuItem value="all">All Genders</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Health Status</InputLabel>
              <Select
                value={filters.status}
                label="Health Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="excellent">Excellent</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="fair">Fair</MenuItem>
                <MenuItem value="poor">Poor</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                dispatch(setFilters({ category: 'all', gender: 'all', status: 'all', search: '' }));
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Animals Grid */}
      {!isLoading && (
        <>
          {filteredAnimals.length > 0 ? (
            <Grid container spacing={3}>
              {filteredAnimals.map((animal) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={animal._id}>
                  {renderAnimalCard(animal)}
                </Grid>
              ))}
            </Grid>
          ) : (
            renderEmptyState()
          )}
        </>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewAnimal}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditAnimal}>
          <Edit sx={{ mr: 1 }} />
          Edit Animal
        </MenuItem>
        <MenuItem onClick={handleDeleteAnimal} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Animal
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add animal"
        onClick={() => navigate('/animals/add')}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default AnimalsPage; 