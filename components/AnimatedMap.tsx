import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

export function AnimatedMap() {
  const { theme, isDark } = useTheme();
  const translateX = useSharedValue(0);

  useEffect(() => {
    // Yatay hareket
    translateX.value = withRepeat(
      withTiming(90, {
        duration: 2800,
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
      <Animated.View style={[styles.truckWrapper, animatedStyle]}>
        <View style={styles.truck}>
          {/* Tır Kasası - Ana Gövde */}
          <View
            style={[
              styles.cargo,
              {
                backgroundColor: theme.link,
              },
            ]}
          >
            {/* Kasa Pencereleri */}
            <View style={styles.windowRow}>
              <View style={[styles.window, { opacity: 0.3 }]} />
              <View style={[styles.window, { opacity: 0.2 }]} />
            </View>
          </View>

          {/* Tır Kabini - Sürücü Bölümü */}
          <View
            style={[
              styles.cabin,
              {
                backgroundColor: theme.link,
              },
            ]}
          >
            {/* Kabin Penceresi */}
            <View style={[styles.cabinWindow, { opacity: 0.4 }]} />
          </View>

          {/* Ön Tamponu */}
          <View style={[styles.bumper, { backgroundColor: theme.link }]} />

          {/* Ön Tekerlekler - Çift */}
          <View style={styles.wheelAxle}>
            <View style={[styles.wheel, { borderColor: theme.link }]} />
            <View style={[styles.wheel, { borderColor: theme.link }]} />
          </View>

          {/* Arka Tekerlekler - Dörtlü */}
          <View style={styles.rearWheels}>
            <View style={styles.wheelPair}>
              <View style={[styles.wheel, { borderColor: theme.link }]} />
              <View style={[styles.wheel, { borderColor: theme.link }]} />
            </View>
            <View style={styles.wheelPair}>
              <View style={[styles.wheel, { borderColor: theme.link }]} />
              <View style={[styles.wheel, { borderColor: theme.link }]} />
            </View>
          </View>
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
    paddingVertical: 28,
    gap: 16,
  },
  truckWrapper: {
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  truck: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 60,
    backgroundColor: "transparent",
  },
  cargo: {
    width: 70,
    height: 48,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    justifyContent: "space-around",
  },
  windowRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  window: {
    width: 14,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 2,
  },
  cabin: {
    width: 38,
    height: 42,
    borderRadius: 6,
    justifyContent: "center",
    paddingLeft: 8,
    paddingTop: 8,
  },
  cabinWindow: {
    width: 18,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 3,
  },
  bumper: {
    width: 12,
    height: 8,
    borderRadius: 4,
    marginLeft: 2,
  },
  wheelAxle: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 8,
    alignItems: "flex-end",
  },
  rearWheels: {
    flexDirection: "row",
    gap: 6,
    marginLeft: 4,
    alignItems: "flex-end",
  },
  wheelPair: {
    flexDirection: "row",
    gap: 4,
  },
  wheel: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2.5,
  },
  road: {
    height: 3,
    width: 260,
    borderRadius: 1.5,
  },
});
