// Tests for LoginPage component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoginPage from '../../pages/Auth/LoginPage';
import { useAuth } from '../../contexts/AuthContext';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockLocation = { state: null };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext');
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

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

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.state = null;
  });

  it('should render login form', () => {
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
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'BookReview', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('should render demo account information', () => {
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
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Demo Account:')).toBeInTheDocument();
    expect(screen.getByText('Email: admin@bookreview.com')).toBeInTheDocument();
    expect(screen.getByText('Password: Password123')).toBeInTheDocument();
  });

  it('should validate email field', async () => {
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
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should validate password field', async () => {
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
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', () => {
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
        <LoginPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByLabelText('toggle password visibility');

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should handle successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('should handle login with redirect path', async () => {
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    mockLocation.state = { from: { pathname: '/profile' } };
    
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/profile', { replace: true });
    });
  });

  it('should handle login failure with 401 error', async () => {
    const mockLogin = jest.fn().mockRejectedValue({
      response: { status: 401 }
    });
    
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
    });
  });

  it('should handle login failure with custom error message', async () => {
    const mockLogin = jest.fn().mockRejectedValue({
      response: { 
        status: 400,
        data: { message: 'Account is locked' }
      }
    });
    
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Account is locked')).toBeInTheDocument();
    });
  });

  it('should handle generic login failure', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Network error'));
    
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    const mockLogin = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshProfile: jest.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Should show loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should handle remember me checkbox', () => {
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
        <LoginPage />
      </TestWrapper>
    );

    const rememberMeCheckbox = screen.getByLabelText('Remember me') as HTMLInputElement;
    expect(rememberMeCheckbox.checked).toBe(false);

    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox.checked).toBe(true);
  });

  it('should render navigation links', () => {
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
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText('Sign up here')).toBeInTheDocument();
  });

  it('should disable form when auth loading is true', () => {
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
      loading: true,
    });

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    const rememberMeCheckbox = screen.getByLabelText('Remember me') as HTMLInputElement;

    expect(emailInput.disabled).toBe(true);
    expect(passwordInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
    expect(rememberMeCheckbox.disabled).toBe(true);
  });
});
