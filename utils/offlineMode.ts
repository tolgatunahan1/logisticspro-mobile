/**
 * Offline Mode Support - AsyncStorage fallback for disconnected state
 * Caches recent data locally, allows limited functionality when offline
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const OFFLINE_DATA_PREFIX = "offline_data_";
const OFFLINE_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export interface CachedData {
  data: any;
  timestamp: number;
  expiresAt: number;
}

/**
 * Save data to offline cache
 */
export async function saveOfflineData(key: string, data: any): Promise<void> {
  try {
    const cacheKey = `${OFFLINE_DATA_PREFIX}${key}`;
    const cacheData: CachedData = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + OFFLINE_CACHE_EXPIRY,
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    // Silent fail - offline cache is best-effort
    console.warn("Failed to save offline data:", error);
  }
}

/**
 * Get cached offline data (if not expired)
 */
export async function getOfflineData(key: string): Promise<any | null> {
  try {
    const cacheKey = `${OFFLINE_DATA_PREFIX}${key}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (!cached) return null;

    const cacheData: CachedData = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() > cacheData.expiresAt) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.warn("Failed to get offline data:", error);
    return null;
  }
}

/**
 * Clear specific offline cache
 */
export async function clearOfflineData(key: string): Promise<void> {
  try {
    const cacheKey = `${OFFLINE_DATA_PREFIX}${key}`;
    await AsyncStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn("Failed to clear offline data:", error);
  }
}

/**
 * Clear all offline cache
 */
export async function clearAllOfflineData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const offlineKeys = keys.filter((key) => key.startsWith(OFFLINE_DATA_PREFIX));
    
    if (offlineKeys.length > 0) {
      await AsyncStorage.multiRemove(offlineKeys);
    }
  } catch (error) {
    console.warn("Failed to clear all offline data:", error);
  }
}

/**
 * Get all cached offline data (for sync operations)
 */
export async function getAllOfflineData(): Promise<Record<string, any>> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const offlineKeys = keys.filter((key) => key.startsWith(OFFLINE_DATA_PREFIX));
    
    const result: Record<string, any> = {};
    
    for (const key of offlineKeys) {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const cacheData: CachedData = JSON.parse(cached);
        
        // Only include non-expired cache
        if (Date.now() <= cacheData.expiresAt) {
          const originalKey = key.replace(OFFLINE_DATA_PREFIX, "");
          result[originalKey] = cacheData.data;
        }
      }
    }
    
    return result;
  } catch (error) {
    console.warn("Failed to get all offline data:", error);
    return {};
  }
}
