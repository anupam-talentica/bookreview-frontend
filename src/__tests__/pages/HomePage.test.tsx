// Tests for HomePage component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HomePage from '../../pages/HomePage';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import type { Book } from '../../types';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext');
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock API service
jest.mock('../../services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

// Mock RecommendationDashboard component
jest.mock('../../components/RecommendationDashboard', () => {
  return function MockRecommendationDashboard({ limit }: { limit: number }) {
    return <div data-testid="recommendation-dashboard">Recommendations (limit: {limit})</div>;
  };
});

// Mock FavoriteButton component
jest.mock('../../components/FavoriteButton', () => {
  return function MockFavoriteButton({ bookId }: { bookId: number }) {
    return <button data-testid={`favorite-button-${bookId}`}>Favorite</button>;
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

const mockBooks: Book[] = [
  {
    id: 1,
    title: 'Test Book 1',
    author: 'Test Author 1',
    description: 'Test description 1',
    genres: 'Fiction, Drama',
    averageRating: 4.5,
    reviewCount: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    coverImageUrl: 'https://example.com/book1.jpg',
  },
  {
    id: 2,
    title: 'Test Book 2',
    author: 'Test Author 2',
    description: 'Test description 2',
    genres: 'Science Fiction',
    averageRating: 4.2,
    reviewCount: 8,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default API mocks
    mockedApiService.getTopRatedBooks.mockResolvedValue(mockBooks);
    mockedApiService.getPopularBooks.mockResolvedValue(mockBooks);
    mockedApiService.getRecentBooks.mockResolvedValue(mockBooks);
  });

  it('should render hero section for unauthenticated users', () => {
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
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Discover Your Next Great Read')).toBeInTheDocument();
    expect(screen.getByText('Join thousands of book lovers sharing reviews, recommendations, and literary discussions')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Browse Books')).toBeInTheDocument();
  });

  it('should render hero section for authenticated users', () => {
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
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Explore Books')).toBeInTheDocument();
    expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
  });

  it('should show recommendations for authenticated users', () => {
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
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByTestId('recommendation-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Recommendations (limit: 3)')).toBeInTheDocument();
  });

  it('should not show recommendations for unauthenticated users', () => {
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
        <HomePage />
      </TestWrapper>
    );

    expect(screen.queryByTestId('recommendation-dashboard')).not.toBeInTheDocument();
  });

  it('should render book sections', async () => {
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
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Top Rated Books')).toBeInTheDocument();
      expect(screen.getByText('Most Popular')).toBeInTheDocument();
      expect(screen.getByText('Recently Added')).toBeInTheDocument();
    });
  });

  it('should render book cards', async () => {
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
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Test Book 1')).toHaveLength(3); // Appears in all 3 sections
      expect(screen.getAllByText('by Test Author 1')).toHaveLength(3);
      expect(screen.getAllByText('Test Book 2')).toHaveLength(3);
      expect(screen.getAllByText('by Test Author 2')).toHaveLength(3);
    });
  });

  it('should show favorite buttons for authenticated users', async () => {
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
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('favorite-button-1')).toHaveLength(3); // One for each section
      expect(screen.getAllByTestId('favorite-button-2')).toHaveLength(3);
    });
  });

  it('should not show favorite buttons for unauthenticated users', async () => {
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
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('favorite-button-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('favorite-button-2')).not.toBeInTheDocument();
    });
  });

  it('should handle book card click navigation', async () => {
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
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Test Book 1')).toHaveLength(3);
    });

    // Click on the first book card
    fireEvent.click(screen.getAllByText('Test Book 1')[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/books/1');
  });

  it('should handle view book button click', async () => {
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
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByLabelText('View book details')).toHaveLength(6); // 2 books × 3 sections
    });

    // Click on the first view button
    fireEvent.click(screen.getAllByLabelText('View book details')[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/books/1');
  });

  it('should handle hero section button clicks', () => {
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
        <HomePage />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Get Started'));
    expect(mockNavigate).toHaveBeenCalledWith('/register');

    fireEvent.click(screen.getByText('Browse Books'));
    expect(mockNavigate).toHaveBeenCalledWith('/books');
  });

  it('should handle authenticated user hero button click', () => {
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
        <HomePage />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Explore Books'));
    expect(mockNavigate).toHaveBeenCalledWith('/books');
  });

  it('should show loading state for book sections', () => {
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

    // Mock API calls to never resolve to show loading state
    mockedApiService.getTopRatedBooks.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    mockedApiService.getPopularBooks.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    mockedApiService.getRecentBooks.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    // Should show skeleton loaders
    expect(screen.getAllByTestId('skeleton')).toHaveLength(12); // 4 skeletons × 3 sections
  });

  it('should show error state for book sections', async () => {
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

    mockedApiService.getTopRatedBooks.mockRejectedValue(new Error('API Error'));
    mockedApiService.getPopularBooks.mockRejectedValue(new Error('API Error'));
    mockedApiService.getRecentBooks.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load top rated books. Please try again later.')).toBeInTheDocument();
      expect(screen.getByText('Failed to load most popular. Please try again later.')).toBeInTheDocument();
      expect(screen.getByText('Failed to load recently added. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should render statistics section', () => {
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
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Join Our Reading Community')).toBeInTheDocument();
    expect(screen.getByText('10K+')).toBeInTheDocument(); // Books count
    expect(screen.getByText('50K+')).toBeInTheDocument(); // Reviews count
    expect(screen.getByText('5K+')).toBeInTheDocument(); // Readers count
    expect(screen.getByText('4.2')).toBeInTheDocument(); // Average rating
  });

  it('should render features section', () => {
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
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Why Choose BookReview?')).toBeInTheDocument();
    expect(screen.getByText('Smart Discovery')).toBeInTheDocument();
    expect(screen.getByText('Honest Reviews')).toBeInTheDocument();
    expect(screen.getByText('Book Community')).toBeInTheDocument();
  });

  it('should render book cards without cover images', async () => {
    const booksWithoutCovers = mockBooks.map(book => ({ ...book, coverImageUrl: undefined }));
    mockedApiService.getTopRatedBooks.mockResolvedValue(booksWithoutCovers);
    mockedApiService.getPopularBooks.mockResolvedValue(booksWithoutCovers);
    mockedApiService.getRecentBooks.mockResolvedValue(booksWithoutCovers);

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
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText('No Image')).toHaveLength(6); // 2 books × 3 sections
    });
  });

  it('should render genre chips for books', async () => {
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
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Fiction')).toHaveLength(3); // One for each section
      expect(screen.getAllByText('Drama')).toHaveLength(3);
      expect(screen.getAllByText('Science Fiction')).toHaveLength(3);
    });
  });
});
