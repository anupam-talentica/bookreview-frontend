// Tests for FavoriteButton component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FavoriteButton from '../../components/FavoriteButton';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

// Mock dependencies
jest.mock('../../contexts/AuthContext');
jest.mock('../../services/api');

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('FavoriteButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when user is not authenticated', () => {
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
        <FavoriteButton bookId={1} />
      </TestWrapper>
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render button variant when authenticated', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 0, favoriteBooksCount: 0 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.checkFavoriteStatus.mockResolvedValue({
      favorited: false,
      bookId: 1,
    });

    render(
      <TestWrapper>
        <FavoriteButton bookId={1} variant="button" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
    });
  });

  it('should render icon variant when authenticated', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 0, favoriteBooksCount: 0 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.checkFavoriteStatus.mockResolvedValue({
      favorited: false,
      bookId: 1,
    });

    render(
      <TestWrapper>
        <FavoriteButton bookId={1} variant="icon" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByTestId('FavoriteBorderIcon')).toBeInTheDocument();
    });
  });

  it('should show favorited state correctly', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 0, favoriteBooksCount: 0 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.checkFavoriteStatus.mockResolvedValue({
      favorited: true,
      bookId: 1,
    });

    render(
      <TestWrapper>
        <FavoriteButton bookId={1} variant="button" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Remove from Favorites')).toBeInTheDocument();
      expect(screen.getByTestId('FavoriteIcon')).toBeInTheDocument();
    });
  });

  it('should handle add to favorites', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 0, favoriteBooksCount: 0 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.checkFavoriteStatus.mockResolvedValue({
      favorited: false,
      bookId: 1,
    });

    mockedApiService.addToFavorites.mockResolvedValue({
      success: true,
      message: 'Added to favorites',
    });

    render(
      <TestWrapper>
        <FavoriteButton bookId={1} variant="button" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockedApiService.addToFavorites).toHaveBeenCalledWith(1);
    });
  });

  it('should handle remove from favorites', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 0, favoriteBooksCount: 0 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.checkFavoriteStatus.mockResolvedValue({
      favorited: true,
      bookId: 1,
    });

    mockedApiService.removeFromFavorites.mockResolvedValue({
      success: true,
      message: 'Removed from favorites',
    });

    render(
      <TestWrapper>
        <FavoriteButton bookId={1} variant="button" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Remove from Favorites')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockedApiService.removeFromFavorites).toHaveBeenCalledWith(1);
    });
  });

  it('should show loading state', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 0, favoriteBooksCount: 0 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    // Mock a delayed response to show loading state
    mockedApiService.checkFavoriteStatus.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ favorited: false, bookId: 1 }), 100))
    );

    render(
      <TestWrapper>
        <FavoriteButton bookId={1} variant="button" />
      </TestWrapper>
    );

    // Should show loading initially
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should stop propagation on click', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 0, favoriteBooksCount: 0 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.checkFavoriteStatus.mockResolvedValue({
      favorited: false,
      bookId: 1,
    });

    const parentClickHandler = jest.fn();

    render(
      <TestWrapper>
        <div onClick={parentClickHandler}>
          <FavoriteButton bookId={1} variant="button" />
        </div>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it('should handle different sizes', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 0, favoriteBooksCount: 0 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.checkFavoriteStatus.mockResolvedValue({
      favorited: false,
      bookId: 1,
    });

    const { rerender } = render(
      <TestWrapper>
        <FavoriteButton bookId={1} size="small" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    rerender(
      <TestWrapper>
        <FavoriteButton bookId={1} size="large" />
      </TestWrapper>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle showText prop', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 0, favoriteBooksCount: 0 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.checkFavoriteStatus.mockResolvedValue({
      favorited: false,
      bookId: 1,
    });

    render(
      <TestWrapper>
        <FavoriteButton bookId={1} showText={false} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.queryByText('Add to Favorites')).not.toBeInTheDocument();
    });
  });
});
