import { createTheme } from '@mui/material/styles';

// Apple-inspired color palette
const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
};

// Apple's SF Pro inspired typography
const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"SF Pro Display"',
    '"SF Pro Text"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '3.5rem',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    '@media (max-width:768px)': {
      fontSize: '2.5rem',
    },
  },
  h2: {
    fontSize: '2.75rem',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
    '@media (max-width:768px)': {
      fontSize: '2rem',
    },
  },
  h3: {
    fontSize: '2.25rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    '@media (max-width:768px)': {
      fontSize: '1.75rem',
    },
  },
  h4: {
    fontSize: '1.875rem',
    fontWeight: 600,
    lineHeight: 1.4,
    '@media (max-width:768px)': {
      fontSize: '1.5rem',
    },
  },
  h5: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    fontWeight: 400,
    color: colors.neutral[500],
  },
};

// Apple-inspired component customizations
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        scrollBehavior: 'smooth',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      body: {
        scrollBehavior: 'smooth',
        overflowX: 'hidden',
      },
      '*': {
        boxSizing: 'border-box',
      },
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: colors.neutral[100],
        borderRadius: '4px',
      },
      '*::-webkit-scrollbar-thumb': {
        background: colors.neutral[300],
        borderRadius: '4px',
        '&:hover': {
          background: colors.neutral[400],
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        borderRadius: '12px',
        padding: '10px 24px',
        fontSize: '1rem',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      contained: {
        background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
        boxShadow: '0 4px 14px rgba(14, 165, 233, 0.25)',
        '&:hover': {
          background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
          boxShadow: '0 8px 25px rgba(14, 165, 233, 0.35)',
        },
      },
      outlined: {
        borderWidth: '1.5px',
        borderColor: colors.neutral[300],
        '&:hover': {
          borderWidth: '1.5px',
          borderColor: colors.primary[500],
          backgroundColor: colors.primary[50],
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          borderColor: colors.neutral[300],
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: colors.neutral[50],
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '& fieldset': {
            borderColor: colors.neutral[300],
            borderWidth: '1.5px',
          },
          '&:hover fieldset': {
            borderColor: colors.primary[400],
          },
          '&.Mui-focused fieldset': {
            borderColor: colors.primary[500],
            borderWidth: '2px',
          },
        },
        '& .MuiInputLabel-root': {
          fontWeight: 500,
          '&.Mui-focused': {
            color: colors.primary[600],
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        fontWeight: 500,
        fontSize: '0.875rem',
        height: '32px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      },
      filled: {
        '&.MuiChip-colorPrimary': {
          background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
        },
        '&.MuiChip-colorSuccess': {
          background: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
        },
        '&.MuiChip-colorWarning': {
          background: `linear-gradient(135deg, ${colors.warning[500]} 0%, ${colors.warning[600]} 100%)`,
        },
        '&.MuiChip-colorError': {
          background: `linear-gradient(135deg, ${colors.error[500]} 0%, ${colors.error[600]} 100%)`,
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.neutral[200]}`,
        boxShadow: 'none',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: `1px solid ${colors.neutral[200]}`,
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        margin: '2px 0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: colors.neutral[100],
          transform: 'translateX(4px)',
        },
        '&.Mui-selected': {
          backgroundColor: colors.primary[500],
          color: 'white',
          '&:hover': {
            backgroundColor: colors.primary[600],
            transform: 'translateX(4px)',
          },
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: '12px',
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: '56px',
      },
      indicator: {
        height: '3px',
        borderRadius: '2px',
        background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '1rem',
        minHeight: '56px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          color: colors.primary[600],
        },
        '&.Mui-selected': {
          color: colors.primary[600],
          fontWeight: 600,
        },
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)',
        background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'scale(1.05) translateY(-2px)',
          boxShadow: '0 12px 35px rgba(14, 165, 233, 0.4)',
        },
        '&:active': {
          transform: 'scale(1.02)',
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        border: 'none',
        fontWeight: 500,
      },
      standardSuccess: {
        backgroundColor: colors.success[50],
        color: colors.success[800],
        '& .MuiAlert-icon': {
          color: colors.success[600],
        },
      },
      standardError: {
        backgroundColor: colors.error[50],
        color: colors.error[800],
        '& .MuiAlert-icon': {
          color: colors.error[600],
        },
      },
      standardWarning: {
        backgroundColor: colors.warning[50],
        color: colors.warning[800],
        '& .MuiAlert-icon': {
          color: colors.warning[600],
        },
      },
      standardInfo: {
        backgroundColor: colors.primary[50],
        color: colors.primary[800],
        '& .MuiAlert-icon': {
          color: colors.primary[600],
        },
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: '4px',
        height: '8px',
        backgroundColor: colors.neutral[200],
      },
      bar: {
        borderRadius: '4px',
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
      },
    },
  },
};

// Create the Apple-inspired theme
export const appleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[500],
      light: colors.primary[400],
      dark: colors.primary[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.neutral[600],
      light: colors.neutral[500],
      dark: colors.neutral[700],
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success[500],
      light: colors.success[400],
      dark: colors.success[600],
      contrastText: '#ffffff',
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[400],
      dark: colors.warning[600],
      contrastText: '#ffffff',
    },
    error: {
      main: colors.error[500],
      light: colors.error[400],
      dark: colors.error[600],
      contrastText: '#ffffff',
    },
    info: {
      main: colors.primary[500],
      light: colors.primary[400],
      dark: colors.primary[600],
      contrastText: '#ffffff',
    },
    background: {
      default: colors.neutral[50],
      paper: '#ffffff',
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      disabled: colors.neutral[400],
    },
    divider: colors.neutral[200],
    grey: colors.neutral,
  },
  typography,
  components,
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 1px 6px rgba(0, 0, 0, 0.1)',
    '0 4px 14px rgba(0, 0, 0, 0.1)',
    '0 8px 25px rgba(0, 0, 0, 0.1)',
    '0 12px 35px rgba(0, 0, 0, 0.15)',
    '0 16px 45px rgba(0, 0, 0, 0.15)',
    '0 20px 55px rgba(0, 0, 0, 0.2)',
    '0 25px 65px rgba(0, 0, 0, 0.2)',
    '0 30px 75px rgba(0, 0, 0, 0.25)',
    // Continue with more shadow variations...
    ...Array(15).fill('0 30px 75px rgba(0, 0, 0, 0.25)'),
  ],
});

export default appleTheme; 