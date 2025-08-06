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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Paper,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Warning,
  Inventory,
  LocalPharmacy,
  Grass,
  Build,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Refresh,
  Notifications,
  CalendarToday,
  AttachMoney,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, setFilters } from '../../store/slices/inventorySlice';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const InventoryPage = () => {
  const dispatch = useDispatch();
  const { inventory, isLoading, error, filters, stats } = useSelector((state) => state.inventory);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    supplier: '',
    expiryDate: null,
    minimumStock: '',
    description: '',
  });

  const categories = [
    { value: 'medicine', label: 'Medicine', icon: <LocalPharmacy />, color: 'error' },
    { value: 'feed', label: 'Feed & Fodder', icon: <Grass />, color: 'success' },
    { value: 'equipment', label: 'Equipment', icon: <Build />, color: 'info' },
    { value: 'supplies', label: 'Supplies', icon: <ShoppingCart />, color: 'warning' },
  ];

  const units = ['kg', 'lbs', 'liters', 'gallons', 'pieces', 'boxes', 'bags', 'bottles'];

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    dispatch(setFilters({ search: value }));
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleAddItem = async () => {
    try {
      await dispatch(addInventoryItem(formData)).unwrap();
      setAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add inventory item:', error);
    }
  };

  const handleEditItem = async () => {
    try {
      await dispatch(updateInventoryItem({ 
        itemId: selectedItem._id, 
        itemData: formData 
      })).unwrap();
      setEditDialogOpen(false);
      resetForm();
      handleMenuClose();
    } catch (error) {
      console.error('Failed to update inventory item:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (selectedItem && window.confirm('Are you sure you want to delete this item?')) {
      try {
        await dispatch(deleteInventoryItem(selectedItem._id)).unwrap();
        handleMenuClose();
      } catch (error) {
        console.error('Failed to delete inventory item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit: '',
      unitPrice: '',
      supplier: '',
      expiryDate: null,
      minimumStock: '',
      description: '',
    });
  };

  const openEditDialog = () => {
    if (selectedItem) {
      setFormData({
        name: selectedItem.name || '',
        category: selectedItem.category || '',
        quantity: selectedItem.quantity || '',
        unit: selectedItem.unit || '',
        unitPrice: selectedItem.unitPrice || '',
        supplier: selectedItem.supplier || '',
        expiryDate: selectedItem.expiryDate ? new Date(selectedItem.expiryDate) : null,
        minimumStock: selectedItem.minimumStock || '',
        description: selectedItem.description || '',
      });
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : <Inventory />;
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'default';
  };

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return { label: 'Out of Stock', color: 'error', severity: 'error' };
    if (item.quantity <= item.minimumStock) return { label: 'Low Stock', color: 'warning', severity: 'warning' };
    return { label: 'In Stock', color: 'success', severity: 'success' };
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { label: 'Expired', color: 'error', severity: 'error' };
    if (daysUntilExpiry <= 7) return { label: 'Expires Soon', color: 'warning', severity: 'warning' };
    if (daysUntilExpiry <= 30) return { label: 'Expires This Month', color: 'info', severity: 'info' };
    return null;
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filters.category === 'all' || item.category === filters.category;
    
    const stockStatus = getStockStatus(item);
    const matchesStock = filters.stock === 'all' || 
      (filters.stock === 'low' && stockStatus.severity === 'warning') ||
      (filters.stock === 'out' && stockStatus.severity === 'error') ||
      (filters.stock === 'available' && stockStatus.severity === 'success');

    return matchesSearch && matchesCategory && matchesStock;
  });

  const renderInventoryCard = (item) => {
    const stockStatus = getStockStatus(item);
    const expiryStatus = getExpiryStatus(item.expiryDate);
    const totalValue = item.quantity * (item.unitPrice || 0);
    
    return (
      <Card 
        key={item._id}
        sx={{ 
          mb: 2,
          border: stockStatus.severity === 'error' ? '2px solid' : '1px solid',
          borderColor: stockStatus.severity === 'error' ? 'error.main' : 'divider',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: `${getCategoryColor(item.category)}.main`,
                  mr: 2 
                }}
              >
                {getCategoryIcon(item.category)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description || 'No description'}
                </Typography>
                {item.supplier && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Supplier: {item.supplier}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={stockStatus.label}
                color={stockStatus.color}
                size="small"
                variant="outlined"
              />
              
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, item)}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          {/* Stock Information */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Current Stock
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {item.quantity} {item.unit}
              </Typography>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Min. Stock
              </Typography>
              <Typography variant="body1">
                {item.minimumStock} {item.unit}
              </Typography>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Unit Price
              </Typography>
              <Typography variant="body1">
                ${item.unitPrice?.toFixed(2) || '0.00'}
              </Typography>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                ${totalValue.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>

          {/* Stock Level Progress */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Stock Level
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round((item.quantity / Math.max(item.minimumStock * 2, item.quantity)) * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min((item.quantity / Math.max(item.minimumStock * 2, item.quantity)) * 100, 100)}
              color={stockStatus.color}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Alerts */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={item.category}
              color={getCategoryColor(item.category)}
              size="small"
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
            
            {expiryStatus && (
              <Chip
                label={expiryStatus.label}
                color={expiryStatus.color}
                size="small"
                variant="outlined"
                icon={<Warning />}
              />
            )}
            
            {item.expiryDate && (
              <Chip
                label={`Expires: ${format(new Date(item.expiryDate), 'MMM dd, yyyy')}`}
                size="small"
                variant="outlined"
                icon={<CalendarToday />}
              />
            )}
          </Box>

          {/* Expiry Alert */}
          {expiryStatus && expiryStatus.severity === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              This item has expired and should not be used!
            </Alert>
          )}
          
          {expiryStatus && expiryStatus.severity === 'warning' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This item expires soon. Use or replace immediately.
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
      <Inventory sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        No Inventory Items Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {searchTerm || Object.values(filters).some(f => f !== 'all') 
          ? 'Try adjusting your search criteria or filters'
          : 'Start by adding your first inventory item'
        }
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        size="large"
        onClick={() => setAddDialogOpen(true)}
      >
        Add First Item
      </Button>
    </Paper>
  );

  const renderFormDialog = (isEdit = false) => (
    <Dialog 
      open={isEdit ? editDialogOpen : addDialogOpen} 
      onClose={() => isEdit ? setEditDialogOpen(false) : setAddDialogOpen(false)}
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>{isEdit ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Item Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.category}
                label="Category *"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {cat.icon}
                      <Typography sx={{ ml: 1 }}>{cat.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Quantity *"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Unit *</InputLabel>
              <Select
                value={formData.unit}
                label="Unit *"
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              >
                {units.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Unit Price"
              type="number"
              value={formData.unitPrice}
              onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minimum Stock Level"
              type="number"
              value={formData.minimumStock}
              onChange={(e) => setFormData({...formData, minimumStock: e.target.value})}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Expiry Date"
                value={formData.expiryDate}
                onChange={(date) => setFormData({...formData, expiryDate: date})}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => isEdit ? setEditDialogOpen(false) : setAddDialogOpen(false)}>
          Cancel
        </Button>
        <Button 
          onClick={isEdit ? handleEditItem : handleAddItem} 
          variant="contained"
          disabled={!formData.name || !formData.category || !formData.quantity || !formData.unit}
        >
          {isEdit ? 'Update Item' : 'Add Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Inventory Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track medicine, feed, equipment, and supplies
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          onClick={() => setAddDialogOpen(true)}
        >
          Add Item
        </Button>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Items
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
              {stats.lowStock}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Low Stock
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
              {stats.outOfStock}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Out of Stock
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
              ${stats.totalValue?.toFixed(2) || '0.00'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Value
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
              placeholder="Search inventory..."
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
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={filters.stock}
                label="Stock Status"
                onChange={(e) => handleFilterChange('stock', e.target.value)}
              >
                <MenuItem value="all">All Stock</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="low">Low Stock</MenuItem>
                <MenuItem value="out">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                dispatch(setFilters({ category: 'all', stock: 'all', search: '' }));
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
      <Box>
        {filteredInventory.length > 0 ? (
          filteredInventory.map(renderInventoryCard)
        ) : (
          renderEmptyState()
        )}
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={openEditDialog}>
          <Edit sx={{ mr: 1 }} />
          Edit Item
        </MenuItem>
        <MenuItem onClick={handleDeleteItem} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Item
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialogs */}
      {renderFormDialog(false)}
      {renderFormDialog(true)}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add inventory"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setAddDialogOpen(true)}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default InventoryPage; 