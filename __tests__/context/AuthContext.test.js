import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import ApiService from '../../src/services/ApiService';
import StorageService from '../../src/services/StorageService';
import { STORAGE_KEYS } from '../../src/constants/StorageKeys';

// Mock dependencies
jest.mock('../../src/services/ApiService');
jest.mock('../../src/services/StorageService');

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    StorageService.getItem.mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should have initial user as null', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should have isLoading as false after initial load', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // After useEffect runs, loading should be false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.jpg',
        role: 'customer',
      };

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

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const loginResult = await result.current.login(
          'test@example.com',
          'password123'
        );
        expect(loginResult.success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(StorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.AUTH_TOKEN,
        mockToken
      );
      expect(StorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER,
        mockUser
      );
    });

    it('should return error for invalid credentials', async () => {
      ApiService.login.mockResolvedValue({
        success: false,
        error: 'Incorrect email or password',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const loginResult = await result.current.login(
          'test@example.com',
          'wrongpassword'
        );
        expect(loginResult.success).toBe(false);
        expect(loginResult.error).toBeDefined();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return error for validation failure', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const loginResult = await result.current.login('', '');
        expect(loginResult.success).toBe(false);
        expect(loginResult.error).toBeDefined();
      });
    });

    it('should handle login when getUserProfile fails but login succeeds', async () => {
      const mockToken = 'mock-access-token';

      ApiService.login.mockResolvedValue({
        success: true,
        data: {
          access_token: mockToken,
        },
      });

      ApiService.getUserProfile.mockResolvedValue({
        success: false,
        error: 'Failed to fetch profile',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const loginResult = await result.current.login(
          'test@example.com',
          'password123'
        );
        // Should still return success even if profile fetch fails
        expect(loginResult.success).toBe(true);
      });
    });
  });

  describe('Signup', () => {
    it('should successfully signup with valid data', async () => {
      const mockUser = {
        id: 1,
        name: 'New User',
        email: 'newuser@example.com',
        avatar: 'https://example.com/avatar.jpg',
        role: 'customer',
      };

      const mockToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      ApiService.signup.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      ApiService.login.mockResolvedValue({
        success: true,
        data: {
          access_token: mockToken,
          refresh_token: mockRefreshToken,
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const signupResult = await result.current.signup(
          'New User',
          'newuser@example.com',
          'password123'
        );
        expect(signupResult.success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(StorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER,
        expect.objectContaining({
          name: 'New User',
          email: 'newuser@example.com',
        })
      );
      expect(StorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.AUTH_TOKEN,
        mockToken
      );
    });

    it('should return error for validation failure', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const signupResult = await result.current.signup('', '', '');
        expect(signupResult.success).toBe(false);
        expect(signupResult.error).toBeDefined();
      });
    });

    it('should return error when user already exists', async () => {
      ApiService.signup.mockResolvedValue({
        success: false,
        error: 'User with this email already exists',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const signupResult = await result.current.signup(
          'Existing User',
          'existing@example.com',
          'password123'
        );
        expect(signupResult.success).toBe(false);
        expect(signupResult.error).toBeDefined();
      });
    });
  });

  describe('Logout', () => {
    it('should successfully logout and clear user data', async () => {
      // First login to set user
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      };

      ApiService.login.mockResolvedValue({
        success: true,
        data: { access_token: 'token' },
      });

      ApiService.getUserProfile.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Now logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(StorageService.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER);
      expect(StorageService.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.AUTH_TOKEN
      );
      expect(StorageService.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.REFRESH_TOKEN
      );
    });
  });

  describe('Persisted Auth State', () => {
    it('should load user from storage on mount', async () => {
      const mockUser = {
        id: 1,
        name: 'Stored User',
        email: 'stored@example.com',
      };

      StorageService.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.AUTH_TOKEN) return 'stored-token';
        if (key === STORAGE_KEYS.USER) return mockUser;
        return null;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should fetch user profile if token exists but user data does not', async () => {
      const mockUser = {
        id: 1,
        name: 'Fetched User',
        email: 'fetched@example.com',
      };

      StorageService.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.AUTH_TOKEN) return 'stored-token';
        if (key === STORAGE_KEYS.USER) return null;
        return null;
      });

      ApiService.getUserProfile.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(ApiService.getUserProfile).toHaveBeenCalledWith('stored-token');
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
    });

    it('should clear invalid token if profile fetch fails', async () => {
      StorageService.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.AUTH_TOKEN) return 'invalid-token';
        if (key === STORAGE_KEYS.USER) return null;
        return null;
      });

      ApiService.getUserProfile.mockResolvedValue({
        success: false,
        error: 'Invalid token',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(StorageService.removeItem).toHaveBeenCalledWith(
          STORAGE_KEYS.AUTH_TOKEN
        );
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});

