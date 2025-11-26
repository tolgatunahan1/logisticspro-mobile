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
 * Basit XOR şifreleme (demo amaçlı)
 * Gerçek uygulamada: TweetNaCl.js veya crypto-js kullanılması önerilir
 */
function simpleEncrypt(data: string, key: string): string {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 encode
}

function simpleDecrypt(encryptedData: string, key: string): string {
  try {
    const data = atob(encryptedData); // Base64 decode
    let result = "";
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
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
    const encrypted = simpleEncrypt(value, encryptionKey);
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
    return simpleDecrypt(encrypted, encryptionKey);
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
