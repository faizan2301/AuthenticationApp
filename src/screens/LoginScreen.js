import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm } from '../utils/ValidationUtils';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import StorageService from '../services/StorageService';
import images from '../constants/images';
const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { t, language } = useTranslation();
  const { changeLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setErrors({});

    const currentLang = StorageService.getItem('app_language') || language;
    const validation = validateLoginForm({ email, password }, currentLang);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={images.logo} style={styles.logo} />
          </View>
          <Text style={styles.title}>{t.login.title}</Text>
          <Text style={styles.subtitle}>{t.login.subtitle}</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.languageSwitcher}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => changeLanguage('en')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'en' && styles.languageButtonTextActive,
                ]}
              >
                EN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'ms' && styles.languageButtonActive,
              ]}
              onPress={() => changeLanguage('ms')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'ms' && styles.languageButtonTextActive,
                ]}
              >
                MS
              </Text>
            </TouchableOpacity>
          </View>

          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.login.emailLabel}</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.email && styles.inputWrapperError,
              ]}
            >
              <Image source={images.email} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.login.emailPlaceholder}
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {errors.email && (
              <Text style={styles.fieldError}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.login.passwordLabel}</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.password && styles.inputWrapperError,
              ]}
            >
              <Image source={images.password} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder={t.login.passwordPlaceholder}
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setPasswordVisible(!passwordVisible)}
                disabled={isLoading}
              >
                <Image
                  source={passwordVisible ? images.show : images.hide}
                  style={styles.eyeIconImage}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.fieldError}>{errors.password}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t.login.button}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t.common.or}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Signup')}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>
              {t.login.linkText}{' '}
              <Text style={styles.linkTextBold}>{t.login.linkBold}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // tintColor:'#6366F1',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    gap: 6,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  inputIcon: {
    width: 20,
    height: 20,
    tintColor:'#9CA3AF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 16,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    padding: 4,
    position: 'absolute',
    right: 12,
  },
  eyeIconImage: {
    width: 20,
    height: 20,
  },
  fieldError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    color: '#6B7280',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#6366F1',
    fontWeight: '600',
  },
  languageSwitcher: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: 50,
    alignItems: 'center',
    marginLeft: 8,
  },
  languageButtonActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  languageButtonTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
});

export default LoginScreen;
