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
  const scale = useSharedValue(1);

  useEffect(() => {
    // Yatay hareket
    translateX.value = withRepeat(
      withTiming(120, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Ölçek pulse efekti
    scale.value = withRepeat(
      withTiming(1.08, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [translateX, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Mini Tır Animasyonu */}
      <Animated.View style={[styles.truckWrapper, animatedStyle]}>
        {/* Tır Kabini */}
        <View
          style={[
            styles.cabin,
            {
              backgroundColor: theme.link,
            },
          ]}
        >
          {/* Tır İkonu */}
          <Feather
            name="truck"
            size={40}
            color="#FFFFFF"
            style={styles.truckIcon}
          />
        </View>

        {/* Tır Kasası */}
        <View
          style={[
            styles.cargo,
            {
              backgroundColor: theme.link,
              opacity: 0.8,
            },
          ]}
        />

        {/* Ön Tekerlek */}
        <View
          style={[
            styles.wheel,
            styles.frontWheel,
            {
              borderColor: theme.link,
            },
          ]}
        />

        {/* Arka Tekerlek */}
        <View
          style={[
            styles.wheel,
            styles.rearWheel,
            {
              borderColor: theme.link,
            },
          ]}
        />
      </Animated.View>

      {/* Yol */}
      <View
        style={[
          styles.road,
          {
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
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
    paddingVertical: 24,
    gap: 16,
  },
  truckWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 0,
  },
  cabin: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  truckIcon: {
    textAlign: "center",
  },
  cargo: {
    width: 50,
    height: 25,
    borderRadius: 4,
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  wheel: {
    position: "absolute",
    borderWidth: 2.5,
    borderRadius: 50,
    bottom: -8,
  },
  frontWheel: {
    width: 14,
    height: 14,
    left: 18,
  },
  rearWheel: {
    width: 16,
    height: 16,
    right: 2,
  },
  road: {
    height: 4,
    width: 280,
    borderRadius: 2,
  },
});
