import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Tab,
  Tabs,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Male,
  Female,
  Cake,
  MonitorWeight,
  HealthAndSafety,
  Vaccines,
  Schedule,
  PhotoCamera,
  Add,
  Timeline,
  LocalHospital,
  Assessment,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnimalById, updateAnimal, deleteAnimal } from '../../store/slices/animalsSlice';
import { format, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnimalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentAnimal, isLoading, error } = useSelector((state) => state.animals);

  const [activeTab, setActiveTab] = useState(0);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [healthNote, setHealthNote] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchAnimalById(id));
    }
  }, [dispatch, id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    navigate(`/animals/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this animal? This action cannot be undone.')) {
      try {
        await dispatch(deleteAnimal(id)).unwrap();
        navigate('/animals');
      } catch (error) {
        console.error('Failed to delete animal:', error);
      }
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight) return;
    
    try {
      const updatedAnimal = {
        ...currentAnimal,
        growth: {
          ...currentAnimal.growth,
          currentWeight: parseFloat(newWeight),
          weightHistory: [
            ...(currentAnimal.growth?.weightHistory || []),
            {
              weight: parseFloat(newWeight),
              date: new Date().toISOString(),
              recordedBy: 'user',
            }
          ]
        }
      };
      
      await dispatch(updateAnimal({ animalId: id, animalData: updatedAnimal })).unwrap();
      setWeightDialogOpen(false);
      setNewWeight('');
    } catch (error) {
      console.error('Failed to add weight record:', error);
    }
  };

  const handleAddHealthRecord = async () => {
    if (!healthNote) return;
    
    try {
      const updatedAnimal = {
        ...currentAnimal,
        health: {
          ...currentAnimal.health,
          records: [
            ...(currentAnimal.health?.records || []),
            {
              date: new Date().toISOString(),
              type: 'observation',
              description: healthNote,
              recordedBy: 'user',
            }
          ]
        }
      };
      
      await dispatch(updateAnimal({ animalId: id, animalData: updatedAnimal })).unwrap();
      setHealthDialogOpen(false);
      setHealthNote('');
    } catch (error) {
      console.error('Failed to add health record:', error);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Unknown';
    
    const birth = new Date(birthDate);
    const now = new Date();
    
    const years = differenceInYears(now, birth);
    const months = differenceInMonths(now, birth) % 12;
    const days = differenceInDays(now, birth) % 30;

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}, ${days} day${days > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
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

  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Name"
                  secondary={currentAnimal.basicInfo?.name || 'Not specified'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Registration Number"
                  secondary={currentAnimal.basicInfo?.registrationNumber || 'Not assigned'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Category"
                  secondary={
                    <Chip
                      label={currentAnimal.basicInfo?.category || 'Unknown'}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Breed"
                  secondary={currentAnimal.basicInfo?.breed || 'Not specified'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  {currentAnimal.basicInfo?.gender === 'male' ? (
                    <Male color="info" />
                  ) : (
                    <Female color="secondary" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Gender"
                  secondary={currentAnimal.basicInfo?.gender || 'Not specified'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Cake />
                </ListItemIcon>
                <ListItemText
                  primary="Date of Birth"
                  secondary={
                    currentAnimal.basicInfo?.dateOfBirth
                      ? format(new Date(currentAnimal.basicInfo.dateOfBirth), 'PPP')
                      : 'Not specified'
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Age"
                  secondary={calculateAge(currentAnimal.basicInfo?.dateOfBirth)}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Physical Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <MonitorWeight />
                </ListItemIcon>
                <ListItemText
                  primary="Current Weight"
                  secondary={`${currentAnimal.growth?.currentWeight || 'Not recorded'} kg`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Birth Weight"
                  secondary={`${currentAnimal.basicInfo?.birthWeight || 'Not recorded'} kg`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Birth Type"
                  secondary={currentAnimal.basicInfo?.birthType || 'Not specified'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Color/Markings"
                  secondary={currentAnimal.basicInfo?.colorMarkings || 'Not described'}
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setWeightDialogOpen(true)}
                size="small"
              >
                Record Weight
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Parentage Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mother (Dam)
                </Typography>
                <Typography variant="body1">
                  {currentAnimal.parentage?.motherId || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Father (Sire)
                </Typography>
                <Typography variant="body1">
                  {currentAnimal.parentage?.fatherId || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderHealthInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Health Records
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setHealthDialogOpen(true)}
                size="small"
              >
                Add Record
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {currentAnimal.health?.records && currentAnimal.health.records.length > 0 ? (
              <List>
                {currentAnimal.health.records
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((record, index) => (
                    <ListItem key={index} divider={index < currentAnimal.health.records.length - 1}>
                      <ListItemIcon>
                        <LocalHospital color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={record.type || 'Health Record'}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {record.description}
                            </Typography>
                            <br />
                            <Typography component="span" variant="caption" color="text.secondary">
                              {format(new Date(record.date), 'PPp')}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No health records available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Current Health Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Chip
                icon={<HealthAndSafety />}
                label={currentAnimal.health?.currentStatus || 'Unknown'}
                color={getHealthStatusColor(currentAnimal.health?.currentStatus)}
                size="large"
                sx={{ fontSize: '1rem', py: 3 }}
              />
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Last Checkup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {currentAnimal.health?.lastCheckup
                ? format(new Date(currentAnimal.health.lastCheckup), 'PPP')
                : 'No checkup recorded'
              }
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Veterinarian
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentAnimal.health?.veterinarian || 'Not assigned'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderGrowthTracking = () => {
    const weightHistory = currentAnimal.growth?.weightHistory || [];
    const chartData = weightHistory
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(record => ({
        date: format(new Date(record.date), 'MMM dd'),
        weight: record.weight,
      }));

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Weight Growth Chart
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#4CAF50" 
                      strokeWidth={2}
                      dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No weight records available for chart
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Weight History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {weightHistory.length > 0 ? (
                <List>
                  {weightHistory
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((record, index) => (
                      <ListItem key={index} divider={index < weightHistory.length - 1}>
                        <ListItemIcon>
                          <MonitorWeight color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${record.weight} kg`}
                          secondary={format(new Date(record.date), 'PPp')}
                        />
                      </ListItem>
                    ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No weight records available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderPhotos = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Photos
          </Typography>
          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            size="small"
          >
            Add Photo
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {currentAnimal.photos && currentAnimal.photos.length > 0 ? (
          <ImageList sx={{ width: '100%', height: 400 }} cols={3} rowHeight={200}>
            {currentAnimal.photos.map((photo, index) => (
              <ImageListItem key={index}>
                <img
                  src={photo.url}
                  alt={`Animal photo ${index + 1}`}
                  loading="lazy"
                  style={{ objectFit: 'cover' }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h2" sx={{ fontSize: '4rem', mb: 2 }}>
              {getAnimalIcon(currentAnimal.basicInfo?.category)}
            </Typography>
            <Typography color="text.secondary">
              No photos available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
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
        <IconButton onClick={() => navigate('/animals')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {currentAnimal.basicInfo?.name || 'Unnamed Animal'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {currentAnimal.basicInfo?.breed} • ID: {currentAnimal.basicInfo?.registrationNumber || 'N/A'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={handleEdit}
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Basic Info" />
          <Tab label="Health" />
          <Tab label="Growth" />
          <Tab label="Photos" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && renderBasicInfo()}
        {activeTab === 1 && renderHealthInfo()}
        {activeTab === 2 && renderGrowthTracking()}
        {activeTab === 3 && renderPhotos()}
      </Box>

      {/* Weight Dialog */}
      <Dialog open={weightDialogOpen} onClose={() => setWeightDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record New Weight</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Weight (kg)"
            type="number"
            fullWidth
            variant="outlined"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWeightDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddWeight} variant="contained">
            Add Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Health Record Dialog */}
      <Dialog open={healthDialogOpen} onClose={() => setHealthDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Health Record</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Health Note"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={healthNote}
            onChange={(e) => setHealthNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHealthDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddHealthRecord} variant="contained">
            Add Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnimalDetailPage; 