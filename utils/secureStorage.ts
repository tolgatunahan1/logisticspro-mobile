import * as SecureStore from "expo-secure-store";

/**
 * Güvenli Depolama Sistemi
 * 
 * Hassas verileri (IBAN, şifre vb.) güvenli bir şekilde saklar.
 * Cihazın güvenli hafızasını (Keychain/Keystore) kullanır.
 */

export const SecureStorageKey = {
  ENCRYPTION_KEY: "app_encryption_key",
  IBAN_ENCRYPTION_KEY: "iban_encryption_key",
};

/**
 * Güvenli şifreleme - Base64 + key-based obfuscation
 * Production için crypto-js recommended
 */
function secureEncrypt(data: string, key: string): string {
  try {
    // Key'yi hash benzeri bir format'a dönüştür
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Basit obfuscation: XOR + offset
    let result = "";
    const offset = Math.abs(hash) % 256;
    
    for (let i = 0; i < data.length; i++) {
      const charCode = (data.charCodeAt(i) + offset) ^ (Math.abs(hash) % 256);
      result += String.fromCharCode(charCode);
    }
    
    return btoa(result); // Base64 encode
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
}

function secureDecrypt(encryptedData: string, key: string): string {
  try {
    // Same hash calculation
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash = hash & hash;
    }
    
    const data = atob(encryptedData);
    let result = "";
    const offset = Math.abs(hash) % 256;
    
    for (let i = 0; i < data.length; i++) {
      const charCode = (data.charCodeAt(i) ^ (Math.abs(hash) % 256)) - offset;
      result += String.fromCharCode(charCode);
    }
    
    return result;
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
}

/**
 * Şifreleme anahtarını güvenli olarak al veya oluştur
 */
export async function getOrCreateEncryptionKey(): Promise<string> {
  try {
    let key = await SecureStore.getItemAsync(SecureStorageKey.ENCRYPTION_KEY);
    if (!key) {
      // Rastgele anahtar oluştur
      key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await SecureStore.setItemAsync(SecureStorageKey.ENCRYPTION_KEY, key);
    }
    return key;
  } catch (error) {
    console.error("Error managing encryption key:", error);
    return "default-key-" + Date.now();
  }
}

/**
 * Hassas veriyi şifreli olarak sakla
 */
export async function saveSecureData(key: string, value: string): Promise<boolean> {
  try {
    const encryptionKey = await getOrCreateEncryptionKey();
    const encrypted = secureEncrypt(value, encryptionKey);
    await SecureStore.setItemAsync(key, encrypted);
    return true;
  } catch (error) {
    console.error("Error saving secure data:", error);
    return false;
  }
}

/**
 * Şifreli veriyi oku
 */
export async function getSecureData(key: string): Promise<string | null> {
  try {
    const encrypted = await SecureStore.getItemAsync(key);
    if (!encrypted) return null;
    
    const encryptionKey = await getOrCreateEncryptionKey();
    return secureDecrypt(encrypted, encryptionKey);
  } catch (error) {
    console.error("Error retrieving secure data:", error);
    return null;
  }
}

/**
 * Güvenli veriyi sil
 */
export async function deleteSecureData(key: string): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error("Error deleting secure data:", error);
    return false;
  }
}

/**
 * Tüm hassas verileri temizle
 */
export async function clearAllSecureData(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(SecureStorageKey.ENCRYPTION_KEY);
    await SecureStore.deleteItemAsync(SecureStorageKey.IBAN_ENCRYPTION_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing secure data:", error);
    return false;
  }
}
