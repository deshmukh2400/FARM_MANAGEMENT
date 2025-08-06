import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Badge,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  CheckCircle,
  Schedule,
  Vaccines,
  Favorite,
  LocalHospital,
  Warning,
  Event,
  CalendarToday,
  Refresh,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedules, completeSchedule, deleteSchedule, setFilters } from '../../store/slices/schedulesSlice';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const SchedulesPage = () => {
  const dispatch = useDispatch();
  const { schedules, isLoading, error, filters, stats } = useSelector((state) => state.schedules);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list or calendar
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    dispatch(fetchSchedules());
  }, [dispatch]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    dispatch(setFilters({ search: value }));
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  const handleMenuOpen = (event, schedule) => {
    setAnchorEl(event.currentTarget);
    setSelectedSchedule(schedule);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSchedule(null);
  };

  const handleCompleteSchedule = async () => {
    if (selectedSchedule) {
      try {
        await dispatch(completeSchedule({
          scheduleId: selectedSchedule._id,
          completionData: {
            completedAt: new Date().toISOString(),
            notes: completionNotes,
            completedBy: 'user',
          }
        })).unwrap();
        
        setCompleteDialogOpen(false);
        setCompletionNotes('');
        handleMenuClose();
      } catch (error) {
        console.error('Failed to complete schedule:', error);
      }
    }
  };

  const handleDeleteSchedule = async () => {
    if (selectedSchedule && window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await dispatch(deleteSchedule(selectedSchedule._id)).unwrap();
        handleMenuClose();
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };

  const getScheduleIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'vaccination': return <Vaccines color="primary" />;
      case 'deworming': return <LocalHospital color="secondary" />;
      case 'breeding': return <Favorite color="error" />;
      case 'health_check': return <LocalHospital color="info" />;
      case 'feeding': return <Schedule color="success" />;
      default: return <Event color="action" />;
    }
  };

  const getScheduleTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'vaccination': return 'primary';
      case 'deworming': return 'secondary';
      case 'breeding': return 'error';
      case 'health_check': return 'info';
      case 'feeding': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getScheduleStatus = (schedule) => {
    if (schedule.status === 'completed') return { label: 'Completed', color: 'success' };
    if (isPast(new Date(schedule.scheduledDate))) return { label: 'Overdue', color: 'error' };
    if (isToday(new Date(schedule.scheduledDate))) return { label: 'Due Today', color: 'warning' };
    if (isTomorrow(new Date(schedule.scheduledDate))) return { label: 'Due Tomorrow', color: 'info' };
    return { label: 'Upcoming', color: 'default' };
  };

  const formatScheduleDate = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) {
      const days = Math.abs(differenceInDays(new Date(), date));
      return `${days} day${days > 1 ? 's' : ''} overdue`;
    }
    return format(date, 'MMM dd, yyyy');
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = !searchTerm || 
      schedule.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.animalId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filters.type === 'all' || schedule.type === filters.type;
    const matchesStatus = filters.status === 'all' || schedule.status === filters.status;
    const matchesPriority = filters.priority === 'all' || schedule.priority === filters.priority;

    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const calendarEvents = schedules.map(schedule => ({
    id: schedule._id,
    title: schedule.title,
    start: new Date(schedule.scheduledDate),
    end: new Date(schedule.scheduledDate),
    resource: schedule,
  }));

  const renderScheduleCard = (schedule) => {
    const status = getScheduleStatus(schedule);
    
    return (
      <Card 
        key={schedule._id}
        sx={{ 
          mb: 2,
          border: schedule.status === 'completed' ? '2px solid' : '1px solid',
          borderColor: schedule.status === 'completed' ? 'success.main' : 'divider',
          opacity: schedule.status === 'completed' ? 0.8 : 1,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {getScheduleIcon(schedule.type)}
              <Box sx={{ ml: 2, flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {schedule.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {schedule.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Animal: {schedule.animalId || 'Not specified'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={status.label}
                color={status.color}
                size="small"
                variant={schedule.status === 'completed' ? 'filled' : 'outlined'}
              />
              
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, schedule)}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={schedule.type}
                color={getScheduleTypeColor(schedule.type)}
                size="small"
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
              
              <Chip
                label={schedule.priority}
                color={getPriorityColor(schedule.priority)}
                size="small"
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {formatScheduleDate(schedule.scheduledDate)}
              </Typography>
            </Box>
          </Box>

          {schedule.status !== 'completed' && isPast(new Date(schedule.scheduledDate)) && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This schedule is overdue. Please complete it as soon as possible.
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
      <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        No Schedules Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {searchTerm || Object.values(filters).some(f => f !== 'all') 
          ? 'Try adjusting your search criteria or filters'
          : 'Create your first schedule to start managing farm tasks'
        }
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        size="large"
      >
        Create First Schedule
      </Button>
    </Paper>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Farm Schedules
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage vaccination, breeding, and health schedules
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
          >
            Add Schedule
          </Button>
        </Box>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Schedules
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
              {stats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
              {stats.overdue}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overdue
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
              {stats.completed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
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
              placeholder="Search schedules..."
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
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="vaccination">Vaccination</MenuItem>
                <MenuItem value="deworming">Deworming</MenuItem>
                <MenuItem value="breeding">Breeding</MenuItem>
                <MenuItem value="health_check">Health Check</MenuItem>
                <MenuItem value="feeding">Feeding</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                dispatch(setFilters({ type: 'all', status: 'all', priority: 'all', search: '' }));
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

      {/* Content */}
      {viewMode === 'list' ? (
        <Box>
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map(renderScheduleCard)
          ) : (
            renderEmptyState()
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 2, height: 600 }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={(event) => {
              setSelectedSchedule(event.resource);
              // Handle event selection
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.resource.status === 'completed' ? '#4CAF50' : '#2196F3',
              },
            })}
          />
        </Paper>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedSchedule?.status !== 'completed' && (
          <MenuItem onClick={() => setCompleteDialogOpen(true)}>
            <CheckCircle sx={{ mr: 1 }} />
            Mark Complete
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Edit Schedule
        </MenuItem>
        <MenuItem onClick={handleDeleteSchedule} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Schedule
        </MenuItem>
      </Menu>

      {/* Complete Schedule Dialog */}
      <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Schedule</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Mark "{selectedSchedule?.title}" as completed?
          </Typography>
          <TextField
            fullWidth
            label="Completion Notes (Optional)"
            multiline
            rows={3}
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Add any notes about the completion..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCompleteSchedule} variant="contained">
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add schedule"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default SchedulesPage; 