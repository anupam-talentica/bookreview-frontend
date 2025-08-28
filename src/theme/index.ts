// Material-UI theme configuration inspired by Talentica's design system

import { createTheme, type ThemeOptions } from '@mui/material/styles';

// Talentica's actual color palette from their website
const colors = {
  primary: {
    main: '#1DD1C1', // Talentica's signature turquoise
    light: '#4EDCD2',
    dark: '#00B4A6',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#1E88E5', // Deep blue from the gradient
    light: '#42A5F5',
    dark: '#1565C0',
    contrastText: '#ffffff',
  },
  accent: {
    main: '#20D4C4', // Bright turquoise accent
    light: '#4DDCD0',
    dark: '#00BFA5',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #1DD1C1 0%, #1E88E5 100%)', // Talentica's signature gradient
    light: 'linear-gradient(135deg, #4EDCD2 0%, #42A5F5 100%)',
    dark: 'linear-gradient(135deg, #00B4A6 0%, #1565C0 100%)',
  },
  text: {
    primary: '#212529', // Dark gray for primary text
    secondary: '#6C757D', // Medium gray for secondary text
    disabled: '#ADB5BD',
  },
  background: {
    default: '#FFFFFF', // Clean white background
    paper: '#FFFFFF',
    grey: '#F8F9FA', // Very light gray for sections
  },
  divider: '#DEE2E6',
  success: {
    main: '#20D4C4', // Using the turquoise accent for success
    light: '#4DDCD0',
    dark: '#00BFA5',
  },
  warning: {
    main: '#FFB74D', // Warm orange that complements the turquoise
    light: '#FFCC80',
    dark: '#FF9800',
  },
  error: {
    main: '#FF5722', // Vibrant red-orange
    light: '#FF8A65',
    dark: '#E64A19',
  },
  info: {
    main: '#1E88E5', // Using the blue from the gradient
    light: '#42A5F5',
    dark: '#1565C0',
  },
  grey: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
};

// Professional typography matching Talentica's clean look
const typography = {
  fontFamily: [
    '"Inter"',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: '#212529',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
    color: '#212529',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
    color: '#212529',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.35,
    color: '#212529',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#212529',
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#212529',
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#6C757D',
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    color: '#6C757D',
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
    color: '#212529',
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#495057',
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none' as const,
    letterSpacing: '0.02em',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.4,
    color: '#6C757D',
  },
};

// Component overrides for professional, clean look
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none' as const,
        fontWeight: 600,
        padding: '12px 32px',
        fontSize: '0.875rem',
        transition: 'all 0.3s ease-in-out',
      },
      contained: {
        background: 'linear-gradient(135deg, #1DD1C1 0%, #1E88E5 100%)',
        boxShadow: '0 4px 15px rgba(29, 209, 193, 0.3)',
        color: '#ffffff',
        '&:hover': {
          background: 'linear-gradient(135deg, #4EDCD2 0%, #42A5F5 100%)',
          boxShadow: '0 6px 20px rgba(29, 209, 193, 0.4)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        // White variant for use on gradient backgrounds
        '&.MuiButton-containedSecondary': {
          background: '#FFFFFF',
          color: '#212529',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            background: '#F8F9FA',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
      },
      outlined: {
        borderWidth: '2px',
        borderColor: '#1DD1C1',
        color: '#1DD1C1',
        '&:hover': {
          borderWidth: '2px',
          backgroundColor: 'rgba(29, 209, 193, 0.08)',
          borderColor: '#1DD1C1',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #E9ECEF',
        '&:hover': {
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease-in-out',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '& fieldset': {
            borderColor: '#DEE2E6',
            borderWidth: '1.5px',
          },
          '&:hover fieldset': {
            borderColor: '#1DD1C1',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#1DD1C1',
            borderWidth: '2px',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#6C757D',
          '&.Mui-focused': {
            color: '#1DD1C1',
          },
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        backgroundImage: 'none',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        background: 'linear-gradient(135deg, #1DD1C1 0%, #1E88E5 100%)',
        boxShadow: '0 4px 20px rgba(29, 209, 193, 0.2)',
        color: '#FFFFFF',
        borderBottom: 'none',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        fontWeight: 500,
        fontSize: '0.75rem',
        '&.MuiChip-colorPrimary': {
          backgroundColor: '#1DD1C1',
          color: '#FFFFFF',
        },
        '&.MuiChip-outlined': {
          borderColor: '#1DD1C1',
          color: '#1DD1C1',
        },
      },
    },
  },
  MuiContainer: {
    styleOverrides: {
      root: {
        paddingLeft: '24px',
        paddingRight: '24px',
        '@media (min-width: 600px)': {
          paddingLeft: '32px',
          paddingRight: '32px',
        },
      },
    },
  },
  MuiTypography: {
    styleOverrides: {
      root: {
        '&.MuiTypography-h1, &.MuiTypography-h2, &.MuiTypography-h3, &.MuiTypography-h4, &.MuiTypography-h5, &.MuiTypography-h6': {
          fontWeight: 600,
        },
      },
    },
  },
  MuiRating: {
    styleOverrides: {
      root: {
        color: '#FFC107',
      },
    },
  },
  // Custom Box styling for Talentica-style sections
  MuiBox: {
    styleOverrides: {
      root: {
        '&.section-spacing': {
          padding: '80px 0',
        },
        '&.hero-section': {
          background: 'linear-gradient(135deg, #1DD1C1 0%, #1E88E5 100%)',
          color: '#FFFFFF',
        },
        '&.gradient-section': {
          background: 'linear-gradient(135deg, #1DD1C1 0%, #1E88E5 100%)',
          color: '#FFFFFF',
        },
        '&.feature-section': {
          backgroundColor: '#F8F9FA',
        },
      },
    },
  },
};

// Theme configuration with Talentica-inspired design
const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrastText,
    },
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    background: colors.background,
    text: colors.text,
    divider: colors.divider,
    grey: colors.grey,
  },
  typography,
  components,
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
};

// Create the main theme
const theme = createTheme(themeOptions);

// Dark theme variant (keeping for future use)
export const darkTheme = createTheme({
  ...themeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#4FC3F7',
      light: '#B3E5FC',
      dark: '#0288D1',
    },
    secondary: {
      main: '#424242',
      light: '#616161',
      dark: '#212121',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
});

export default theme;