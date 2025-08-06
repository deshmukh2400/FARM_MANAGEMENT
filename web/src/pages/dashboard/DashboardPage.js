import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Pets,
  Schedule,
  Inventory,
  Warning,
  Add,
  Refresh,
  WbSunny,
  Thermostat,
  Water,
  Air,
  Notifications,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchAnimals } from '../../store/slices/animalsSlice';
import { fetchSchedules } from '../../store/slices/schedulesSlice';
import { fetchInventory } from '../../store/slices/inventorySlice';
import { dashboardAPI } from '../../services/api';

const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3'];

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { animals } = useSelector((state) => state.animals);
  const { schedules, stats: scheduleStats } = useSelector((state) => state.schedules);
  const { items: inventory, stats: inventoryStats } = useSelector((state) => state.inventory);

  const [dashboardStats, setDashboardStats] = useState({
    totalAnimals: 0,
    healthyAnimals: 0,
    upcomingSchedules: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', animals: 45, revenue: 12000 },
    { month: 'Feb', animals: 48, revenue: 15000 },
    { month: 'Mar', animals: 52, revenue: 18000 },
    { month: 'Apr', animals: 55, revenue: 22000 },
    { month: 'May', animals: 58, revenue: 25000 },
    { month: 'Jun', animals: 62, revenue: 28000 },
  ];

  const animalDistribution = [
    { name: 'Cattle', value: 35, color: '#4CAF50' },
    { name: 'Goats', value: 25, color: '#FF9800' },
    { name: 'Sheep', value: 15, color: '#2196F3' },
    { name: 'Others', value: 10, color: '#9C27B0' },
  ];

  useEffect(() => {
    loadDashboardData();
  }, [dispatch]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data from Redux stores
      await Promise.all([
        dispatch(fetchAnimals()),
        dispatch(fetchSchedules()),
        dispatch(fetchInventory()),
      ]);

      // Load additional dashboard data
      const [statsResponse, activityResponse, weatherResponse] = await Promise.allSettled([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivity(),
        dashboardAPI.getWeatherData(),
      ]);

      if (statsResponse.status === 'fulfilled') {
        setDashboardStats(statsResponse.value.data);
      }

      if (activityResponse.status === 'fulfilled') {
        setRecentActivity(activityResponse.value.data);
      }

      if (weatherResponse.status === 'fulfilled') {
        setWeatherData(weatherResponse.value.data);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'animal_added': return <Pets color="primary" />;
      case 'schedule_completed': return <CheckCircle color="success" />;
      case 'inventory_low': return <Warning color="warning" />;
      case 'health_alert': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  const formatActivityTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const quickActions = [
    {
      title: 'Add Animal',
      description: 'Register a new animal',
      icon: <Pets />,
      color: '#4CAF50',
      action: () => navigate('/animals/add'),
    },
    {
      title: 'Create Schedule',
      description: 'Add vaccination or task',
      icon: <Schedule />,
      color: '#2196F3',
      action: () => navigate('/schedules'),
    },
    {
      title: 'Add Inventory',
      description: 'Stock medicines or feed',
      icon: <Inventory />,
      color: '#FF9800',
      action: () => navigate('/inventory/add'),
    },
    {
      title: 'View Marketplace',
      description: 'Browse or list animals',
      icon: <TrendingUp />,
      color: '#9C27B0',
      action: () => navigate('/marketplace'),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Farmer'}! 👋
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Welcome back to {user?.farmName || 'your farm'}
            </Typography>
          </Box>
          <IconButton onClick={loadDashboardData} disabled={loading}>
            <Refresh />
          </IconButton>
        </Box>

        {/* Weather Widget */}
        {weatherData && (
          <Paper sx={{ p: 2, mb: 3, background: 'linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WbSunny sx={{ fontSize: 48, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {weatherData.temperature}°C
                  </Typography>
                  <Typography variant="body1">
                    {weatherData.description}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {weatherData.location}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Water sx={{ mr: 1 }} />
                  <Typography>{weatherData.humidity}% Humidity</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Air sx={{ mr: 1 }} />
                  <Typography>{weatherData.windSpeed} km/h Wind</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {animals.length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Total Animals
                  </Typography>
                </Box>
                <Pets sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  +5 this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {scheduleStats.pending}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Pending Tasks
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {scheduleStats.overdue} overdue
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {inventoryStats.lowStock}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Low Stock Items
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Need attention
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ${dashboardStats.totalRevenue?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Monthly Revenue
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  +{dashboardStats.monthlyGrowth}% growth
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Charts Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Farm Growth Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="animals" stackId="1" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} />
                <Area type="monotone" dataKey="revenue" stackId="2" stroke="#2196F3" fill="#2196F3" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer', 
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}
                    onClick={action.action}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: action.color, mr: 2 }}>
                        {action.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Animal Distribution */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Animal Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={animalDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {animalDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {animalDistribution.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: '50%', mr: 1 }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Notifications color="action" />
            </Box>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatActivityTime(activity.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              )) : (
                <ListItem>
                  <ListItemText
                    primary="No recent activity"
                    secondary="Your farm activities will appear here"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 