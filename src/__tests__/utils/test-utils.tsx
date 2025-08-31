// Test utilities for consistent test setup
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from '../../contexts/AuthContext';

// Create a custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
  
  const theme = createTheme();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: true,
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
  reviewCount: 5,
  favoriteBooksCount: 3,
  ...overrides,
});

export const createMockBook = (overrides = {}) => ({
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  description: 'Test description',
  genres: 'Fiction',
  averageRating: 4.5,
  reviewCount: 10,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  coverImageUrl: 'https://example.com/book.jpg',
  ...overrides,
});

export const createMockReview = (overrides = {}) => ({
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
  ...overrides,
});

export const createMockRecommendation = (overrides = {}) => ({
  book: createMockBook(),
  explanation: 'Recommended because you liked similar books',
  type: 'genre_similarity' as const,
  confidence: 0.85,
  recommendedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock API responses
export const createMockPaginatedResponse = <T>(data: T[], overrides = {}) => ({
  content: data,
  totalElements: data.length,
  totalPages: 1,
  currentPage: 0,
  size: data.length,
  first: true,
  last: true,
  ...overrides,
});

export const createMockApiResponse = <T>(data: T, overrides = {}) => ({
  success: true,
  message: 'Success',
  data,
  ...overrides,
});

// Common test scenarios
export const mockAuthContextValue = (overrides = {}) => ({
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
  ...overrides,
});

export const mockAuthenticatedUser = (user = createMockUser()) => ({
  isAuthenticated: true,
  user,
  token: 'mock-token',
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  refreshProfile: jest.fn(),
  loading: false,
});

// Wait for async operations
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Mock intersection observer for components that use it
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

// Mock window.matchMedia for responsive components
export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};
