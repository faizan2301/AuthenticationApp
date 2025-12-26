import { createMMKV } from 'react-native-mmkv';

let storageInstance = null;

const getStorage = () => {
  if (!storageInstance) {
    try {
      storageInstance = createMMKV({
        id: 'auth-storage',
      });
    } catch (error) {
      console.error('Failed to initialize MMKV storage:', error);
      throw new Error(
        'MMKV native module is not available. Please rebuild the app:\n' +
        'Android: cd android && ./gradlew clean && cd .. && yarn android\n' +
        'iOS: cd ios && pod install && cd .. && yarn ios'
      );
    }
  }
  return storageInstance;
};

export const setItem = (key, value) => {
  try {
    const storage = getStorage();
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      storage.set(key, value);
    } else {
      storage.set(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    throw error;
  }
};

export const getItem = (key) => {
  try {
    const storage = getStorage();
    if (!storage.contains(key)) {
      return null;
    }

    const stringValue = storage.getString(key);
    if (stringValue !== undefined) {
      try {
        return JSON.parse(stringValue);
      } catch {
        return stringValue;
      }
    }

    const numberValue = storage.getNumber(key);
    if (numberValue !== undefined) {
      return numberValue;
    }

    const booleanValue = storage.getBoolean(key);
    if (booleanValue !== undefined) {
      return booleanValue;
    }

    return null;
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return null;
  }
};

export const removeItem = (key) => {
  try {
    const storage = getStorage();
    if (storage.contains(key)) {
      storage.remove(key);
    }
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    throw error;
  }
};

export const clear = () => {
  try {
    const storage = getStorage();
    storage.clearAll();
    storage.trim();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};

export const contains = (key) => {
  const storage = getStorage();
  return storage.contains(key);
};

const StorageService = {
  setItem,
  getItem,
  removeItem,
  clear,
  contains,
};

export default StorageService;

