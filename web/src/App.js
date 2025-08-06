import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { store, persistor } from './store';
import AppRoutes from './routes/AppRoutes';
import LoadingScreen from './components/LoadingScreen';
import appleTheme from './theme/appleTheme';

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});

// Global styles for cross-browser compatibility
const globalStyles = (
  <GlobalStyles
    styles={{
      // Reset and normalize
      '*, *::before, *::after': {
        boxSizing: 'border-box',
      },
      html: {
        height: '100%',
        scrollBehavior: 'smooth',
        // Font smoothing for better text rendering
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        // Prevent horizontal scrolling on mobile
        overflowX: 'hidden',
      },
      body: {
        height: '100%',
        margin: 0,
        padding: 0,
        fontFamily: appleTheme.typography.fontFamily,
        // Prevent text size adjust on iOS
        WebkitTextSizeAdjust: '100%',
        // Prevent tap highlight on mobile
        WebkitTapHighlightColor: 'transparent',
        // Better scrolling on iOS
        WebkitOverflowScrolling: 'touch',
      },
      '#root': {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
      // Custom scrollbar styles
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '4px',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#c1c1c1',
        borderRadius: '4px',
        transition: 'background 0.2s ease',
        '&:hover': {
          background: '#a1a1a1',
        },
      },
      // Firefox scrollbar
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: '#c1c1c1 #f1f1f1',
      },
      // Focus styles for accessibility
      'button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible': {
        outline: `2px solid ${appleTheme.palette.primary.main}`,
        outlineOffset: '2px',
      },
      // Image optimization
      img: {
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
      },
      // Better link styles
      'a': {
        color: appleTheme.palette.primary.main,
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        '&:hover': {
          textDecoration: 'underline',
        },
      },
      // Smooth transitions for theme changes
      '*, *::before, *::after': {
        transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
      },
      // Prevent FOUC (Flash of Unstyled Content)
      '.fade-in': {
        opacity: 0,
        animation: 'fadeIn 0.5s ease forwards',
      },
      '@keyframes fadeIn': {
        to: {
          opacity: 1,
        },
      },
      // Safari-specific fixes
      '@supports (-webkit-appearance: none)': {
        'input[type="search"]': {
          WebkitAppearance: 'none',
        },
      },
      // High DPI display optimizations
      '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)': {
        body: {
          fontWeight: '300',
        },
      },
      // Dark mode support (for future implementation)
      '@media (prefers-color-scheme: dark)': {
        ':root': {
          colorScheme: 'dark',
        },
      },
      // Reduced motion support
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
        },
      },
      // Print styles
      '@media print': {
        '*': {
          background: 'transparent !important',
          color: 'black !important',
          boxShadow: 'none !important',
          textShadow: 'none !important',
        },
        'a, a:visited': {
          textDecoration: 'underline',
        },
        'a[href]:after': {
          content: '" (" attr(href) ")"',
        },
        'abbr[title]:after': {
          content: '" (" attr(title) ")"',
        },
        'pre, blockquote': {
          border: '1px solid #999',
          pageBreakInside: 'avoid',
        },
        'thead': {
          display: 'table-header-group',
        },
        'tr, img': {
          pageBreakInside: 'avoid',
        },
        'img': {
          maxWidth: '100% !important',
        },
        'p, h2, h3': {
          orphans: 3,
          widows: 3,
        },
        'h2, h3': {
          pageBreakAfter: 'avoid',
        },
      },
    }}
  />
);

// Error boundary for better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          fontFamily: appleTheme.typography.fontFamily,
        }}>
          <h1>Something went wrong</h1>
          <p>We're sorry, but something went wrong. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: appleTheme.palette.primary.main,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Add viewport meta tag for better mobile experience
  React.useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Provider store={store}>
          <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider theme={appleTheme}>
                <CssBaseline />
                {globalStyles}
                <Router>
                  <div className="fade-in">
                    <AppRoutes />
                  </div>
                  {/* Toast notifications with Apple-style positioning */}
                  <Toaster
                    position="top-center"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px',
                        color: appleTheme.palette.text.primary,
                        fontFamily: appleTheme.typography.fontFamily,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      },
                      success: {
                        iconTheme: {
                          primary: appleTheme.palette.success.main,
                          secondary: '#ffffff',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: appleTheme.palette.error.main,
                          secondary: '#ffffff',
                        },
                      },
                    }}
                  />
                </Router>
              </ThemeProvider>
            </QueryClientProvider>
          </PersistGate>
        </Provider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App; 