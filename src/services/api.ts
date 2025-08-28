// API service for communicating with the BookReview backend

import axios, { type AxiosInstance } from 'axios';
import type {
  User,
  Book,
  Review,
  LoginData,
  RegisterData,
  JwtResponse,
  ApiResponse,
  PaginatedResponse,
  ProfileUpdateData,
  PasswordChangeData,
  RecommendationResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8080/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - only redirect for auth-related endpoints
          const url = error.config?.url || '';
          if (url.includes('/auth/') || url.includes('/profile')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication API calls
  async login(loginData: LoginData): Promise<JwtResponse> {
    const response = await this.api.post('/auth/login', loginData);
    return response.data;
  }

  async register(registerData: RegisterData): Promise<ApiResponse<User>> {
    const response = await this.api.post('/auth/register', registerData);
    return response.data;
  }

  async validateToken(): Promise<{ valid: boolean; userId: number; email: string; name: string }> {
    const response = await this.api.get('/auth/validate');
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<JwtResponse> {
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async getUserProfile(): Promise<User> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  async updateUserProfile(profileData: ProfileUpdateData): Promise<ApiResponse<User>> {
    const response = await this.api.put('/auth/profile', profileData);
    return response.data;
  }

  async changePassword(passwordData: PasswordChangeData): Promise<ApiResponse<any>> {
    const response = await this.api.put('/auth/change-password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    return response.data;
  }

  // Books API calls
  async getBooks(page = 0, size = 10, sort = 'createdAt', direction = 'desc'): Promise<PaginatedResponse<Book>> {
    const response = await this.api.get('/books', {
      params: { page, size, sort, direction }
    });
    return response.data;
  }

  async getBookById(id: number): Promise<Book> {
    const response = await this.api.get(`/books/${id}`);
    return response.data;
  }

  async getBookDetails(id: number): Promise<Book> {
    const response = await this.api.get(`/books/${id}`);
    return response.data;
  }

  async searchBooks(query: string, page = 0, size = 10): Promise<PaginatedResponse<Book>> {
    const response = await this.api.get('/books/search', {
      params: { query, page, size }
    });
    return response.data;
  }

  async getTopRatedBooks(limit = 10): Promise<Book[]> {
    const response = await this.api.get('/books/top-rated', {
      params: { limit }
    });
    return response.data;
  }

  async getPopularBooks(limit = 10): Promise<Book[]> {
    const response = await this.api.get('/books/popular', {
      params: { limit }
    });
    return response.data;
  }

  async getRecentBooks(limit = 10): Promise<Book[]> {
    const response = await this.api.get('/books/recent', {
      params: { limit }
    });
    return response.data;
  }

  async addToFavorites(bookId: number): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/books/${bookId}/favorite`);
    return response.data;
  }

  async removeFromFavorites(bookId: number): Promise<ApiResponse<any>> {
    const response = await this.api.delete(`/books/${bookId}/favorite`);
    return response.data;
  }

  async checkFavoriteStatus(bookId: number): Promise<{ favorited: boolean; bookId: number }> {
    const response = await this.api.get(`/books/${bookId}/favorite`);
    return response.data;
  }

  async getUserFavorites(page = 0, size = 10): Promise<PaginatedResponse<Book>> {
    const response = await this.api.get('/books/favorites', {
      params: { page, size }
    });
    return response.data;
  }

  // Recommendation API calls
  async getRecommendations(limit = 10): Promise<RecommendationResponse> {
    const response = await this.api.get('/books/recommendations', {
      params: { limit }
    });
    return response.data;
  }

  async getAIRecommendations(limit = 3): Promise<RecommendationResponse & { aiAvailable: boolean }> {
    const response = await this.api.get('/books/ai-recommendations', {
      params: { limit }
    });
    return response.data;
  }

  async getSimilarBooks(bookId: number, limit = 10): Promise<{ bookId: number; similarBooks: Book[]; count: number }> {
    const response = await this.api.get(`/books/${bookId}/similar`, {
      params: { limit }
    });
    return response.data;
  }

  async submitRecommendationFeedback(recommendationId: number, feedbackType: 'like' | 'dislike', reason?: string): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/books/recommendations/${recommendationId}/feedback`, {
      type: feedbackType,
      reason
    });
    return response.data;
  }

  // Reviews API calls
  async getBookReviews(bookId: number, page = 0, size = 10): Promise<PaginatedResponse<Review>> {
    const response = await this.api.get(`/books/${bookId}/reviews`, {
      params: { page, size }
    });
    return response.data;
  }

  async createReview(bookId: number, rating: number, reviewText: string): Promise<ApiResponse<Review>> {
    const response = await this.api.post(`/books/${bookId}/reviews`, {
      rating,
      reviewText
    });
    return response.data;
  }

  async getUserReviews(userId: number, page = 0, size = 10): Promise<PaginatedResponse<Review>> {
    const response = await this.api.get(`/users/${userId}/reviews`, {
      params: { page, size }
    });
    return response.data;
  }

  async getMyReviews(page = 0, size = 10): Promise<PaginatedResponse<Review>> {
    const response = await this.api.get('/auth/my-reviews', {
      params: { page, size }
    });
    return response.data;
  }

  async submitReview(bookId: number, rating: number, reviewText?: string): Promise<ApiResponse<Review>> {
    const response = await this.api.post(`/books/${bookId}/reviews`, {
      rating,
      reviewText
    });
    return response.data;
  }

  async updateReview(reviewId: number, rating: number, reviewText?: string): Promise<ApiResponse<Review>> {
    const response = await this.api.put(`/reviews/${reviewId}`, {
      rating,
      reviewText
    });
    return response.data;
  }

  async deleteReview(reviewId: number): Promise<ApiResponse<any>> {
    const response = await this.api.delete(`/reviews/${reviewId}`);
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }
}

export const apiService = new ApiService();
export default apiService;
