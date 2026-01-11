// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  const storage = new Map();
  return {
    createMMKV: jest.fn(() => ({
      set: jest.fn((key, value) => {
        storage.set(key, value);
      }),
      getString: jest.fn((key) => {
        const value = storage.get(key);
        return typeof value === 'string' ? value : undefined;
      }),
      getNumber: jest.fn((key) => {
        const value = storage.get(key);
        return typeof value === 'number' ? value : undefined;
      }),
      getBoolean: jest.fn((key) => {
        const value = storage.get(key);
        return typeof value === 'boolean' ? value : undefined;
      }),
      contains: jest.fn((key) => storage.has(key)),
      remove: jest.fn((key) => {
        storage.delete(key);
      }),
      clearAll: jest.fn(() => {
        storage.clear();
      }),
      trim: jest.fn(),
    })),
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock images module
jest.mock('./src/constants/images', () => ({
  __esModule: true,
  default: {
    email: { uri: 'mock-email.png' },
    password: { uri: 'mock-password.png' },
    hide: { uri: 'mock-hide.png' },
    show: { uri: 'mock-show.png' },
    logout: { uri: 'mock-logout.png' },
    name: { uri: 'mock-name.png' },
    profile: { uri: 'mock-profile.png' },
    logo: { uri: 'mock-logo.png' },
  },
}));

// Global fetch mock
global.fetch = jest.fn();

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

