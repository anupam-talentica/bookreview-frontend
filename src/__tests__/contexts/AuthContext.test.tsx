// Tests for AuthContext
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import type { User, JwtResponse } from '../../types';

// Mock the API service
jest.mock('../../services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

// Test component to access auth context
const TestComponent: React.FC = () => {
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{auth.user ? auth.user.name : 'no-user'}</div>
      <button onClick={() => auth.login('test@example.com', 'password')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.register({ name: 'Test', email: 'test@example.com', password: 'password' })}>
        Register
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('should initialize with default state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
  });

  it('should restore user from localStorage on initialization', async () => {
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      reviewCount: 5,
      favoriteBooksCount: 3,
    };
    const mockToken = 'mock-jwt-token';

    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    mockedApiService.validateToken.mockResolvedValue({
      valid: true,
      userId: 1,
      email: 'test@example.com',
      name: 'Test User',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(mockedApiService.validateToken).toHaveBeenCalled();
    expect(mockedApiService.setAuthToken).toHaveBeenCalledWith(mockToken);
  });

  it('should clear invalid token on initialization', async () => {
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      reviewCount: 5,
      favoriteBooksCount: 3,
    };
    const mockToken = 'invalid-token';

    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    mockedApiService.validateToken.mockResolvedValue({
      valid: false,
      userId: 1,
      email: 'test@example.com',
      name: 'Test User',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should handle login successfully', async () => {
    const mockJwtResponse: JwtResponse = {
      token: 'new-jwt-token',
      type: 'Bearer',
      userId: 1,
      name: 'Test User',
      email: 'test@example.com',
      expiresAt: '2024-12-31T23:59:59Z',
    };

    mockedApiService.login.mockResolvedValue(mockJwtResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(mockedApiService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(mockedApiService.setAuthToken).toHaveBeenCalledWith('new-jwt-token');
    expect(localStorage.getItem('token')).toBe('new-jwt-token');
  });

  it('should handle login failure', async () => {
    mockedApiService.login.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await act(async () => {
      try {
        screen.getByText('Login').click();
      } catch (error) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
  });

  it('should handle registration successfully', async () => {
    const mockRegisterResponse = {
      success: true,
      message: 'Registration successful',
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        reviewCount: 0,
        favoriteBooksCount: 0,
      },
    };

    const mockJwtResponse: JwtResponse = {
      token: 'new-jwt-token',
      type: 'Bearer',
      userId: 1,
      name: 'Test User',
      email: 'test@example.com',
      expiresAt: '2024-12-31T23:59:59Z',
    };

    mockedApiService.register.mockResolvedValue(mockRegisterResponse);
    mockedApiService.login.mockResolvedValue(mockJwtResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await act(async () => {
      screen.getByText('Register').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(mockedApiService.register).toHaveBeenCalledWith({
      name: 'Test',
      email: 'test@example.com',
      password: 'password',
    });
    expect(mockedApiService.login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should handle logout successfully', async () => {
    // First set up authenticated state
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      reviewCount: 5,
      favoriteBooksCount: 3,
    };
    const mockToken = 'mock-jwt-token';

    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    mockedApiService.validateToken.mockResolvedValue({
      valid: true,
      userId: 1,
      email: 'test@example.com',
      name: 'Test User',
    });

    mockedApiService.logout.mockResolvedValue();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    expect(mockedApiService.logout).toHaveBeenCalled();
    expect(mockedApiService.clearAuthToken).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should handle logout even when API call fails', async () => {
    // First set up authenticated state
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      reviewCount: 5,
      favoriteBooksCount: 3,
    };
    const mockToken = 'mock-jwt-token';

    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    mockedApiService.validateToken.mockResolvedValue({
      valid: true,
      userId: 1,
      email: 'test@example.com',
      name: 'Test User',
    });

    mockedApiService.logout.mockRejectedValue(new Error('Network error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
