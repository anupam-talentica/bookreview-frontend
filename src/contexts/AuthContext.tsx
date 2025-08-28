// Authentication context for managing user state and authentication

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType, LoginData, RegisterData, ProfileUpdateData, PasswordChangeData } from '../types';
import { apiService } from '../services/api';

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        loading: false,
        isAuthenticated: true,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          // Validate token with backend
          const validation = await apiService.validateToken();
          if (validation.valid) {
            const user: User = JSON.parse(userStr);
            apiService.setAuthToken(token);
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token },
            });
          } else {
            // Token is invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'LOGIN_FAILURE' });
          }
        } catch (error) {
          // Token validation failed
          console.error('AuthContext - Token validation error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const loginData: LoginData = { email, password };
      const response = await apiService.login(loginData);
      
      // Create user object from JWT response
      const user: User = {
        id: response.userId,
        name: response.name,
        email: response.email,
        emailVerified: true,
        active: true,
        createdAt: new Date().toISOString(),
        reviewCount: 0,
        favoriteBooksCount: 0,
      };

      // Store token and user in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set auth token in API service
      apiService.setAuthToken(response.token);

      // Update state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: response.token },
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await apiService.register(userData);
      
      if (response.success && response.data) {
        // After successful registration, automatically log in
        await login(userData.email, userData.password);
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      apiService.clearAuthToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Update user profile
  const updateProfile = async (profileData: ProfileUpdateData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await apiService.updateUserProfile(profileData);
      
      if (response.success && response.data) {
        // Update user in local storage and state
        localStorage.setItem('user', JSON.stringify(response.data));
        dispatch({ type: 'SET_USER', payload: response.data });
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  // Change password
  const changePassword = async (passwordData: PasswordChangeData): Promise<void> => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('New password and confirm password do not match');
    }

    try {
      const response = await apiService.changePassword(passwordData);
      
      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      throw error;
    }
  };

  // Refresh user profile from server
  const refreshProfile = async (): Promise<void> => {
    if (!state.isAuthenticated) {
      return;
    }

    try {
      const profile = await apiService.getUserProfile();
      localStorage.setItem('user', JSON.stringify(profile));
      dispatch({ type: 'SET_USER', payload: profile });
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      // Don't throw error here as this is usually called in background
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshProfile,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
