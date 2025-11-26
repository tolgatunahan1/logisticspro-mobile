import { Platform } from "react-native";

export const isWeb = Platform.OS === "web";
export const isNative = Platform.OS === "ios" || Platform.OS === "android";
export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";

/**
 * Platform.select wrapper with fallback
 * Useful for features that work differently across web/native
 */
export function selectPlatform<T>(config: {
  web?: T;
  native?: T;
  ios?: T;
  android?: T;
  default: T;
}): T {
  if (isIOS && config.ios) return config.ios;
  if (isAndroid && config.android) return config.android;
  if (isWeb && config.web) return config.web;
  if (isNative && config.native) return config.native;
  return config.default;
}

export const supportsNotifications = isNative;
export const supportsGestures = isNative;

export function logPlatform() {
  if (__DEV__) {
    console.log(`✅ Platform: ${Platform.OS}${isWeb ? ' (WEB)' : isNative ? ' (NATIVE)' : ''}`);
  }
}
