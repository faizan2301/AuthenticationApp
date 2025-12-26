import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import images from '../constants/images';

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>
          </View>
          <Text style={styles.welcomeText}>{t.home.welcome}</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.languageCard}>
          <Text style={styles.languageLabel}>Language / Bahasa</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.languageButtonText, language === 'en' && styles.languageButtonTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageButton, language === 'ms' && styles.languageButtonActive]}
              onPress={() => changeLanguage('ms')}
            >
              <Text style={[styles.languageButtonText, language === 'ms' && styles.languageButtonTextActive]}>
                Bahasa Melayu
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {/* <Image source={images.profile} style={styles.cardIcon} /> */}
            <Text style={styles.cardTitle}>{t.home.profileInfo}</Text>
          </View>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Image source={images.name} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>{t.home.fullName}</Text>
              </View>
              <Text style={styles.infoValue}>{user?.name || t.common.na}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Image source={images.email} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>{t.home.emailAddress}</Text>
              </View>
              <Text style={styles.infoValue}>{user?.email || t.common.na}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Image source={images.logout} style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>{t.home.signOut}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerGradient: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 8,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  infoSection: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  infoIcon: {
    width: 20,
    height: 20,
    tintColor:'#9CA3AF',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 40,
    gap: 6,
  },
  logoutIcon: {
    width: 22,
    height: 22,
    tintColor:'#FFFFFF',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  languageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  languageButtons: {
    flexDirection: 'row',
  },
  languageButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 6,
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

export default HomeScreen;
