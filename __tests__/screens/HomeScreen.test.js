import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { AuthProvider } from '../../src/context/AuthContext';
import { LanguageProvider } from '../../src/context/LanguageContext';
import StorageService from '../../src/services/StorageService';
import ApiService from '../../src/services/ApiService';

// Mock dependencies
jest.mock('../../src/services/StorageService');
jest.mock('../../src/services/ApiService');

const renderWithProviders = (component) => {
  return render(
    <LanguageProvider>
      <AuthProvider>{component}</AuthProvider>
    </LanguageProvider>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    StorageService.getItem.mockImplementation((key) => {
      if (key === 'app_language') return 'en';
      return null;
    });
    ApiService.getUserProfile.mockResolvedValue({
      success: false,
    });
  });

  it('should render user information correctly', async () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    // Wait for loading to complete
    await waitFor(() => {
      // Check if welcome text is displayed
      expect(getByText(/welcome/i)).toBeTruthy();
    });
  });

  it('should display user name when available', async () => {
    // Mock the auth context to have a user
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.jpg',
      role: 'customer',
    };

    // We'll need to manually set the user in storage to simulate logged in state
    StorageService.getItem.mockImplementation((key) => {
      if (key === 'user') return mockUser;
      if (key === 'auth_token') return 'mock-token';
      if (key === 'app_language') return 'en';
      return null;
    });

    const { getAllByText } = renderWithProviders(<HomeScreen />);

    // Wait for the component to load user data
    await waitFor(() => {
      // The user name should be displayed (may appear multiple times)
      expect(getAllByText(/John Doe/i).length).toBeGreaterThan(0);
    });
  });

  it('should display user email when available', async () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    // Wait for component to render
    await waitFor(() => {
      // Check if email label is present
      expect(getByText(/email/i)).toBeTruthy();
    });
  });

  it('should call logout when logout button is pressed', async () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    await waitFor(() => {
      const logoutButton = getByText(/sign out|log out/i);
      fireEvent.press(logoutButton);
    });

    // Verify that storage items are removed (logout clears storage)
    await waitFor(() => {
      expect(StorageService.removeItem).toHaveBeenCalled();
    });
  });

  it('should change language when language button is pressed', async () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    await waitFor(() => {
      const msButton = getByText('Bahasa Melayu');
      fireEvent.press(msButton);
    });

    expect(StorageService.setItem).toHaveBeenCalledWith('app_language', 'ms');
  });

  it('should display profile information section', async () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    await waitFor(() => {
      expect(getByText(/profile/i)).toBeTruthy();
      expect(getByText(/full name/i)).toBeTruthy();
      expect(getByText(/email/i)).toBeTruthy();
    });
  });

  it('should display user initials in avatar when name is available', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    };

    StorageService.getItem.mockImplementation((key) => {
      if (key === 'user') return mockUser;
      if (key === 'auth_token') return 'mock-token';
      if (key === 'app_language') return 'en';
      return null;
    });

    const { getByText } = renderWithProviders(<HomeScreen />);

    await waitFor(() => {
      // Avatar should show initials "JD" for "John Doe"
      expect(getByText('JD')).toBeTruthy();
    });
  });

  it('should handle logout correctly', async () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    await waitFor(() => {
      const logoutButton = getByText(/sign out|log out/i);
      fireEvent.press(logoutButton);
    });

    // Verify logout was called
    // Storage should be cleared
    await waitFor(() => {
      expect(StorageService.removeItem).toHaveBeenCalledWith('user');
      expect(StorageService.removeItem).toHaveBeenCalledWith('auth_token');
      expect(StorageService.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });
});

