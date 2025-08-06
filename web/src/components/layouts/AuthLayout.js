import React from 'react';
import { Box, Container, Paper, Typography, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 450,
  margin: '0 auto',
  marginTop: theme.spacing(8),
  marginBottom: theme.spacing(8),
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  textAlign: 'center',
}));

const BackgroundContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <BackgroundContainer>
      <Container maxWidth="sm">
        <StyledPaper elevation={8}>
          <LogoContainer>
            <img 
              src="/assets/images/logo.svg" 
              alt="Farm Manager" 
              style={{ height: 60, marginBottom: 16 }}
            />
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                textAlign: 'center'
              }}
            >
              Farm Manager
            </Typography>
            {title && (
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  textAlign: 'center'
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ textAlign: 'center', mb: 2 }}
              >
                {subtitle}
              </Typography>
            )}
          </LogoContainer>
          
          {children}
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Farm Manager. All rights reserved.
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Link href="/privacy" variant="body2" sx={{ mr: 2 }}>
                Privacy Policy
              </Link>
              <Link href="/terms" variant="body2">
                Terms of Service
              </Link>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
    </BackgroundContainer>
  );
};

export default AuthLayout; 