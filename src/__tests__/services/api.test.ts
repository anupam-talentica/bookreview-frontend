// Tests for API service
import axios from 'axios';
import { apiService } from '../../services/api';
import type { LoginData, RegisterData, Book, Review } from '../../types';

// Mock axios
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  defaults: {
    headers: {
      common: {},
    },
  },
};

mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const loginData: LoginData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        data: {
          token: 'mock-jwt-token',
          userId: 1,
          name: 'Test User',
          email: 'test@example.com',
          type: 'Bearer',
          expiresAt: '2024-01-01T00:00:00Z',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiService.login(loginData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should register successfully', async () => {
      const registerData: RegisterData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        bio: 'Test bio',
      };
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
          data: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            bio: 'Test bio',
            emailVerified: false,
            active: true,
            createdAt: '2024-01-01T00:00:00Z',
            reviewCount: 0,
            favoriteBooksCount: 0,
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiService.register(registerData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should validate token', async () => {
      const mockResponse = {
        data: {
          valid: true,
          userId: 1,
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.validateToken();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/validate');
      expect(result).toEqual(mockResponse.data);
    });

    it('should logout successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: {} });

      await apiService.logout();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('Books', () => {
    it('should get books with pagination', async () => {
      const mockBooks: Book[] = [
        {
          id: 1,
          title: 'Test Book',
          author: 'Test Author',
          description: 'Test description',
          genres: 'Fiction',
          averageRating: 4.5,
          reviewCount: 10,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      const mockResponse = {
        data: {
          content: mockBooks,
          totalElements: 1,
          totalPages: 1,
          currentPage: 0,
          size: 10,
          first: true,
          last: true,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getBooks(0, 10, 'createdAt', 'desc');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/books', {
        params: { page: 0, size: 10, sort: 'createdAt', direction: 'desc' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get book by ID', async () => {
      const mockBook: Book = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test description',
        genres: 'Fiction',
        averageRating: 4.5,
        reviewCount: 10,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      const mockResponse = { data: mockBook };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getBookById(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/books/1');
      expect(result).toEqual(mockBook);
    });

    it('should search books', async () => {
      const mockResponse = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          size: 10,
          first: true,
          last: true,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.searchBooks('test query', 0, 10);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/books/search', {
        params: { query: 'test query', page: 0, size: 10 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should add book to favorites', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Book added to favorites',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiService.addToFavorites(1);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/books/1/favorite');
      expect(result).toEqual(mockResponse.data);
    });

    it('should remove book from favorites', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Book removed from favorites',
        },
      };

      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiService.removeFromFavorites(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/books/1/favorite');
      expect(result).toEqual(mockResponse.data);
    });

    it('should check favorite status', async () => {
      const mockResponse = {
        data: {
          favorited: true,
          bookId: 1,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.checkFavoriteStatus(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/books/1/favorite');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Reviews', () => {
    it('should get book reviews', async () => {
      const mockReviews: Review[] = [
        {
          id: 1,
          rating: 5,
          reviewText: 'Great book!',
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
          },
          book: {
            id: 1,
            title: 'Test Book',
            author: 'Test Author',
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      const mockResponse = {
        data: {
          content: mockReviews,
          totalElements: 1,
          totalPages: 1,
          currentPage: 0,
          size: 10,
          first: true,
          last: true,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getBookReviews(1, 0, 10);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/books/1/reviews', {
        params: { page: 0, size: 10 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should create a review', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Review created successfully',
          data: {
            id: 1,
            rating: 5,
            reviewText: 'Great book!',
            user: {
              id: 1,
              name: 'Test User',
              email: 'test@example.com',
            },
            book: {
              id: 1,
              title: 'Test Book',
              author: 'Test Author',
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiService.createReview(1, 5, 'Great book!');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/books/1/reviews', {
        rating: 5,
        reviewText: 'Great book!',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should update a review', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Review updated successfully',
        },
      };

      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiService.updateReview(1, 4, 'Updated review');

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/reviews/1', {
        rating: 4,
        reviewText: 'Updated review',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should delete a review', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Review deleted successfully',
        },
      };

      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiService.deleteReview(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/reviews/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Recommendations', () => {
    it('should get recommendations', async () => {
      const mockResponse = {
        data: {
          recommendations: [],
          userId: 1,
          count: 0,
          refreshedAt: '2024-01-01T00:00:00Z',
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getRecommendations(10);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/books/recommendations', {
        params: { limit: 10 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get AI recommendations', async () => {
      const mockResponse = {
        data: {
          recommendations: [],
          userId: 1,
          count: 0,
          refreshedAt: '2024-01-01T00:00:00Z',
          aiAvailable: true,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getAIRecommendations(3);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/books/ai-recommendations', {
        params: { limit: 3 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should submit recommendation feedback', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Feedback submitted successfully',
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiService.submitRecommendationFeedback(1, 'like', 'Great recommendation');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/books/recommendations/1/feedback', {
        type: 'like',
        reason: 'Great recommendation',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Token Management', () => {
    it('should set auth token', () => {
      const token = 'test-token';
      apiService.setAuthToken(token);

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });

    it('should clear auth token', () => {
      apiService.clearAuthToken();

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });
});
