// Tests for main App component
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from '../App';
import { useAuth } from '../contexts/AuthContext';

// Mock AuthContext
jest.mock('../contexts/AuthContext');
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock all page components to avoid complex dependencies
jest.mock('../pages/HomePage', () => {
  return function MockHomePage() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('../pages/Auth/LoginPage', () => {
  return function MockLoginPage() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('../pages/Auth/RegisterPage', () => {
  return function MockRegisterPage() {
    return <div data-testid="register-page">Register Page</div>;
  };
});

jest.mock('../pages/BooksPage', () => {
  return function MockBooksPage() {
    return <div data-testid="books-page">Books Page</div>;
  };
});

jest.mock('../pages/BookDetailsPage', () => {
  return function MockBookDetailsPage() {
    return <div data-testid="book-details-page">Book Details Page</div>;
  };
});

jest.mock('../pages/ProfilePage', () => {
  return function MockProfilePage() {
    return <div data-testid="profile-page">Profile Page</div>;
  };
});

jest.mock('../pages/FavoritesPage', () => {
  return function MockFavoritesPage() {
    return <div data-testid="favorites-page">Favorites Page</div>;
  };
});

jest.mock('../pages/MyReviewsPage', () => {
  return function MockMyReviewsPage() {
    return <div data-testid="my-reviews-page">My Reviews Page</div>;
  };
});

jest.mock('../pages/SearchPage', () => {
  return function MockSearchPage() {
    return <div data-testid="search-page">Search Page</div>;
  };
});

jest.mock('../pages/NotFoundPage', () => {
  return function MockNotFoundPage() {
    return <div data-testid="not-found-page">Not Found Page</div>;
  };
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const theme = createTheme();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Should render the home page by default
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('should show loading state when auth is loading', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: true,
    });

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Should show loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render authenticated routes when user is logged in', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      active: true,
      createdAt: '2024-01-01',
      reviewCount: 5,
      favoriteBooksCount: 3,
    };

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Should still render home page, but now with authenticated context
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('should handle theme configuration', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    const { container } = render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Should have theme applied (check for MUI theme classes)
    expect(container.firstChild).toHaveClass('MuiBox-root');
  });

  it('should provide query client context', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    // This test ensures that QueryClient is properly provided
    // If it wasn't, the component would throw an error
    expect(() => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('should handle routing correctly', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    // Test that router is properly configured
    expect(() => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );
    }).not.toThrow();

    // Should render home page at root path
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
