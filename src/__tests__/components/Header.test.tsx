// Tests for Header component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Header from '../../components/Layout/Header';
import { useAuth } from '../../contexts/AuthContext';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext');
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme();
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render app name and logo', () => {
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
        <Header />
      </TestWrapper>
    );

    expect(screen.getByText('BookReview')).toBeInTheDocument();
    expect(screen.getByLabelText('home')).toBeInTheDocument();
  });

  it('should render login and signup buttons when not authenticated', () => {
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
        <Header />
      </TestWrapper>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should render user menu when authenticated', () => {
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
        <Header />
      </TestWrapper>
    );

    expect(screen.getByText('T')).toBeInTheDocument(); // Avatar with first letter
    expect(screen.getByText('3')).toBeInTheDocument(); // Favorites badge
  });

  it('should render navigation links on desktop', () => {
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
        <Header />
      </TestWrapper>
    );

    expect(screen.getByText('Browse Books')).toBeInTheDocument();
    expect(screen.getByText('Top Rated')).toBeInTheDocument();
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('should handle search form submission', () => {
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
        <Header />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search books, authors...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.submit(searchInput.closest('form')!);

    expect(mockNavigate).toHaveBeenCalledWith('/search?q=test%20query');
  });

  it('should not navigate on empty search', () => {
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
        <Header />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search books, authors...');
    fireEvent.change(searchInput, { target: { value: '   ' } });
    fireEvent.submit(searchInput.closest('form')!);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should open profile menu when avatar is clicked', async () => {
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
        <Header />
      </TestWrapper>
    );

    const avatarButton = screen.getByLabelText('account of current user');
    fireEvent.click(avatarButton);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('My Reviews')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('should handle logout', async () => {
    const mockLogout = jest.fn().mockResolvedValue(undefined);
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
      logout: mockLogout,
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const avatarButton = screen.getByLabelText('account of current user');
    fireEvent.click(avatarButton);

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should handle profile menu navigation', async () => {
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
        <Header />
      </TestWrapper>
    );

    const avatarButton = screen.getByLabelText('account of current user');
    fireEvent.click(avatarButton);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Profile'));

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('should open mobile menu', async () => {
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
        <Header />
      </TestWrapper>
    );

    // Mobile menu button should be present but might not be visible due to CSS
    const mobileMenuButtons = screen.getAllByTestId('MenuIcon');
    expect(mobileMenuButtons.length).toBeGreaterThan(0);
  });

  it('should handle mobile menu navigation', async () => {
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
        <Header />
      </TestWrapper>
    );

    // Find the mobile menu button (the one that's not inside the main navigation)
    const menuButtons = screen.getAllByTestId('MenuIcon');
    const mobileMenuButton = menuButtons[menuButtons.length - 1]; // Last one should be mobile menu
    
    fireEvent.click(mobileMenuButton);

    // Mobile menu items should appear
    await waitFor(() => {
      const browseBooks = screen.getAllByText('Browse Books');
      expect(browseBooks.length).toBeGreaterThan(1); // One in desktop nav, one in mobile menu
    });
  });

  it('should display user avatar with fallback', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      active: true,
      createdAt: '2024-01-01',
      reviewCount: 5,
      favoriteBooksCount: 3,
      avatarUrl: 'https://example.com/avatar.jpg',
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
        <Header />
      </TestWrapper>
    );

    const avatar = screen.getByAltText('Test User');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('should handle logout error gracefully', async () => {
    const mockLogout = jest.fn().mockRejectedValue(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
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
      logout: mockLogout,
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const avatarButton = screen.getByLabelText('account of current user');
    fireEvent.click(avatarButton);

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
