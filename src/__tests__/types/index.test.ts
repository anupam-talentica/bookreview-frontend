// Tests for TypeScript type definitions
import type {
  User,
  Book,
  Review,
  AuthContextType,
  LoginData,
  RegisterData,
  JwtResponse,
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
  BookFormData,
  ReviewFormData,
  ProfileUpdateData,
  PasswordChangeData,
  UserStatistics,
  Recommendation,
  RecommendationResponse,
  RecommendationFeedback,
} from '../../types';

describe('Type Definitions', () => {
  describe('User type', () => {
    it('should have correct structure', () => {
      const user: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        avatarUrl: 'https://example.com/avatar.jpg',
        emailVerified: true,
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        reviewCount: 5,
        favoriteBooksCount: 3,
      };

      expect(typeof user.id).toBe('number');
      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.emailVerified).toBe('boolean');
      expect(typeof user.active).toBe('boolean');
      expect(typeof user.createdAt).toBe('string');
      expect(typeof user.reviewCount).toBe('number');
      expect(typeof user.favoriteBooksCount).toBe('number');
    });

    it('should allow optional fields', () => {
      const minimalUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        reviewCount: 0,
        favoriteBooksCount: 0,
      };

      expect(minimalUser.bio).toBeUndefined();
      expect(minimalUser.avatarUrl).toBeUndefined();
    });
  });

  describe('Book type', () => {
    it('should have correct structure', () => {
      const book: Book = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test description',
        coverImageUrl: 'https://example.com/cover.jpg',
        genres: 'Fiction, Drama',
        publishedYear: 2024,
        averageRating: 4.5,
        reviewCount: 10,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        isbn: '978-0123456789',
        publisher: 'Test Publisher',
        pageCount: 300,
        language: 'English',
      };

      expect(typeof book.id).toBe('number');
      expect(typeof book.title).toBe('string');
      expect(typeof book.author).toBe('string');
      expect(typeof book.genres).toBe('string');
      expect(typeof book.averageRating).toBe('number');
      expect(typeof book.reviewCount).toBe('number');
      expect(typeof book.createdAt).toBe('string');
      expect(typeof book.updatedAt).toBe('string');
    });
  });

  describe('Review type', () => {
    it('should have correct structure', () => {
      const review: Review = {
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
      };

      expect(typeof review.id).toBe('number');
      expect(typeof review.rating).toBe('number');
      expect(typeof review.reviewText).toBe('string');
      expect(typeof review.user).toBe('object');
      expect(typeof review.book).toBe('object');
      expect(typeof review.createdAt).toBe('string');
      expect(typeof review.updatedAt).toBe('string');
    });
  });

  describe('AuthContextType', () => {
    it('should have correct function signatures', () => {
      const mockAuthContext: AuthContextType = {
        user: null,
        token: null,
        login: async (email: string, password: string) => {},
        register: async (userData: RegisterData) => {},
        logout: () => {},
        updateProfile: async (profileData: ProfileUpdateData) => {},
        changePassword: async (passwordData: PasswordChangeData) => {},
        refreshProfile: async () => {},
        loading: false,
        isAuthenticated: false,
      };

      expect(typeof mockAuthContext.login).toBe('function');
      expect(typeof mockAuthContext.register).toBe('function');
      expect(typeof mockAuthContext.logout).toBe('function');
      expect(typeof mockAuthContext.updateProfile).toBe('function');
      expect(typeof mockAuthContext.changePassword).toBe('function');
      expect(typeof mockAuthContext.refreshProfile).toBe('function');
      expect(typeof mockAuthContext.loading).toBe('boolean');
      expect(typeof mockAuthContext.isAuthenticated).toBe('boolean');
    });
  });

  describe('LoginData type', () => {
    it('should have correct structure', () => {
      const loginData: LoginData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };

      expect(typeof loginData.email).toBe('string');
      expect(typeof loginData.password).toBe('string');
      expect(typeof loginData.rememberMe).toBe('boolean');
    });

    it('should allow optional rememberMe', () => {
      const minimalLoginData: LoginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(minimalLoginData.rememberMe).toBeUndefined();
    });
  });

  describe('RegisterData type', () => {
    it('should have correct structure', () => {
      const registerData: RegisterData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        bio: 'Test bio',
      };

      expect(typeof registerData.name).toBe('string');
      expect(typeof registerData.email).toBe('string');
      expect(typeof registerData.password).toBe('string');
      expect(typeof registerData.bio).toBe('string');
    });
  });

  describe('JwtResponse type', () => {
    it('should have correct structure', () => {
      const jwtResponse: JwtResponse = {
        token: 'jwt-token',
        type: 'Bearer',
        userId: 1,
        name: 'Test User',
        email: 'test@example.com',
        expiresAt: '2024-12-31T23:59:59Z',
      };

      expect(typeof jwtResponse.token).toBe('string');
      expect(typeof jwtResponse.type).toBe('string');
      expect(typeof jwtResponse.userId).toBe('number');
      expect(typeof jwtResponse.name).toBe('string');
      expect(typeof jwtResponse.email).toBe('string');
      expect(typeof jwtResponse.expiresAt).toBe('string');
    });
  });

  describe('ApiResponse type', () => {
    it('should have correct generic structure', () => {
      const apiResponse: ApiResponse<User> = {
        success: true,
        message: 'Success',
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          emailVerified: true,
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          reviewCount: 0,
          favoriteBooksCount: 0,
        },
      };

      expect(typeof apiResponse.success).toBe('boolean');
      expect(typeof apiResponse.message).toBe('string');
      expect(typeof apiResponse.data).toBe('object');
    });
  });

  describe('PaginatedResponse type', () => {
    it('should have correct generic structure', () => {
      const paginatedResponse: PaginatedResponse<Book> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: 10,
        first: true,
        last: true,
      };

      expect(Array.isArray(paginatedResponse.content)).toBe(true);
      expect(typeof paginatedResponse.totalElements).toBe('number');
      expect(typeof paginatedResponse.totalPages).toBe('number');
      expect(typeof paginatedResponse.currentPage).toBe('number');
      expect(typeof paginatedResponse.size).toBe('number');
      expect(typeof paginatedResponse.first).toBe('boolean');
      expect(typeof paginatedResponse.last).toBe('boolean');
    });
  });

  describe('SearchFilters type', () => {
    it('should have correct structure with all optional fields', () => {
      const searchFilters: SearchFilters = {
        query: 'test query',
        minRating: 4,
        genres: ['Fiction', 'Drama'],
        publishedYear: {
          from: 2020,
          to: 2024,
        },
        sortBy: 'rating',
        sortOrder: 'desc',
      };

      expect(typeof searchFilters.query).toBe('string');
      expect(typeof searchFilters.minRating).toBe('number');
      expect(Array.isArray(searchFilters.genres)).toBe(true);
      expect(typeof searchFilters.publishedYear).toBe('object');
      expect(typeof searchFilters.sortBy).toBe('string');
      expect(typeof searchFilters.sortOrder).toBe('string');
    });

    it('should allow empty filters', () => {
      const emptyFilters: SearchFilters = {};
      expect(Object.keys(emptyFilters)).toHaveLength(0);
    });
  });

  describe('Recommendation type', () => {
    it('should have correct structure', () => {
      const recommendation: Recommendation = {
        book: {
          id: 1,
          title: 'Test Book',
          author: 'Test Author',
          genres: 'Fiction',
          averageRating: 4.5,
          reviewCount: 10,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        explanation: 'Recommended because you liked similar books',
        type: 'genre_similarity',
        confidence: 0.85,
        recommendedAt: '2024-01-01T00:00:00Z',
      };

      expect(typeof recommendation.book).toBe('object');
      expect(typeof recommendation.explanation).toBe('string');
      expect(typeof recommendation.type).toBe('string');
      expect(typeof recommendation.confidence).toBe('number');
      expect(typeof recommendation.recommendedAt).toBe('string');
    });

    it('should enforce recommendation type values', () => {
      const validTypes = [
        'genre_similarity',
        'community_favorite',
        'genre_trending',
        'author_recommendation',
        'user_favorite',
        'ai_recommendation'
      ];

      validTypes.forEach(type => {
        const recommendation: Recommendation = {
          book: {
            id: 1,
            title: 'Test Book',
            author: 'Test Author',
            genres: 'Fiction',
            averageRating: 4.5,
            reviewCount: 10,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          explanation: 'Test explanation',
          type: type as any,
          confidence: 0.85,
          recommendedAt: '2024-01-01T00:00:00Z',
        };

        expect(recommendation.type).toBe(type);
      });
    });
  });

  describe('RecommendationFeedback type', () => {
    it('should have correct structure', () => {
      const feedback: RecommendationFeedback = {
        type: 'like',
        reason: 'Great recommendation',
        recommendationId: 1,
      };

      expect(typeof feedback.type).toBe('string');
      expect(typeof feedback.reason).toBe('string');
      expect(typeof feedback.recommendationId).toBe('number');
    });

    it('should enforce feedback type values', () => {
      const likeFeedback: RecommendationFeedback = {
        type: 'like',
        recommendationId: 1,
      };

      const dislikeFeedback: RecommendationFeedback = {
        type: 'dislike',
        recommendationId: 1,
      };

      expect(likeFeedback.type).toBe('like');
      expect(dislikeFeedback.type).toBe('dislike');
    });
  });

  describe('Form Data types', () => {
    it('should have correct BookFormData structure', () => {
      const bookFormData: BookFormData = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test description',
        genres: 'Fiction',
        publishedYear: 2024,
        coverImageUrl: 'https://example.com/cover.jpg',
      };

      expect(typeof bookFormData.title).toBe('string');
      expect(typeof bookFormData.author).toBe('string');
      expect(typeof bookFormData.description).toBe('string');
      expect(typeof bookFormData.genres).toBe('string');
      expect(typeof bookFormData.publishedYear).toBe('number');
      expect(typeof bookFormData.coverImageUrl).toBe('string');
    });

    it('should have correct ReviewFormData structure', () => {
      const reviewFormData: ReviewFormData = {
        rating: 5,
        reviewText: 'Great book!',
      };

      expect(typeof reviewFormData.rating).toBe('number');
      expect(typeof reviewFormData.reviewText).toBe('string');
    });

    it('should have correct PasswordChangeData structure', () => {
      const passwordChangeData: PasswordChangeData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      };

      expect(typeof passwordChangeData.currentPassword).toBe('string');
      expect(typeof passwordChangeData.newPassword).toBe('string');
      expect(typeof passwordChangeData.confirmPassword).toBe('string');
    });
  });
});
