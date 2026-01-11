import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import StorageService from '../services/StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { validateLoginForm, validateSignupForm } from '../utils/ValidationUtils';
import { translations } from '../constants/Translations';
import ApiService from '../services/ApiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = StorageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = StorageService.getItem(STORAGE_KEYS.USER);
        
        if (storedToken && storedUser) {
          setUser(storedUser);
        } else if (storedToken) {
          const profileResult = await ApiService.getUserProfile(storedToken);
          if (profileResult.success && profileResult.data) {
            const userData = {
              id: profileResult.data.id,
              name: profileResult.data.name,
              email: profileResult.data.email,
              avatar: profileResult.data.avatar,
              role: profileResult.data.role,
            };
            StorageService.setItem(STORAGE_KEYS.USER, userData);
            setUser(userData);
          } else {
            StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            StorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const currentLang = StorageService.getItem('app_language') || 'en';
      const t = translations[currentLang] || translations.en;
      const validation = validateLoginForm({ email, password }, currentLang);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        return { success: false, error: firstError };
      }

      const result = await ApiService.login(email.trim(), password);

      if (!result.success) {
        return {
          success: false,
          error: result.error || t.validation.incorrectCredentials,
        };
      }

      const responseData = result.data;
      const accessToken = responseData.access_token;
      const refreshToken = responseData.refresh_token;

      if (!accessToken) {
        return {
          success: false,
          error: t.validation.loginError || 'Invalid response from server',
        };
      }

      StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      if (refreshToken) {
        StorageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      const profileResult = await ApiService.getUserProfile(accessToken);
      if (profileResult.success && profileResult.data) {
        const userData = {
          id: profileResult.data.id,
          name: profileResult.data.name,
          email: profileResult.data.email,
          avatar: profileResult.data.avatar,
          role: profileResult.data.role,
        };
        StorageService.setItem(STORAGE_KEYS.USER, userData);
        setUser(userData);
        return { success: true };
      } else {
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      const currentLang = StorageService.getItem('app_language') || 'en';
      const t = translations[currentLang] || translations.en;
      return { success: false, error: t.validation.loginError };
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    try {
      const currentLang = StorageService.getItem('app_language') || 'en';
      const t = translations[currentLang] || translations.en;
      const validation = validateSignupForm({ name, email, password }, currentLang);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        return { success: false, error: firstError };
      }

      const result = await ApiService.signup(name.trim(), email.trim(), password);

      if (!result.success) {
        const errorMessage =
          result.error || t.validation.userExists || t.validation.signupError;
        return { success: false, error: errorMessage };
      }

      const responseData = result.data;
      const userData = {
        id: responseData.id,
        name: responseData.name || name.trim(),
        email: responseData.email || email.trim(),
        avatar: responseData.avatar,
        role: responseData.role || 'customer',
      };

      const loginResult = await ApiService.login(email.trim(), password);
      if (loginResult.success && loginResult.data) {
        const accessToken = loginResult.data.access_token;
        const refreshToken = loginResult.data.refresh_token;

        if (accessToken) {
          StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
          if (refreshToken) {
            StorageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
          }
        }
      }

      StorageService.setItem(STORAGE_KEYS.USER, userData);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      const currentLang = StorageService.getItem('app_language') || 'en';
      const t = translations[currentLang] || translations.en;
      return { success: false, error: t.validation.signupError };
    }
  }, []);

  const logout = useCallback(() => {
    try {
      setUser(null);
      StorageService.removeItem(STORAGE_KEYS.USER);
      StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      StorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

