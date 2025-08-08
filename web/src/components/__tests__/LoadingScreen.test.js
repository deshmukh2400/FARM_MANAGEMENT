import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme/appleTheme';
import LoadingScreen from '../LoadingScreen';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('LoadingScreen', () => {
  it('renders loading screen with default message', () => {
    renderWithTheme(<LoadingScreen />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders loading screen with custom message', () => {
    const customMessage = 'Loading farm data...';
    renderWithTheme(<LoadingScreen message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders loading screen with custom size', () => {
    renderWithTheme(<LoadingScreen size="large" />);
    
    // Check if the container has the appropriate styling for large size
    const container = screen.getByTestId('loading-container');
    expect(container).toBeInTheDocument();
  });

  it('renders loading screen with progress indicator', () => {
    renderWithTheme(<LoadingScreen showProgress={true} progress={50} />);
    
    // Check if progress indicator is present
    const progressIndicator = screen.getByRole('progressbar');
    expect(progressIndicator).toBeInTheDocument();
  });

  it('applies custom styles when provided', () => {
    const customStyles = { backgroundColor: 'red' };
    renderWithTheme(<LoadingScreen style={customStyles} />);
    
    const container = screen.getByTestId('loading-container');
    expect(container).toHaveStyle('background-color: red');
  });

  it('renders with accessibility attributes', () => {
    renderWithTheme(<LoadingScreen />);
    
    const container = screen.getByTestId('loading-container');
    expect(container).toHaveAttribute('role', 'status');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });

  it('handles loading state changes', () => {
    const { rerender } = renderWithTheme(<LoadingScreen message="Loading..." />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    rerender(
      <ThemeProvider theme={theme}>
        <LoadingScreen message="Almost done..." />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Almost done...')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
}); 