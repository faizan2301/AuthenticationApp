import React, { createContext, useContext, useState, useEffect } from 'react';
import StorageService from '../services/StorageService';

const LanguageContext = createContext(null);

const LANGUAGE_STORAGE_KEY = 'app_language';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const loadLanguage = () => {
      try {
        const savedLanguage = StorageService.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ms')) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };

    loadLanguage();
  }, []);

  const changeLanguage = (lang) => {
    if (lang === 'en' || lang === 'ms') {
      setLanguage(lang);
      StorageService.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  const value = {
    language,
    changeLanguage,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

