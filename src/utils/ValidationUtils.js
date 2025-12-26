import { translations } from '../constants/Translations';

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPasswordLength = (password, minLength = 6) => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return password.length >= minLength;
};

export const isNotEmpty = (value) => {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return true;
};

export const validateLoginForm = (formData, language = 'en') => {
  const t = translations[language] || translations.en;
  const errors = {};

  if (!isNotEmpty(formData.email)) {
    errors.email = t.validation.emailRequired;
  } else if (!isValidEmail(formData.email)) {
    errors.email = t.validation.emailInvalid;
  }

  if (!isNotEmpty(formData.password)) {
    errors.password = t.validation.passwordRequired;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSignupForm = (formData, language = 'en') => {
  const t = translations[language] || translations.en;
  const errors = {};

  if (!isNotEmpty(formData.name)) {
    errors.name = t.validation.nameRequired;
  }

  if (!isNotEmpty(formData.email)) {
    errors.email = t.validation.emailRequired;
  } else if (!isValidEmail(formData.email)) {
    errors.email = t.validation.emailInvalid;
  }

  if (!isNotEmpty(formData.password)) {
    errors.password = t.validation.passwordRequired;
  } else if (!isValidPasswordLength(formData.password)) {
    errors.password = t.validation.passwordMinLength;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
