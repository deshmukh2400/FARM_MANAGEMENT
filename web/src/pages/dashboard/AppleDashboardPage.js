import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Paper,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Pets,
  Schedule,
  Inventory,
  Storefront,
  Add,
  Refresh,
  ArrowForward,
  WbSunny,
  Cloud,
  Thermostat,
  Water,
  Warning,
  CheckCircle,
  Info,
  Star,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { 
  FadeIn, 
  ScaleIn, 
  StaggerContainer, 
  StaggerItem, 
  HoverScale,
  InteractiveCard,
  RevealOnScroll,
  GlassMorphism,
  FloatingElement,
  appleEasing
} from '../../components/animations/AppleMotion';

const AppleDashboardPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data - replace with actual Redux selectors
  const dashboardData = {
    stats: {
      totalAnimals: 156,
      totalValue: 125000,
      monthlyRevenue: 8500,
      pendingTasks: 12,
      completedTasks: 89,
      lowStockItems: 7,
      activeListings: 15,
      healthAlerts: 3,
    },
    recentActivity: [
      { id: 1, type: 'animal', title: 'New calf born', time: '2 hours ago', status: 'success' },
      { id: 2, type: 'schedule', title: 'Vaccination completed', time: '4 hours ago', status: 'success' },
      { id: 3, type: 'inventory', title: 'Feed stock low', time: '6 hours ago', status: 'warning' },
      { id: 4, type: 'marketplace', title: 'New inquiry received', time: '1 day ago', status: 'info' },
    ],
    weather: {
      temperature: 24,
      condition: 'sunny',
      humidity: 65,
      windSpeed: 8,
      forecast: 'Perfect weather for outdoor activities',
    },
    chartData: {
      revenue: [
        { month: 'Jan', value: 6500 },
        { month: 'Feb', value: 7200 },
        { month: 'Mar', value: 6800 },
        { month: 'Apr', value: 8100 },
        { month: 'May', value: 7900 },
        { month: 'Jun', value: 8500 },
      ],
      animals: [
        { category: 'Cattle', count: 85, color: '#007AFF' },
        { category: 'Goats', count: 45, color: '#34C759' },
        { category: 'Sheep', count: 26, color: '#FF9500' },
      ],
    },
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const StatCard = ({ title, value, change, icon, color, gradient, delay = 0 }) => (
    <RevealOnScroll>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...appleEasing.spring, delay }}
      >
        <InteractiveCard>
          <Card
            sx={{
              background: gradient,
              color: 'white',
              border: 'none',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.1)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover::before': {
                opacity: 1,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    width: 48,
                    height: 48,
                  }}
                >
                  {icon}
                </Avatar>
                {change && (
                  <Chip
                    icon={change > 0 ? <TrendingUp /> : <TrendingDown />}
                    label={`${change > 0 ? '+' : ''}${change}%`}
                    size="small"
                    sx={{
                      bgcolor: change > 0 ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 59, 48, 0.2)',
                      color: 'white',
                      border: `1px solid ${change > 0 ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 59, 48, 0.3)'}`,
                    }}
                  />
                )}
              </Box>
              
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </Typography>
              
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                {title}
              </Typography>
            </CardContent>
          </Card>
        </InteractiveCard>
      </motion.div>
    </RevealOnScroll>
  );

  const WeatherCard = () => (
    <RevealOnScroll>
      <GlassMorphism
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(52, 199, 89, 0.1) 100%)',
          border: '1px solid rgba(0, 122, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Weather Today
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(currentTime, 'EEEE, MMMM do')}
            </Typography>
          </Box>
          
          <FloatingElement>
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 193, 7, 0.2)',
                color: '#FFC107',
                width: 56,
                height: 56,
              }}
            >
              <WbSunny sx={{ fontSize: '2rem' }} />
            </Avatar>
          </FloatingElement>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mr: 1 }}>
            {dashboardData.weather.temperature}°
          </Typography>
          <Typography variant="h6" color="text.secondary">
            C
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {dashboardData.weather.forecast}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Water sx={{ mr: 1, color: 'info.main', fontSize: '1.25rem' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Humidity
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {dashboardData.weather.humidity}%
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Cloud sx={{ mr: 1, color: 'text.secondary', fontSize: '1.25rem' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Wind
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {dashboardData.weather.windSpeed} km/h
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </GlassMorphism>
    </RevealOnScroll>
  );

  const QuickActions = () => (
    <RevealOnScroll>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}
              >
                <Refresh />
              </motion.div>
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            {[
              { title: 'Add Animal', icon: <Pets />, color: 'success', path: '/animals/add' },
              { title: 'New Schedule', icon: <Schedule />, color: 'warning', path: '/schedules' },
              { title: 'Update Inventory', icon: <Inventory />, color: 'secondary', path: '/inventory' },
              { title: 'Create Listing', icon: <Storefront />, color: 'error', path: '/marketplace' },
            ].map((action, index) => (
              <Grid item xs={6} sm={3} key={action.title}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...appleEasing.spring, delay: 0.1 + (index * 0.05) }}
                >
                  <HoverScale>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={action.icon}
                      sx={{
                        py: 1.5,
                        borderColor: `${action.color}.main`,
                        color: `${action.color}.main`,
                        '&:hover': {
                          bgcolor: `${action.color}.main`,
                          color: 'white',
                          borderColor: `${action.color}.main`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${theme.palette[action.color].main}40`,
                        },
                      }}
                    >
                      {action.title}
                    </Button>
                  </HoverScale>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </RevealOnScroll>
  );

  const RecentActivity = () => (
    <RevealOnScroll>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Recent Activity
          </Typography>

          <StaggerContainer>
            {dashboardData.recentActivity.map((activity, index) => (
              <StaggerItem key={activity.id}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '12px',
                    mb: index < dashboardData.recentActivity.length - 1 ? 1 : 0,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      mr: 2,
                      width: 40,
                      height: 40,
                      bgcolor: activity.status === 'success' ? 'success.main' : 
                               activity.status === 'warning' ? 'warning.main' : 'info.main',
                    }}
                  >
                    {activity.status === 'success' ? <CheckCircle /> : 
                     activity.status === 'warning' ? <Warning /> : <Info />}
                  </Avatar>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {activity.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                  
                  <IconButton size="small">
                    <ArrowForward fontSize="small" />
                  </IconButton>
                </Box>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Button
            fullWidth
            variant="text"
            endIcon={<ArrowForward />}
            sx={{ mt: 2 }}
          >
            View All Activity
          </Button>
        </CardContent>
      </Card>
    </RevealOnScroll>
  );

  const ChartsSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <RevealOnScroll>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Revenue Trend
              </Typography>
              
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.chartData.revenue}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#007AFF"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </RevealOnScroll>
      </Grid>

      <Grid item xs={12} md={4}>
        <RevealOnScroll>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Animal Distribution
              </Typography>
              
              <Box sx={{ height: 200, mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.chartData.animals}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {dashboardData.chartData.animals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Box>
                {dashboardData.chartData.animals.map((item) => (
                  <Box
                    key={item.category}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: item.color,
                          borderRadius: '50%',
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">{item.category}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </RevealOnScroll>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <FadeIn>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  background: 'linear-gradient(135deg, #007AFF 0%, #34C759 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Good morning! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Here's what's happening on your farm today
              </Typography>
            </Box>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={appleEasing.spring}
            >
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  fontWeight: 500,
                  textAlign: 'right',
                }}
              >
                {format(currentTime, 'h:mm a')}
                <br />
                <Typography variant="body2" component="span">
                  {format(currentTime, 'EEEE, MMM do')}
                </Typography>
              </Typography>
            </motion.div>
          </Box>
        </Box>
      </FadeIn>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Animals"
            value={dashboardData.stats.totalAnimals}
            change={8.2}
            icon={<Pets />}
            gradient="linear-gradient(135deg, #007AFF 0%, #0051D5 100%)"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Farm Value"
            value={`$${(dashboardData.stats.totalValue / 1000).toFixed(0)}K`}
            change={12.5}
            icon={<TrendingUp />}
            gradient="linear-gradient(135deg, #34C759 0%, #30B54A 100%)"
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Monthly Revenue"
            value={`$${(dashboardData.stats.monthlyRevenue / 1000).toFixed(1)}K`}
            change={-3.1}
            icon={<Star />}
            gradient="linear-gradient(135deg, #FF9500 0%, #E6850E 100%)"
            delay={0.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Pending Tasks"
            value={dashboardData.stats.pendingTasks}
            icon={<Schedule />}
            gradient="linear-gradient(135deg, #AF52DE 0%, #9A42C8 100%)"
            delay={0.4}
          />
        </Grid>
      </Grid>

      {/* Weather and Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <WeatherCard />
        </Grid>
        <Grid item xs={12} md={8}>
          <QuickActions />
        </Grid>
      </Grid>

      {/* Charts and Recent Activity */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <ChartsSection />
        </Grid>
        <Grid item xs={12} lg={4}>
          <RecentActivity />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AppleDashboardPage; 