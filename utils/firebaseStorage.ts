import AsyncStorage from "@react-native-async-storage/async-storage";
import { database } from "@/constants/firebase";
import { ref, set, get, remove, onValue } from "firebase/database";

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  subscribe?: (key: string, callback: (value: any) => void) => () => void;
}

// Firebase Storage Adapter (for authenticated users)
export const createFirebaseAdapter = (userId: string): StorageAdapter => ({
  getItem: async (key: string) => {
    try {
      const snapshot = await get(ref(database, `users/${userId}/${key}`));
      const data = snapshot.val();
      return data ? JSON.stringify(data) : null;
    } catch (error) {
      console.error(`Firebase get error for ${key}:`, error);
      return null;
    }
  },

  setItem: async (key: string, value: string) => {
    try {
      const data = JSON.parse(value);
      await set(ref(database, `users/${userId}/${key}`), data);
    } catch (error) {
      console.error(`Firebase set error for ${key}:`, error);
    }
  },

  removeItem: async (key: string) => {
    try {
      await remove(ref(database, `users/${userId}/${key}`));
    } catch (error) {
      console.error(`Firebase remove error for ${key}:`, error);
    }
  },

  subscribe: (key: string, callback: (value: any) => void) => {
    const unsubscribe = onValue(ref(database, `users/${userId}/${key}`), (snapshot) => {
      callback(snapshot.val());
    });
    return unsubscribe;
  },
});

// AsyncStorage Adapter (for local-only or non-authenticated users)
export const asyncStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    return await AsyncStorage.getItem(key);
  },

  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },

  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

// Hybrid adapter - tries Firebase first, falls back to AsyncStorage
export const createHybridAdapter = (userId: string | null): StorageAdapter => {
  const firebaseAdapter = userId ? createFirebaseAdapter(userId) : null;

  return {
    getItem: async (key: string) => {
      if (firebaseAdapter) {
        try {
          const value = await firebaseAdapter.getItem(key);
          if (value) return value;
        } catch (error) {
          console.warn("Firebase get failed, using AsyncStorage:", error);
        }
      }
      return await asyncStorageAdapter.getItem(key);
    },

    setItem: async (key: string, value: string) => {
      if (firebaseAdapter) {
        try {
          await firebaseAdapter.setItem(key, value);
          return;
        } catch (error) {
          console.warn("Firebase set failed, using AsyncStorage:", error);
        }
      }
      await asyncStorageAdapter.setItem(key, value);
    },

    removeItem: async (key: string) => {
      if (firebaseAdapter) {
        try {
          await firebaseAdapter.removeItem(key);
          return;
        } catch (error) {
          console.warn("Firebase remove failed, using AsyncStorage:", error);
        }
      }
      await asyncStorageAdapter.removeItem(key);
    },

    subscribe: (key: string, callback: (value: any) => void) => {
      if (firebaseAdapter?.subscribe) {
        return firebaseAdapter.subscribe(key, callback);
      }
      return () => {};
    },
  };
};

// Global storage instance
let currentAdapter: StorageAdapter = asyncStorageAdapter;

export const setStorageAdapter = (adapter: StorageAdapter) => {
  currentAdapter = adapter;
};

export const getStorageAdapter = (): StorageAdapter => {
  return currentAdapter;
};

// Convenience functions
export const storageService = {
  getItem: (key: string) => currentAdapter.getItem(key),
  setItem: (key: string, value: string) => currentAdapter.setItem(key, value),
  removeItem: (key: string) => currentAdapter.removeItem(key),
  subscribe: (key: string, callback: (value: any) => void) =>
    currentAdapter.subscribe?.(key, callback) || (() => {}),
};
