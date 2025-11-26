import { Platform } from "react-native";

export const isWeb = Platform.OS === "web";
export const isNative = Platform.OS === "ios" || Platform.OS === "android";
export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";

export const supportsNotifications = isNative;
export const supportsGestures = isNative;

export function logPlatform() {
  if (__DEV__) {
    console.log(`✅ Platform: ${Platform.OS}${isWeb ? ' (WEB)' : isNative ? ' (NATIVE)' : ''}`);
  }
}
