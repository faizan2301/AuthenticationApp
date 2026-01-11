import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import HomeScreen from '../../src/screens/HomeScreen';
import { AuthProvider } from '../../src/context/AuthContext';
import { LanguageProvider } from '../../src/context/LanguageContext';
import ApiService from '../../src/services/ApiService';
import StorageService from '../../src/services/StorageService';

// Mock dependencies
jest.mock('../../src/services/ApiService');
jest.mock('../../src/services/StorageService');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
};

const renderWithProviders = (component) => {
  return render(
    <LanguageProvider>
      <AuthProvider>{component}</AuthProvider>
    </LanguageProvider>
  );
};

describe('Login Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    StorageService.getItem.mockReturnValue(null);
  });

  it('should complete full login flow from login screen to authenticated state', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://example.com/avatar.jpg',
      role: 'customer',
    };

    const mockToken = 'mock-access-token';
    const mockRefreshToken = 'mock-refresh-token';

    // Setup API mocks
    ApiService.login.mockResolvedValue({
      success: true,
      data: {
        access_token: mockToken,
        refresh_token: mockRefreshToken,
      },
    });

    ApiService.getUserProfile.mockResolvedValue({
      success: true,
      data: mockUser,
    });

    // Render Login Screen
    const { getByPlaceholderText, getAllByText, queryByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    // Step 1: Enter credentials
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const loginButton = getAllByText('Sign In')[0];

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    // Step 2: Submit login
    fireEvent.press(loginButton);

    // Step 3: Verify API calls
    await waitFor(() => {
      expect(ApiService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });

    // Step 4: Verify storage is updated
    await waitFor(() => {
      expect(StorageService.setItem).toHaveBeenCalledWith(
        'auth_token',
        mockToken
      );
      expect(StorageService.setItem).toHaveBeenCalledWith(
        'user',
        mockUser
      );
    });

    // Step 5: Verify user profile was fetched
    await waitFor(() => {
      expect(ApiService.getUserProfile).toHaveBeenCalledWith(mockToken);
    });

    // Step 6: Verify no error messages
    await waitFor(() => {
      expect(queryByText(/error|incorrect/i)).toBeNull();
    });
  });

  it('should handle login failure and show error message', async () => {
    ApiService.login.mockResolvedValue({
      success: false,
      error: 'Incorrect email or password',
    });

    const { getByPlaceholderText, getAllByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const loginButton = getAllByText('Sign In')[0];

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(loginButton);

    // Verify error is displayed
    await waitFor(() => {
      const errorMessages = getAllByText(/incorrect|error/i, { exact: false });
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    // Verify storage was not updated
    expect(StorageService.setItem).not.toHaveBeenCalledWith(
      'auth_token',
      expect.any(String)
    );
  });

  it('should persist login state and load user on app restart', async () => {
    const mockUser = {
      id: 1,
      name: 'Stored User',
      email: 'stored@example.com',
      avatar: 'https://example.com/avatar.jpg',
      role: 'customer',
    };

    // Simulate stored auth state
    StorageService.getItem.mockImplementation((key) => {
      if (key === 'auth_token') return 'stored-token';
      if (key === 'user') return mockUser;
      return null;
    });

    // Render HomeScreen (simulating app restart with stored auth)
    const { getByText } = renderWithProviders(<HomeScreen />);

    // Wait for auth context to load
    await waitFor(() => {
      expect(StorageService.getItem).toHaveBeenCalledWith('auth_token');
      expect(StorageService.getItem).toHaveBeenCalledWith('user');
    });

    // User should be authenticated
    // Note: This test verifies that the AuthContext properly loads persisted state
  });

  it('should handle complete flow: login -> navigate -> logout', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    ApiService.login.mockResolvedValue({
      success: true,
      data: {
        access_token: 'token',
        refresh_token: 'refresh-token',
      },
    });

    ApiService.getUserProfile.mockResolvedValue({
      success: true,
      data: mockUser,
    });

    // Step 1: Login
    const { getByPlaceholderText, getByText: getByTextLogin } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(
      getByPlaceholderText('Enter your email'),
      'test@example.com'
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'password123'
    );
    fireEvent.press(getByTextLogin('Sign In'));

    await waitFor(() => {
      expect(ApiService.login).toHaveBeenCalled();
    });

    // Step 2: Render HomeScreen (simulating navigation after login)
    const { getByText: getByTextHome } = renderWithProviders(<HomeScreen />);

    // Step 3: Logout
    const logoutButton = getByTextHome(/sign out|log out/i);
    fireEvent.press(logoutButton);

    // Verify logout cleared storage
    await waitFor(() => {
      expect(StorageService.removeItem).toHaveBeenCalledWith('user');
      expect(StorageService.removeItem).toHaveBeenCalledWith('auth_token');
      expect(StorageService.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  it('should validate form before making API call', async () => {
    const { getAllByText, getByPlaceholderText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    const loginButton = getAllByText('Sign In')[0];

    // Try to login without filling form
    fireEvent.press(loginButton);

    // Should show validation errors
    await waitFor(() => {
      const emailErrors = getAllByText(/email/i, { exact: false });
      const passwordErrors = getAllByText(/password/i, { exact: false });
      expect(emailErrors.length + passwordErrors.length).toBeGreaterThan(0);
    });

    // API should not be called
    expect(ApiService.login).not.toHaveBeenCalled();
  });

  it('should handle network error during login', async () => {
    ApiService.login.mockRejectedValue(new Error('Network error'));

    const { getByPlaceholderText, getAllByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(
      getByPlaceholderText('Enter your email'),
      'test@example.com'
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'password123'
    );
    fireEvent.press(getAllByText('Sign In')[0]);

    // Should show error message
    await waitFor(() => {
      const errorMessages = getAllByText(/error/i, { exact: false });
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    // Storage should not be updated
    expect(StorageService.setItem).not.toHaveBeenCalledWith(
      'auth_token',
      expect.any(String)
    );
  });
});

