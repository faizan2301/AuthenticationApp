import ApiService from '../../src/services/ApiService';
import {
  ApiError,
  AuthenticationError,
  ValidationError,
  NetworkError,
} from '../../src/utils/ApiErrors';

// Mock the Logger
jest.mock('../../src/utils/Logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  logRequest: jest.fn(),
  logResponse: jest.fn(),
}));

describe('ApiService', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await ApiService.login('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
    });

    it('should handle login failure with invalid credentials', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'Invalid credentials' }),
      });

      const result = await ApiService.login('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle missing access token in response', async () => {
      const mockResponse = {};

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await ApiService.login('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid response from server');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await ApiService.login('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should trim email before sending', async () => {
      const mockResponse = {
        access_token: 'mock-access-token',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      await ApiService.login('  test@example.com  ', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
    });
  });

  describe('signup', () => {
    it('should successfully signup with valid data', async () => {
      const mockResponse = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://api.lorem.space/image/face?w=640&h=480',
        role: 'customer',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await ApiService.signup(
        'John Doe',
        'john@example.com',
        'password123'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            avatar: 'https://api.lorem.space/image/face?w=640&h=480',
          }),
        })
      );
    });

    it('should handle validation errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({ message: 'Invalid user data' }),
      });

      const result = await ApiService.signup('', 'invalid-email', '123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle user already exists error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({ message: 'User already exists' }),
      });

      const result = await ApiService.signup(
        'John Doe',
        'existing@example.com',
        'password123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should trim name and email before sending', async () => {
      const mockResponse = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      await ApiService.signup('  John Doe  ', '  john@example.com  ', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            avatar: 'https://api.lorem.space/image/face?w=640&h=480',
          }),
        })
      );
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await ApiService.signup(
        'John Doe',
        'john@example.com',
        'password123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getUserProfile', () => {
    it('should successfully fetch user profile with valid token', async () => {
      const mockResponse = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://example.com/avatar.jpg',
        role: 'customer',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await ApiService.getUserProfile('valid-token');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/profile'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        })
      );
    });

    it('should handle authentication errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'Unauthorized' }),
      });

      const result = await ApiService.getUserProfile('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed. Please log in again.');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await ApiService.getUserProfile('valid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh access token', async () => {
      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await ApiService.refreshToken('valid-refresh-token');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh-token'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            refreshToken: 'valid-refresh-token',
          }),
        })
      );
    });

    it('should handle missing access token in response', async () => {
      const mockResponse = {};

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await ApiService.refreshToken('valid-refresh-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid response from server');
    });

    it('should handle authentication errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'Invalid refresh token' }),
      });

      const result = await ApiService.refreshToken('invalid-refresh-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Token refresh failed. Please log in again.');
    });
  });
});

