import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import AuthLayout from '../components/layouts/AuthLayout';
import DashboardLayout from '../components/layouts/DashboardLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Dashboard Pages
import DashboardPage from '../pages/dashboard/DashboardPage';

// Animal Pages
import AnimalsPage from '../pages/animals/AnimalsPage';
import AnimalDetailPage from '../pages/animals/AnimalDetailPage';
import AddAnimalPage from '../pages/animals/AddAnimalPage';
import EditAnimalPage from '../pages/animals/EditAnimalPage';

// Schedule Pages
import SchedulesPage from '../pages/schedules/SchedulesPage';

// Inventory Pages
import InventoryPage from '../pages/inventory/InventoryPage';

// Marketplace Pages
import MarketplacePage from '../pages/marketplace/MarketplacePage';

// Profile Pages
import ProfilePage from '../pages/profile/ProfilePage';

// Loading Screen
import LoadingScreen from '../components/LoadingScreen';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Handle root route based on authentication state
  const RootRoute = () => {
    if (isLoading) {
      return <LoadingScreen />;
    }
    
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<RootRoute />} />

      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        </PublicRoute>
      } />
      
      <Route path="/forgot-password" element={
        <PublicRoute>
          <AuthLayout>
            <ForgotPasswordPage />
          </AuthLayout>
        </PublicRoute>
      } />
      
      <Route path="/reset-password/:token" element={
        <PublicRoute>
          <AuthLayout>
            <ResetPasswordPage />
          </AuthLayout>
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Animal Management Routes */}
      <Route path="/animals" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AnimalsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/animals/add" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AddAnimalPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/animals/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AnimalDetailPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/animals/:id/edit" element={
        <ProtectedRoute>
          <DashboardLayout>
            <EditAnimalPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Schedule Management Routes */}
      <Route path="/schedules" element={
        <ProtectedRoute>
          <DashboardLayout>
            <SchedulesPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Inventory Management Routes */}
      <Route path="/inventory" element={
        <ProtectedRoute>
          <DashboardLayout>
            <InventoryPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Marketplace Routes */}
      <Route path="/marketplace" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MarketplacePage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Profile Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProfilePage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Default Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes; 