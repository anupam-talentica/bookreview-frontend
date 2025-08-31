// Tests for RecommendationDashboard component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RecommendationDashboard from '../../components/RecommendationDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import type { RecommendationResponse, Recommendation } from '../../types';

// Mock dependencies
jest.mock('../../contexts/AuthContext');
jest.mock('../../services/api');

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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

const mockRecommendations: Recommendation[] = [
  {
    book: {
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
    explanation: 'Recommended because you liked similar fiction books',
    type: 'genre_similarity',
    confidence: 0.85,
    recommendedAt: '2024-01-01T00:00:00Z',
  },
  {
    book: {
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
    explanation: 'Popular among readers with similar tastes',
    type: 'community_favorite',
    confidence: 0.75,
    recommendedAt: '2024-01-01T00:00:00Z',
  },
];

const mockRecommendationResponse: RecommendationResponse = {
  recommendations: mockRecommendations,
  userId: 1,
  count: 2,
  refreshedAt: '2024-01-01T00:00:00Z',
};

const mockAIRecommendationResponse: RecommendationResponse & { aiAvailable: boolean } = {
  ...mockRecommendationResponse,
  aiAvailable: true,
};

describe('RecommendationDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show login message for unauthenticated users', () => {
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
        <RecommendationDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Book Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Please log in to see personalized book recommendations tailored to your reading preferences.')).toBeInTheDocument();
  });

  it('should render recommendations for authenticated users', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockResolvedValue(mockRecommendationResponse);

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Book 1')).toBeInTheDocument();
      expect(screen.getByText('by Test Author 1')).toBeInTheDocument();
      expect(screen.getByText('Test Book 2')).toBeInTheDocument();
      expect(screen.getByText('by Test Author 2')).toBeInTheDocument();
    });
  });

  it('should show tabs for personalized and AI recommendations', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockResolvedValue(mockRecommendationResponse);

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Personalized')).toBeInTheDocument();
    expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
  });

  it('should switch between tabs', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockResolvedValue(mockRecommendationResponse);
    mockedApiService.getAIRecommendations.mockResolvedValue(mockAIRecommendationResponse);

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    // Initially on personalized tab
    await waitFor(() => {
      expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    });

    // Switch to AI tab
    fireEvent.click(screen.getByText('AI Recommendations'));

    await waitFor(() => {
      expect(mockedApiService.getAIRecommendations).toHaveBeenCalled();
    });
  });

  it('should show AI unavailable message when AI is not configured', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockResolvedValue(mockRecommendationResponse);
    mockedApiService.getAIRecommendations.mockResolvedValue({
      ...mockRecommendationResponse,
      aiAvailable: false,
    });

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    // Switch to AI tab
    fireEvent.click(screen.getByText('AI Recommendations'));

    await waitFor(() => {
      expect(screen.getByText('AI Recommendations are not available.')).toBeInTheDocument();
      expect(screen.getByText('Please contact your administrator to configure OpenAI integration to enable AI-powered book recommendations.')).toBeInTheDocument();
    });
  });

  it('should handle refresh button click', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockResolvedValue(mockRecommendationResponse);

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    });

    const refreshButton = screen.getByLabelText('Refresh recommendations');
    fireEvent.click(refreshButton);

    // Should call API again
    await waitFor(() => {
      expect(mockedApiService.getRecommendations).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle book card click navigation', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockResolvedValue(mockRecommendationResponse);

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    });

    // Click on book title
    fireEvent.click(screen.getByText('Test Book 1'));

    expect(mockNavigate).toHaveBeenCalledWith('/books/1');
  });

  it('should handle view book button click', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockResolvedValue(mockRecommendationResponse);

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    });

    // Click on view button
    const viewButtons = screen.getAllByLabelText('View book details');
    fireEvent.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/books/1');
  });

  it('should handle feedback buttons', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockResolvedValue(mockRecommendationResponse);
    mockedApiService.submitRecommendationFeedback.mockResolvedValue({
      success: true,
      message: 'Feedback submitted',
    });

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    });

    // Click like button
    const likeButtons = screen.getAllByLabelText('I like this recommendation');
    fireEvent.click(likeButtons[0]);

    await waitFor(() => {
      expect(mockedApiService.submitRecommendationFeedback).toHaveBeenCalledWith(1, 'like');
    });

    // Click dislike button
    const dislikeButtons = screen.getAllByLabelText('Not interested');
    fireEvent.click(dislikeButtons[0]);

    await waitFor(() => {
      expect(mockedApiService.submitRecommendationFeedback).toHaveBeenCalledWith(1, 'dislike');
    });
  });

  it('should show loading state', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    // Mock API to never resolve
    mockedApiService.getRecommendations.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    // Should show skeleton loaders
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3); // Default limit is 3
  });

  it('should show error state', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load personalized recommendations. Please try again.')).toBeInTheDocument();
    });
  });

  it('should show empty state', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockResolvedValue({
      recommendations: [],
      userId: 1,
      count: 0,
      refreshedAt: '2024-01-01T00:00:00Z',
    });

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No personalized recommendations available right now. Try adding some books to your favorites to get personalized suggestions!')).toBeInTheDocument();
    });
  });

  it('should render without header when showHeader is false', () => {
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
        <RecommendationDashboard showHeader={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('Book Recommendations')).not.toBeInTheDocument();
  });

  it('should display confidence badges', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockResolvedValue(mockRecommendationResponse);

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument(); // First book confidence
      expect(screen.getByText('75%')).toBeInTheDocument(); // Second book confidence
    });
  });

  it('should display recommendation explanations', async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User', email: 'test@example.com', emailVerified: true, active: true, createdAt: '2024-01-01', reviewCount: 5, favoriteBooksCount: 3 },
      token: 'test-token',
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    mockedApiService.getRecommendations.mockResolvedValue(mockRecommendationResponse);

    render(
      <TestWrapper>
        <RecommendationDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Recommended because you liked similar fiction books')).toBeInTheDocument();
      expect(screen.getByText('Popular among readers with similar tastes')).toBeInTheDocument();
    });
  });
});
