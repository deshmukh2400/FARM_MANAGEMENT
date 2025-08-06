import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  useMediaQuery,
  useTheme,
  Chip,
  Fade,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Pets,
  Schedule,
  Inventory,
  Storefront,
  Person,
  Settings,
  Logout,
  Notifications,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Close,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser } from '../../store/slices/authSlice';
import { 
  FadeIn, 
  SlideInFromBottom, 
  HoverScale, 
  GlassMorphism,
  appleEasing 
} from '../animations/AppleMotion';

const drawerWidth = 280;

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <Dashboard />, 
    path: '/dashboard',
    color: '#007AFF',
    gradient: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)'
  },
  { 
    text: 'Animals', 
    icon: <Pets />, 
    path: '/animals',
    color: '#34C759',
    gradient: 'linear-gradient(135deg, #34C759 0%, #30B54A 100%)'
  },
  { 
    text: 'Schedules', 
    icon: <Schedule />, 
    path: '/schedules',
    color: '#FF9500',
    gradient: 'linear-gradient(135deg, #FF9500 0%, #E6850E 100%)'
  },
  { 
    text: 'Inventory', 
    icon: <Inventory />, 
    path: '/inventory',
    color: '#AF52DE',
    gradient: 'linear-gradient(135deg, #AF52DE 0%, #9A42C8 100%)'
  },
  { 
    text: 'Marketplace', 
    icon: <Storefront />, 
    path: '/marketplace',
    color: '#FF3B30',
    gradient: 'linear-gradient(135deg, #FF3B30 0%, #E6342A 100%)'
  },
];

const AppleDashboardLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);

  // Handle scroll effect for app bar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    handleProfileMenuClose();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...appleEasing.spring, delay: 0.1 }}
      >
        <Toolbar sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <motion.img 
              src="/assets/images/logo.svg" 
              alt="Farm Manager" 
              style={{ height: 36, marginRight: 16 }}
              whileHover={{ scale: 1.05 }}
              transition={appleEasing.smooth}
            />
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '1.25rem',
                  background: 'linear-gradient(135deg, #007AFF 0%, #34C759 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Farm Manager
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              >
                Smart Farming
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </motion.div>

      <Divider sx={{ mx: 2, opacity: 0.1 }} />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, px: 2, py: 1 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <List sx={{ gap: 0.5 }}>
            {menuItems.map((item, index) => {
              const isSelected = location.pathname === item.path;
              
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    ...appleEasing.spring, 
                    delay: 0.1 + (index * 0.05) 
                  }}
                >
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <HoverScale scale={1.02}>
                      <ListItemButton
                        onClick={() => handleNavigation(item.path)}
                        selected={isSelected}
                        sx={{
                          borderRadius: '16px',
                          py: 1.5,
                          px: 2,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&.Mui-selected': {
                            background: item.gradient,
                            color: 'white',
                            boxShadow: `0 8px 25px ${item.color}40`,
                            '&:hover': {
                              background: item.gradient,
                              transform: 'translateY(-1px)',
                              boxShadow: `0 12px 35px ${item.color}50`,
                            },
                            '& .MuiListItemIcon-root': {
                              color: 'white',
                            },
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
                          },
                          '&:hover': {
                            backgroundColor: `${item.color}10`,
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <ListItemIcon 
                          sx={{ 
                            minWidth: 40,
                            color: isSelected ? 'white' : item.color,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text}
                          primaryTypographyProps={{
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: '0.95rem',
                          }}
                        />
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={appleEasing.spring}
                          >
                            <Chip 
                              size="small" 
                              label="•" 
                              sx={{ 
                                bgcolor: 'rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                minWidth: '8px',
                                height: '8px',
                                '& .MuiChip-label': {
                                  px: 0,
                                  fontSize: '0.6rem',
                                },
                              }} 
                            />
                          </motion.div>
                        )}
                      </ListItemButton>
                    </HoverScale>
                  </ListItem>
                </motion.div>
              );
            })}
          </List>
        </motion.div>
      </Box>

      {/* User Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...appleEasing.spring, delay: 0.4 }}
      >
        <Divider sx={{ mx: 2, mb: 2, opacity: 0.1 }} />
        <Box sx={{ px: 3, pb: 2 }}>
          <GlassMorphism
            sx={{
              p: 2,
              background: 'rgba(0, 122, 255, 0.1)',
              border: '1px solid rgba(0, 122, 255, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                sx={{ 
                  width: 36,
                  height: 36,
                  mr: 1.5,
                  background: 'linear-gradient(135deg, #007AFF 0%, #34C759 100%)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {user?.name?.substring(0, 2)?.toUpperCase() || 'FM'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.name || 'Farm Manager'}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.farmName || 'Farm Owner'}
                </Typography>
              </Box>
            </Box>
          </GlassMorphism>
        </Box>
      </motion.div>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={appleEasing.spring}
        style={{ width: '100%', position: 'fixed', top: 0, zIndex: 1201 }}
      >
        <AppBar
          position="static"
          sx={{
            width: { lg: `calc(100% - ${drawerWidth}px)` },
            ml: { lg: `${drawerWidth}px` },
            background: scrolled 
              ? 'rgba(255, 255, 255, 0.8)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: 'text.primary',
            boxShadow: scrolled 
              ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
              : '0 1px 3px rgba(0, 0, 0, 0.05)',
            borderBottom: `1px solid ${scrolled ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Toolbar sx={{ px: 3 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { lg: 'none' },
                borderRadius: '12px',
                '&:hover': {
                  bgcolor: 'rgba(0, 122, 255, 0.1)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {/* Notifications */}
            <HoverScale>
              <IconButton 
                color="inherit" 
                sx={{ 
                  mr: 2,
                  borderRadius: '12px',
                  '&:hover': {
                    bgcolor: 'rgba(0, 122, 255, 0.1)',
                  },
                }}
                onClick={handleNotificationOpen}
              >
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </HoverScale>
            
            {/* Profile */}
            <HoverScale>
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ 
                  p: 0.5,
                  borderRadius: '12px',
                  '&:hover': {
                    bgcolor: 'rgba(0, 122, 255, 0.1)',
                  },
                }}
              >
                <Avatar
                  sx={{ 
                    background: 'linear-gradient(135deg, #007AFF 0%, #34C759 100%)',
                    width: 40,
                    height: 40,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.name?.substring(0, 2)?.toUpperCase() || 'FM'}
                </Avatar>
              </IconButton>
            </HoverScale>
          </Toolbar>
        </AppBar>
      </motion.div>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            mt: 1.5,
            minWidth: 220,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="body1" fontWeight={600}>
            {user?.name || 'Farm Manager'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider sx={{ opacity: 0.1 }} />
        <MenuItem 
          onClick={() => navigate('/profile')}
          sx={{ 
            mx: 1, 
            borderRadius: '8px',
            '&:hover': {
              bgcolor: 'rgba(0, 122, 255, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem 
          onClick={() => navigate('/settings')}
          sx={{ 
            mx: 1, 
            borderRadius: '8px',
            '&:hover': {
              bgcolor: 'rgba(0, 122, 255, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider sx={{ opacity: 0.1 }} />
        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            mx: 1, 
            borderRadius: '8px',
            color: 'error.main',
            '&:hover': {
              bgcolor: 'rgba(255, 59, 48, 0.1)',
            },
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          elevation: 0,
          sx: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            mt: 1.5,
            minWidth: 320,
            maxWidth: 400,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You have 3 new notifications
          </Typography>
        </Box>
        <Divider sx={{ opacity: 0.1 }} />
        {/* Add notification items here */}
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: 'none',
            },
          }}
        >
          <Box sx={{ position: 'relative', height: '100%' }}>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                borderRadius: '12px',
              }}
            >
              <Close />
            </IconButton>
            {drawer}
          </Box>
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: 'none',
              borderRight: '1px solid rgba(0, 0, 0, 0.05)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default',
          minHeight: '100vh',
          pt: '64px', // Account for fixed app bar
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <FadeIn delay={0.2}>
            {children}
          </FadeIn>
        </Box>
      </Box>
    </Box>
  );
};

export default AppleDashboardLayout; 