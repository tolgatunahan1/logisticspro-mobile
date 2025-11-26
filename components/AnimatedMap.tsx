import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

export function AnimatedMap() {
  const { theme, isDark } = useTheme();
  const translateX = useSharedValue(0);

  useEffect(() => {
    // Yatay hareket
    translateX.value = withRepeat(
      withTiming(100, {
        duration: 2500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Animasyonlu Tır */}
      <Animated.View style={[styles.truckContainer, animatedStyle]}>
        {/* Tır Görseli */}
        <View style={[styles.truck, { backgroundColor: theme.link }]}>
          <Feather name="truck" size={50} color="#FFFFFF" />
        </View>
      </Animated.View>

      {/* Yol */}
      <View
        style={[
          styles.road,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.08)",
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 20,
  },
  truckContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  truck: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  road: {
    height: 3,
    width: 240,
    borderRadius: 2,
  },
});
