// Type definitions for the BookReview application

export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  reviewCount: number;
  favoriteBooksCount: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  coverImageUrl?: string;
  genres: string;
  publishedYear?: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  isbn?: string;
  publisher?: string;
  pageCount?: number;
  language?: string;
}

export interface Review {
  id: number;
  rating: number;
  reviewText?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  book: {
    id: number;
    title: string;
    author: string;
    genres?: string;
    publishedYear?: number;
    averageRating?: number;
    reviewCount?: number;
    createdAt?: string;
    updatedAt?: string;
    coverImageUrl?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: ProfileUpdateData) => Promise<void>;
  changePassword: (passwordData: PasswordChangeData) => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  bio?: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  userId: number;
  name: string;
  email: string;
  expiresAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface SearchFilters {
  query?: string;
  minRating?: number;
  genres?: string[];
  publishedYear?: {
    from?: number;
    to?: number;
  };
  sortBy?: 'rating' | 'reviews' | 'date' | 'title' | 'author';
  sortOrder?: 'asc' | 'desc';
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  genres: string;
  publishedYear: number;
  coverImageUrl?: string;
}

export interface ReviewFormData {
  rating: number;
  reviewText?: string;
}

export interface ProfileUpdateData {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserStatistics {
  reviewCount: number;
  favoriteBooksCount: number;
  averageRating?: number;
  memberSince: string;
}

export interface Recommendation {
  book: Book;
  explanation: string;
  type: 'genre_similarity' | 'community_favorite' | 'genre_trending' | 'author_recommendation' | 'user_favorite' | 'ai_recommendation';
  confidence: number;
  recommendedAt: string;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  userId: number;
  count: number;
  refreshedAt: string;
}

export interface RecommendationFeedback {
  type: 'like' | 'dislike';
  reason?: string;
  recommendationId: number;
}
