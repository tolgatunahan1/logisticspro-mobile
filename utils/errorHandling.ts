/**
 * Error handling utility - Maps Firebase and network errors to Turkish user-friendly messages
 * Non-invasive: Utility only, no side effects, safe to integrate incrementally
 */

export interface ErrorResult {
  isError: boolean;
  message: string;
  code?: string;
}

/**
 * Map Firebase error codes to Turkish messages
 */
function mapFirebaseError(error: any): ErrorResult {
  const errorCode = error?.code || error?.message || "";
  const errorMessage = error?.message || "";

  // Authentication errors
  if (errorCode.includes("auth/")) {
    if (errorCode === "auth/user-not-found") {
      return { isError: true, message: "Bu email adresi ile hesap bulunamadı", code: errorCode };
    }
    if (errorCode === "auth/wrong-password") {
      return { isError: true, message: "Email veya şifre yanlış", code: errorCode };
    }
    if (errorCode === "auth/email-already-in-use") {
      return { isError: true, message: "Bu email adresi zaten kayıtlı", code: errorCode };
    }
    if (errorCode === "auth/weak-password") {
      return { isError: true, message: "Şifre çok zayıf. En az 8 karakter olmalı", code: errorCode };
    }
    if (errorCode === "auth/invalid-email") {
      return { isError: true, message: "Geçersiz email adresi", code: errorCode };
    }
    if (errorCode === "auth/user-disabled") {
      return { isError: true, message: "Bu hesap devre dışı bırakılmıştır", code: errorCode };
    }
    if (errorCode === "auth/operation-not-allowed") {
      return { isError: true, message: "Bu işleme izin verilmiyor", code: errorCode };
    }
    if (errorCode === "auth/too-many-requests") {
      return { isError: true, message: "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin", code: errorCode };
    }
  }

  // Network/Connection errors
  if (
    errorMessage.includes("Network") ||
    errorMessage.includes("NETWORK") ||
    errorMessage.includes("offline") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("Failed to fetch")
  ) {
    return { isError: true, message: "İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin", code: "NETWORK_ERROR" };
  }

  // Firebase permission/rules errors
  if (errorCode.includes("permission-denied") || errorMessage.includes("Permission denied")) {
    return { isError: true, message: "Bu işleme yetkiniz yok. Lütfen admin ile iletişime geçin", code: "PERMISSION_DENIED" };
  }

  // Firebase configuration errors
  if (errorMessage.includes("Firebase yapılandırılmamış") || errorCode.includes("api-key-not-valid")) {
    return { isError: true, message: "Firebase kurulu değil. Lütfen yönetici ile iletişime geçin", code: "FIREBASE_CONFIG_ERROR" };
  }

  // Generic Firebase errors
  if (errorCode.includes("database/")) {
    return { isError: true, message: "Veritabanı hatası. Lütfen daha sonra tekrar deneyin", code: errorCode };
  }

  // Timeout
  if (errorMessage.includes("Timeout") || errorCode === "ETIMEDOUT") {
    return { isError: true, message: "İstek zaman aşımına uğradı. Lütfen bağlantınızı kontrol edin ve tekrar deneyin", code: "TIMEOUT" };
  }

  // Not found
  if (errorMessage.includes("404") || errorCode === "NOT_FOUND") {
    return { isError: true, message: "İstenen veri bulunamadı", code: "NOT_FOUND" };
  }

  // Server errors
  if (errorMessage.includes("500") || errorMessage.includes("502") || errorMessage.includes("503")) {
    return { isError: true, message: "Sunucu hatası. Lütfen daha sonra tekrar deneyin", code: "SERVER_ERROR" };
  }

  // Validation errors
  if (errorMessage.includes("validation") || errorCode === "VALIDATION_ERROR") {
    return { isError: true, message: "Girdilerinizi kontrol edin ve tekrar deneyin", code: "VALIDATION_ERROR" };
  }

  // Fallback: Unknown error
  if (errorMessage) {
    return { isError: true, message: `Hata: ${errorMessage.substring(0, 100)}`, code: errorCode };
  }

  return { isError: true, message: "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin", code: "UNKNOWN_ERROR" };
}

/**
 * Safe error handler - Wraps error mapping with fallback
 */
export function handleError(error: any): ErrorResult {
  try {
    // Null/undefined check
    if (!error) {
      return { isError: false, message: "" };
    }

    // Map Firebase/network errors
    const mapped = mapFirebaseError(error);
    return mapped;
  } catch (fallbackError) {
    // Last resort - should never happen, but safe
    return { isError: true, message: "Hata işleme hatası oluştu", code: "HANDLER_ERROR" };
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  const errorMessage = error?.message || "";
  return (
    errorMessage.includes("Network") ||
    errorMessage.includes("offline") ||
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("NETWORK") ||
    error?.code === "NETWORK_ERROR"
  );
}

/**
 * Check if error is a timeout
 */
export function isTimeoutError(error: any): boolean {
  const errorMessage = error?.message || "";
  return errorMessage.includes("Timeout") || errorMessage.includes("timeout") || error?.code === "ETIMEDOUT";
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: any): boolean {
  return error?.code?.includes("permission-denied") || error?.message?.includes("Permission denied");
}

/**
 * Check if error is retriable (should be retried with backoff)
 */
export function isRetriableError(error: any): boolean {
  const errorCode = error?.code || "";
  const errorMessage = error?.message || "";

  // Network errors are retriable
  if (isNetworkError(error) || isTimeoutError(error)) {
    return true;
  }

  // Firebase specific retriable errors
  if (
    errorCode === "auth/too-many-requests" ||
    errorCode === "database/unavailable" ||
    errorMessage.includes("503") ||
    errorMessage.includes("502")
  ) {
    return true;
  }

  return false;
}
