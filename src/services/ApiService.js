

import Logger from '../utils/Logger';
import {
  ApiError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  ServerError,
  NotFoundError,
} from '../utils/ApiErrors';

const API_BASE_URL = 'https://api.escuelajs.co/api/v1';


class HttpClient {
  constructor(baseURL, logger) {
    this.baseURL = baseURL;
    this.logger = logger;
  }


  async _request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    const body = options.body ? JSON.stringify(options.body) : null;

    const startTime = Date.now();
    
    this.logger.logRequest(method, url, headers, options.body);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        ...options.config,
      });

      const duration = Date.now() - startTime;

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {
        this.logger.warn('API_RESPONSE', 'Failed to parse JSON response', {
          endpoint,
          status: response.status,
          error: parseError.message,
        });
        data = null;
      }

      this.logger.logResponse(method, url, response.status, duration, data);

      if (!response.ok) {
        const error = this._createErrorFromResponse(response.status, data);
        throw error;
      }

      return {
        success: true,
        data,
        status: response.status,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof ApiError) {
        throw error;
      }

      const networkError = new NetworkError(
        error.message || 'Network error. Please check your connection.',
        error
      );
      
      this.logger.error('HTTP_CLIENT', 'Request failed', networkError, {
        endpoint,
        method,
        duration,
      });

      throw networkError;
    }
  }


  _createErrorFromResponse(statusCode, responseData) {
    const message = responseData?.message || responseData?.error || 'Request failed';
    
    switch (statusCode) {
      case 400:
        return new ValidationError(message, statusCode, responseData);
      case 401:
        return new AuthenticationError(message, statusCode, responseData);
      case 404:
        return new NotFoundError(message, statusCode, responseData);
      case 500:
      case 502:
      case 503:
        return new ServerError(message, statusCode, responseData);
      default:
        return new ApiError(message, statusCode, responseData);
    }
  }


  async get(endpoint, options = {}) {
    return this._request(endpoint, { ...options, method: 'GET' });
  }


  async post(endpoint, body, options = {}) {
    return this._request(endpoint, { ...options, method: 'POST', body });
  }


  async put(endpoint, body, options = {}) {
    return this._request(endpoint, { ...options, method: 'PUT', body });
  }


  async delete(endpoint, options = {}) {
    return this._request(endpoint, { ...options, method: 'DELETE' });
  }
}


class ApiService {
  constructor() {
    this.httpClient = new HttpClient(API_BASE_URL, Logger);
  }


  async login(email, password) {
    try {
      Logger.info('API_SERVICE', 'Attempting login', { email });

      const result = await this.httpClient.post('/auth/login', {
        email: email.trim(),
        password,
      });

      if (!result.data?.access_token) {
        Logger.warn('API_SERVICE', 'Login successful but no access token received');
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      Logger.info('API_SERVICE', 'Login successful', {
        email,
        hasAccessToken: !!result.data.access_token,
        hasRefreshToken: !!result.data.refresh_token,
      });

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      Logger.error('API_SERVICE', 'Login failed', error, { email });
      
      return {
        success: false,
        error: error instanceof ApiError 
          ? error.message 
          : 'Login failed. Please check your credentials.',
      };
    }
  }


  async signup(name, email, password) {
    try {
      Logger.info('API_SERVICE', 'Attempting signup', { email, name });

      const result = await this.httpClient.post('/users/', {
        name: name.trim(),
        email: email.trim(),
        password,
        avatar: 'https://api.lorem.space/image/face?w=640&h=480',
      });

      Logger.info('API_SERVICE', 'Signup successful', {
        email,
        userId: result.data?.id,
      });

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      Logger.error('API_SERVICE', 'Signup failed', error, { email, name });
      
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message || 'Invalid user data. Please check your information.',
        };
      }

      return {
        success: false,
        error: error instanceof ApiError
          ? error.message
          : 'Signup failed. Please try again.',
      };
    }
  }


  async getUserProfile(accessToken) {
    try {
      Logger.debug('API_SERVICE', 'Fetching user profile');

      const result = await this.httpClient.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      Logger.info('API_SERVICE', 'Profile fetched successfully', {
        userId: result.data?.id,
        email: result.data?.email,
      });

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      Logger.error('API_SERVICE', 'Failed to fetch profile', error);
      
      if (error instanceof AuthenticationError) {
        return {
          success: false,
          error: 'Authentication failed. Please log in again.',
        };
      }

      return {
        success: false,
        error: error instanceof ApiError
          ? error.message
          : 'Failed to fetch profile. Please try again.',
      };
    }
  }


  async refreshToken(refreshToken) {
    try {
      Logger.debug('API_SERVICE', 'Refreshing access token');

      const result = await this.httpClient.post('/auth/refresh-token', {
        refreshToken,
      });

      if (!result.data?.access_token) {
        Logger.warn('API_SERVICE', 'Token refresh successful but no access token received');
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      Logger.info('API_SERVICE', 'Token refreshed successfully', {
        hasAccessToken: !!result.data.access_token,
        hasRefreshToken: !!result.data.refresh_token,
      });

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      Logger.error('API_SERVICE', 'Token refresh failed', error);
      
      if (error instanceof AuthenticationError) {
        return {
          success: false,
          error: 'Token refresh failed. Please log in again.',
        };
      }

      return {
        success: false,
        error: error instanceof ApiError
          ? error.message
          : 'Token refresh failed. Please try again.',
      };
    }
  }
}

const apiServiceInstance = new ApiService();
export default apiServiceInstance;
