import {
  isValidEmail,
  isValidPasswordLength,
  isNotEmpty,
  validateLoginForm,
  validateSignupForm,
} from '../../src/utils/ValidationUtils';

describe('ValidationUtils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail(123)).toBe(false);
      expect(isValidEmail({})).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(isValidEmail('  test@example.com  ')).toBe(true);
      expect(isValidEmail('  invalid  ')).toBe(false);
    });
  });

  describe('isValidPasswordLength', () => {
    it('should return true for passwords meeting minimum length', () => {
      expect(isValidPasswordLength('password', 6)).toBe(true);
      expect(isValidPasswordLength('123456', 6)).toBe(true);
      expect(isValidPasswordLength('longpassword123', 6)).toBe(true);
    });

    it('should return false for passwords below minimum length', () => {
      expect(isValidPasswordLength('short', 6)).toBe(false);
      expect(isValidPasswordLength('12345', 6)).toBe(false);
      expect(isValidPasswordLength('', 6)).toBe(false);
    });

    it('should use default minimum length of 6', () => {
      expect(isValidPasswordLength('123456')).toBe(true);
      expect(isValidPasswordLength('12345')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidPasswordLength(null, 6)).toBe(false);
      expect(isValidPasswordLength(undefined, 6)).toBe(false);
      expect(isValidPasswordLength(123456, 6)).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    it('should return true for non-empty strings', () => {
      expect(isNotEmpty('text')).toBe(true);
      expect(isNotEmpty('  text  ')).toBe(true);
      expect(isNotEmpty('0')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty('   ')).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isNotEmpty(null)).toBe(false);
      expect(isNotEmpty(undefined)).toBe(false);
    });

    it('should return true for non-string truthy values', () => {
      expect(isNotEmpty(0)).toBe(true);
      expect(isNotEmpty(false)).toBe(true);
      expect(isNotEmpty([])).toBe(true);
      expect(isNotEmpty({})).toBe(true);
    });
  });

  describe('validateLoginForm', () => {
    it('should return valid for correct login data', () => {
      const result = validateLoginForm({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return error for missing email', () => {
      const result = validateLoginForm({
        email: '',
        password: 'password123',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should return error for invalid email format', () => {
      const result = validateLoginForm({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should return error for missing password', () => {
      const result = validateLoginForm({
        email: 'test@example.com',
        password: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const result = validateLoginForm({
        email: 'invalid',
        password: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });

    it('should support different languages', () => {
      const resultEn = validateLoginForm(
        { email: '', password: '' },
        'en'
      );
      const resultMs = validateLoginForm(
        { email: '', password: '' },
        'ms'
      );
      expect(resultEn.errors.email).toBeDefined();
      expect(resultMs.errors.email).toBeDefined();
      // Messages should be different for different languages
      expect(resultEn.errors.email).not.toBe(resultMs.errors.email);
    });
  });

  describe('validateSignupForm', () => {
    it('should return valid for correct signup data', () => {
      const result = validateSignupForm({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return error for missing name', () => {
      const result = validateSignupForm({
        name: '',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('should return error for missing email', () => {
      const result = validateSignupForm({
        name: 'John Doe',
        email: '',
        password: 'password123',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should return error for invalid email format', () => {
      const result = validateSignupForm({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should return error for missing password', () => {
      const result = validateSignupForm({
        name: 'John Doe',
        email: 'test@example.com',
        password: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('should return error for password too short', () => {
      const result = validateSignupForm({
        name: 'John Doe',
        email: 'test@example.com',
        password: '12345',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const result = validateSignupForm({
        name: '',
        email: 'invalid',
        password: '123',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });

    it('should support different languages', () => {
      const resultEn = validateSignupForm(
        { name: '', email: '', password: '' },
        'en'
      );
      const resultMs = validateSignupForm(
        { name: '', email: '', password: '' },
        'ms'
      );
      expect(resultEn.errors.name).toBeDefined();
      expect(resultMs.errors.name).toBeDefined();
      // Messages should be different for different languages
      expect(resultEn.errors.name).not.toBe(resultMs.errors.name);
    });
  });
});

