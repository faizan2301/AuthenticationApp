import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import StorageService from '../services/StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { validateLoginForm, validateSignupForm } from '../utils/ValidationUtils';
import { translations } from '../constants/Translations';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = StorageService.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          setUser(storedUser);
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

      const storedUsers = StorageService.getItem('users') || [];

      const foundUser = storedUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (!foundUser) {
        return { success: false, error: t.validation.incorrectCredentials };
      }

      if (foundUser.password !== password) {
        return { success: false, error: t.validation.incorrectCredentials };
      }

      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
      };

      setUser(userData);
      StorageService.setItem(STORAGE_KEYS.USER, userData);

      return { success: true };
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

      const storedUsers = StorageService.getItem('users') || [];

      const existingUser = storedUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (existingUser) {
        return { success: false, error: t.validation.userExists };
      }

      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
      };

      storedUsers.push(newUser);
      StorageService.setItem('users', storedUsers);

      const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };

      setUser(userData);
      StorageService.setItem(STORAGE_KEYS.USER, userData);

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

