import React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import RootNavigator from "@/navigation/RootNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App() {
  React.useEffect(() => {
    // Web'de zoom'u engellemek
    if (typeof window !== 'undefined') {
      const preventZoom = (e: any) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      };

      const preventGesture = (e: any) => {
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      };

      document.addEventListener('wheel', preventZoom, { passive: false });
      document.addEventListener('touchmove', preventGesture, { passive: false });
      document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });

      return () => {
        document.removeEventListener('wheel', preventZoom);
        document.removeEventListener('touchmove', preventGesture);
        document.removeEventListener('gesturestart', (e) => e.preventDefault());
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardProvider>
            <AuthProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </AuthProvider>
            <StatusBar style="auto" />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
