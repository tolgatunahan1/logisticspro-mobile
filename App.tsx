import React from "react";
import { StyleSheet, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";

import RootNavigator from "./navigation/RootNavigator";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { logPlatform, isWeb } from "./utils/platform";

// Suppress unnecessary console warnings/logs for Replit performance
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString?.() || '';
    // Suppress known harmless warnings
    if (
      message.includes('shadow') ||
      message.includes('pointerEvents') ||
      message.includes('Non-serializable values') ||
      message.includes('ViewPropTypes')
    ) {
      return;
    }
    originalWarn(...args);
  };
}

// Notifications only work on native platforms (iOS/Android)
if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export default function App() {
  React.useEffect(() => {
    logPlatform();
    
    if (typeof document !== 'undefined') {
      // Prevent pinch zoom
      const preventPinch = (e: any) => {
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      };

      // Add global CSS to prevent input auto-zoom on focus
      const style = document.createElement('style');
      style.textContent = `
        input, textarea, select {
          font-size: 16px !important;
        }
        input:focus, textarea:focus, select:focus {
          font-size: 16px !important;
        }
      `;
      document.head.appendChild(style);

      document.addEventListener('touchmove', preventPinch, { passive: false });
      return () => document.removeEventListener('touchmove', preventPinch);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <KeyboardProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
              <StatusBar style="auto" />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
