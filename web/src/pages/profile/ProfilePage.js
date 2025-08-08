import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  Tab,
  Tabs,
  Badge,
} from '@mui/material';
import {
  Person,
  Edit,
  Settings,
  Notifications,
  Security,
  Help,
  Logout,
  PhotoCamera,
  Agriculture,
  LocationOn,
  Phone,
  Email,
  Language,
  Palette,
  VolumeUp,
  Brightness4,
  Shield,
  Key,
  Delete,
  Save,
  Cancel,
  Info,
  TrendingUp,
  Assessment,
  Timeline,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, changePassword, deleteAccount, logout } from '../../store/slices/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [currentTab, setCurrentTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    farmName: user?.farmName || '',
    location: user?.location || '',
    bio: user?.bio || '',
    specializations: user?.specializations || [],
    experience: user?.experience || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      showPhone: false,
      showEmail: false,
      showLocation: true,
    },
  });

  const farmStats = {
    totalAnimals: 156,
    totalValue: 125000,
    monthlyRevenue: 8500,
    completedSchedules: 89,
    pendingTasks: 12,
    inventoryItems: 45,
    marketplaceListings: 8,
  };

  const handleProfileUpdate = async () => {
    try {
      await dispatch(updateProfile(profileData)).unwrap();
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })).unwrap();
      
      setChangePasswordOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccount()).unwrap();
      // Account deleted, user will be logged out automatically
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderProfileTab = () => (
    <Grid container spacing={3}>
      {/* Profile Card */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              }
            >
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </Badge>
            
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {user?.name || 'User Name'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Farm Owner • {user?.experience || 'Experience not specified'}
            </Typography>
            
            <Chip
                              icon={<Agriculture />}
              label={user?.farmName || 'Farm Name Not Set'}
              color="primary"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Button
                variant={editMode ? 'outlined' : 'contained'}
                startIcon={editMode ? <Cancel /> : <Edit />}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </Button>
              
              {editMode && (
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleProfileUpdate}
                  disabled={isLoading}
                >
                  Save
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Stats
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <TrendingUp color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Total Animals" 
                  secondary={farmStats.totalAnimals}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Assessment color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Farm Value" 
                  secondary={`$${farmStats.totalValue.toLocaleString()}`}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Timeline color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Monthly Revenue" 
                  secondary={`$${farmStats.monthlyRevenue.toLocaleString()}`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Profile Form */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Profile Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Farm Name"
                  value={profileData.farmName}
                  onChange={(e) => setProfileData({...profileData, farmName: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                                          startAdornment: <Agriculture sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  value={profileData.experience}
                  onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                  disabled={!editMode}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio / About"
                  multiline
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  disabled={!editMode}
                  placeholder="Tell others about yourself and your farm..."
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Farm Statistics */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Farm Statistics
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {farmStats.totalAnimals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Animals
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                    {farmStats.completedSchedules}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Tasks
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                    {farmStats.pendingTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Tasks
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                    {farmStats.marketplaceListings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Listings
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSettingsTab = () => (
    <Grid container spacing={3}>
      {/* Preferences */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Preferences
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Language />
                </ListItemIcon>
                <ListItemText primary="Language" />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={preferences.language}
                      onChange={(e) => setPreferences({
                        ...preferences, 
                        language: e.target.value
                      })}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Palette />
                </ListItemIcon>
                <ListItemText primary="Theme" />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={preferences.theme}
                      onChange={(e) => setPreferences({
                        ...preferences, 
                        theme: e.target.value
                      })}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="auto">Auto</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Privacy Settings
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText 
                  primary="Profile Visible" 
                  secondary="Allow others to see your profile"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.privacy.profileVisible}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      privacy: {
                        ...preferences.privacy,
                        profileVisible: e.target.checked,
                      }
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Phone />
                </ListItemIcon>
                <ListItemText 
                  primary="Show Phone Number" 
                  secondary="Display phone in marketplace listings"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.privacy.showPhone}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      privacy: {
                        ...preferences.privacy,
                        showPhone: e.target.checked,
                      }
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText 
                  primary="Show Email" 
                  secondary="Display email in marketplace listings"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.privacy.showEmail}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      privacy: {
                        ...preferences.privacy,
                        showEmail: e.target.checked,
                      }
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Notifications */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Notification Settings
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive notifications via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.notifications.email}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        email: e.target.checked,
                      }
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Notifications />
                </ListItemIcon>
                <ListItemText 
                  primary="Push Notifications" 
                  secondary="Receive push notifications on your device"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.notifications.push}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        push: e.target.checked,
                      }
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Phone />
                </ListItemIcon>
                <ListItemText 
                  primary="SMS Notifications" 
                  secondary="Receive important alerts via SMS"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.notifications.sms}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notifications: {
                        ...preferences.notifications,
                        sms: e.target.checked,
                      }
                    })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Security Actions */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Security & Account
            </Typography>
            
            <List>
              <ListItem 
                button 
                onClick={() => setChangePasswordOpen(true)}
              >
                <ListItemIcon>
                  <Key />
                </ListItemIcon>
                <ListItemText 
                  primary="Change Password" 
                  secondary="Update your account password"
                />
              </ListItem>
              
              <ListItem button>
                <ListItemIcon>
                  <Shield />
                </ListItemIcon>
                <ListItemText 
                  primary="Two-Factor Authentication" 
                  secondary="Add extra security to your account"
                />
                <ListItemSecondaryAction>
                  <Chip label="Not Enabled" size="small" />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider />
              
              <ListItem 
                button 
                onClick={handleLogout}
              >
                <ListItemIcon>
                  <Logout color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout" 
                  secondary="Sign out of your account"
                />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => setDeleteAccountOpen(true)}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon>
                  <Delete color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Delete Account" 
                  secondary="Permanently delete your account and data"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Profile & Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your profile, preferences, and account settings
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Settings />} label="Settings" />
        </Tabs>
      </Paper>

      {/* Content */}
      {currentTab === 0 && renderProfileTab()}
      {currentTab === 1 && renderSettingsTab()}

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained"
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body1">
            Are you sure you want to delete your account? This will permanently remove:
          </Typography>
          <List dense sx={{ mt: 1 }}>
            <ListItem>
              <ListItemText primary="• All animal records and data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Farm schedules and inventory" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Marketplace listings and inquiries" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Profile and account information" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAccount} 
            variant="contained"
            color="error"
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage; 