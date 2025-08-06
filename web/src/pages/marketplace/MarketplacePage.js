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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Paper,
  Avatar,
  Divider,
  Rating,
  Badge,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Favorite,
  FavoriteBorder,
  Share,
  LocationOn,
  Phone,
  Email,
  AttachMoney,
  Pets,
  Male,
  Female,
  Star,
  Message,
  Visibility,
  TrendingUp,
  LocalOffer,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMarketplace, createListing, updateListing, deleteListing, createInquiry, setFilters } from '../../store/slices/marketplaceSlice';
import { format, differenceInMonths } from 'date-fns';

const MarketplacePage = () => {
  const dispatch = useDispatch();
  const { listings, inquiries, isLoading, error, filters, stats } = useSelector((state) => state.marketplace);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [inquiryData, setInquiryData] = useState({
    message: '',
    contactPhone: '',
    contactEmail: '',
    inquiryType: 'purchase',
  });

  const categories = ['cattle', 'goat', 'sheep', 'horse', 'pig', 'chicken'];
  const listingTypes = ['sale', 'breeding', 'both'];
  const priceRanges = [
    { label: 'Under $500', value: '0-500' },
    { label: '$500 - $1,000', value: '500-1000' },
    { label: '$1,000 - $2,500', value: '1000-2500' },
    { label: '$2,500 - $5,000', value: '2500-5000' },
    { label: 'Over $5,000', value: '5000+' },
  ];

  useEffect(() => {
    dispatch(fetchMarketplace());
  }, [dispatch]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    dispatch(setFilters({ search: value }));
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  const handleMenuOpen = (event, listing) => {
    setAnchorEl(event.currentTarget);
    setSelectedListing(listing);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedListing(null);
  };

  const handleInquiry = (listing) => {
    setSelectedListing(listing);
    setInquiryDialogOpen(true);
    handleMenuClose();
  };

  const handleSendInquiry = async () => {
    try {
      await dispatch(createInquiry({
        listingId: selectedListing._id,
        sellerId: selectedListing.sellerId,
        ...inquiryData,
      })).unwrap();
      
      setInquiryDialogOpen(false);
      setInquiryData({
        message: '',
        contactPhone: '',
        contactEmail: '',
        inquiryType: 'purchase',
      });
    } catch (error) {
      console.error('Failed to send inquiry:', error);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    const months = differenceInMonths(new Date(), new Date(dateOfBirth));
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years}y ${remainingMonths}m`;
  };

  const getGenderIcon = (gender) => {
    return gender === 'male' ? <Male color="info" /> : <Female color="secondary" />;
  };

  const getListingTypeColor = (type) => {
    switch (type) {
      case 'sale': return 'success';
      case 'breeding': return 'secondary';
      case 'both': return 'primary';
      default: return 'default';
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchTerm || 
      listing.animalDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.animalDetails?.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filters.category === 'all' || listing.animalDetails?.category === filters.category;
    const matchesType = filters.listingType === 'all' || listing.listingType === filters.listingType;
    const matchesGender = filters.gender === 'all' || listing.animalDetails?.gender === filters.gender;

    // Price range filter
    let matchesPrice = true;
    if (filters.priceRange && filters.priceRange !== 'all') {
      const price = listing.price || 0;
      const [min, max] = filters.priceRange.split('-').map(p => p === '+' ? Infinity : parseInt(p));
      matchesPrice = price >= min && (max === undefined || price <= max);
    }

    return matchesSearch && matchesCategory && matchesType && matchesGender && matchesPrice;
  });

  const renderListingCard = (listing) => {
    const age = calculateAge(listing.animalDetails?.dateOfBirth);
    const photos = listing.photos || [];
    const mainPhoto = photos.length > 0 ? photos[0] : null;
    
    return (
      <Card 
        key={listing._id}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          }
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={mainPhoto || '/api/placeholder/400/200'}
          alt={listing.animalDetails?.name || 'Animal'}
          sx={{ objectFit: 'cover' }}
        />
        
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {listing.animalDetails?.name || 'Unnamed Animal'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {listing.animalDetails?.breed} • {listing.animalDetails?.category}
              </Typography>
            </Box>
            
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, listing)}
            >
              <MoreVert />
            </IconButton>
          </Box>

          {/* Animal Details */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {getGenderIcon(listing.animalDetails?.gender)}
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
              {listing.animalDetails?.gender}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • {age} old
            </Typography>
            {listing.animalDetails?.weight && (
              <Typography variant="body2" color="text.secondary">
                • {listing.animalDetails.weight}kg
              </Typography>
            )}
          </Box>

          {/* Description */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {listing.description?.substring(0, 100)}
            {listing.description?.length > 100 && '...'}
          </Typography>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {listing.location || 'Location not specified'}
            </Typography>
          </Box>

          {/* Tags */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={listing.listingType}
              color={getListingTypeColor(listing.listingType)}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
            
            {listing.animalDetails?.healthStatus && (
              <Chip
                label={`Health: ${listing.animalDetails.healthStatus}`}
                size="small"
                variant="outlined"
                color={listing.animalDetails.healthStatus === 'excellent' ? 'success' : 'default'}
              />
            )}
            
            {listing.verified && (
              <Chip
                label="Verified"
                size="small"
                color="primary"
                icon={<Star />}
              />
            )}
          </Box>

          {/* Price and Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
              ${listing.price?.toLocaleString() || 'Price on request'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" color="error">
                <FavoriteBorder />
              </IconButton>
              <Button
                variant="contained"
                size="small"
                startIcon={<Message />}
                onClick={() => handleInquiry(listing)}
              >
                Inquire
              </Button>
            </Box>
          </Box>

          {/* Seller Info */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                {listing.sellerInfo?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {listing.sellerInfo?.name || 'Unknown Seller'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={listing.sellerInfo?.rating || 0} size="small" readOnly />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    ({listing.sellerInfo?.reviewCount || 0})
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              {format(new Date(listing.createdAt), 'MMM dd')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderInquiriesTab = () => (
    <Box sx={{ mt: 3 }}>
      {inquiries.length > 0 ? (
        inquiries.map((inquiry) => (
          <Card key={inquiry._id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {inquiry.listingTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {inquiry.inquiryType === 'purchase' ? 'Purchase Inquiry' : 'Breeding Request'}
                  </Typography>
                </Box>
                <Chip
                  label={inquiry.status}
                  color={inquiry.status === 'pending' ? 'warning' : inquiry.status === 'responded' ? 'info' : 'success'}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                {inquiry.message}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Sent {format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}
                </Typography>
                <Button size="small" variant="outlined">
                  View Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Message sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Inquiries Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your inquiries to sellers will appear here
          </Typography>
        </Paper>
      )}
    </Box>
  );

  const renderEmptyState = () => (
    <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
      <LocalOffer sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        No Listings Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {searchTerm || Object.values(filters).some(f => f !== 'all') 
          ? 'Try adjusting your search criteria or filters'
          : 'Be the first to list an animal for sale or breeding'
        }
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        size="large"
      >
        Create First Listing
      </Button>
    </Paper>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Animal Marketplace
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Buy, sell, and find breeding partners for your animals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
        >
          Create Listing
        </Button>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
              {stats.totalListings}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Listings
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
              {stats.forSale}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For Sale
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 700 }}>
              {stats.forBreeding}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For Breeding
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
              {stats.totalInquiries}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Inquiries
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Browse Listings" />
          <Tab label="My Inquiries" />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <>
          {/* Search and Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
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
                    <MenuItem value="all">All Animals</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.listingType}
                    label="Type"
                    onChange={(e) => handleFilterChange('listingType', e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="sale">For Sale</MenuItem>
                    <MenuItem value="breeding">For Breeding</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
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
                  <InputLabel>Price Range</InputLabel>
                  <Select
                    value={filters.priceRange}
                    label="Price Range"
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  >
                    <MenuItem value="all">All Prices</MenuItem>
                    {priceRanges.map((range) => (
                      <MenuItem key={range.value} value={range.value}>
                        {range.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    dispatch(setFilters({ 
                      category: 'all', 
                      listingType: 'all', 
                      gender: 'all', 
                      priceRange: 'all', 
                      search: '' 
                    }));
                    setSearchTerm('');
                  }}
                >
                  Clear
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

          {/* Listings Grid */}
          {filteredListings.length > 0 ? (
            <Grid container spacing={3}>
              {filteredListings.map((listing) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={listing._id}>
                  {renderListingCard(listing)}
                </Grid>
              ))}
            </Grid>
          ) : (
            renderEmptyState()
          )}
        </>
      )}

      {currentTab === 1 && renderInquiriesTab()}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleInquiry(selectedListing)}>
          <Message sx={{ mr: 1 }} />
          Send Inquiry
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Share sx={{ mr: 1 }} />
          Share Listing
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
      </Menu>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onClose={() => setInquiryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send Inquiry</DialogTitle>
        <DialogContent>
          {selectedListing && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {selectedListing.animalDetails?.name} - {selectedListing.animalDetails?.breed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Listed by {selectedListing.sellerInfo?.name} for ${selectedListing.price?.toLocaleString()}
              </Typography>
            </Box>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Inquiry Type</InputLabel>
                <Select
                  value={inquiryData.inquiryType}
                  label="Inquiry Type"
                  onChange={(e) => setInquiryData({...inquiryData, inquiryType: e.target.value})}
                >
                  <MenuItem value="purchase">Purchase Inquiry</MenuItem>
                  <MenuItem value="breeding">Breeding Request</MenuItem>
                  <MenuItem value="general">General Question</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Your Phone"
                value={inquiryData.contactPhone}
                onChange={(e) => setInquiryData({...inquiryData, contactPhone: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Your Email"
                type="email"
                value={inquiryData.contactEmail}
                onChange={(e) => setInquiryData({...inquiryData, contactEmail: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={inquiryData.message}
                onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}
                placeholder="Tell the seller about your interest, ask questions, or make an offer..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInquiryDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSendInquiry} 
            variant="contained"
            disabled={!inquiryData.message || !inquiryData.contactPhone}
          >
            Send Inquiry
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="create listing"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default MarketplacePage; 