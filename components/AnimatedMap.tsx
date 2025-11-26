import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

export function AnimatedMap() {
  const { theme, isDark } = useTheme();
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      -1,
      true
    );
  }, [animationProgress]);

  // Türkiye haritasında gezinen nokta pozisyonları
  // Batı (İstanbul) -> Doğu (Kars) -> Güney (Antalya) -> Kuzey (Rize) -> Batı
  const positions = [
    { x: 15, y: 35 },   // İstanbul
    { x: 75, y: 25 },   // Kars
    { x: 60, y: 80 },   // Antalya
    { x: 30, y: 15 },   // Rize
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const progress = animationProgress.value;
    
    // 4 pozisyon arasında smooth interpolation
    let index = Math.floor(progress * positions.length);
    let nextIndex = (index + 1) % positions.length;
    let segmentProgress = (progress * positions.length) % 1;

    const currentX = interpolate(
      segmentProgress,
      [0, 1],
      [positions[index].x, positions[nextIndex].x]
    );

    const currentY = interpolate(
      segmentProgress,
      [0, 1],
      [positions[index].y, positions[nextIndex].y]
    );

    return {
      transform: [
        { translateX: currentX },
        { translateY: currentY },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* Türkiye Haritası - Basit Şekil */}
      <View style={[styles.mapContainer, { backgroundColor: isDark ? "#1a2332" : "#f0f4f8" }]}>
        {/* Harita arka planı - Türkiye'nin yaklaşık şekli (oval) */}
        <View
          style={[
            styles.mapShape,
            {
              borderColor: theme.link,
              opacity: 0.3,
            },
          ]}
        />

        {/* Bölgeler - simgesel noktalar */}
        <View
          style={[
            styles.region,
            {
              left: "20%",
              top: "35%",
              backgroundColor: theme.link,
              opacity: 0.2,
            },
          ]}
        />
        <View
          style={[
            styles.region,
            {
              right: "15%",
              top: "20%",
              backgroundColor: theme.link,
              opacity: 0.15,
            },
          ]}
        />
        <View
          style={[
            styles.region,
            {
              right: "10%",
              bottom: "20%",
              backgroundColor: theme.link,
              opacity: 0.2,
            },
          ]}
        />
        <View
          style={[
            styles.region,
            {
              left: "10%",
              bottom: "15%",
              backgroundColor: theme.link,
              opacity: 0.15,
            },
          ]}
        />

        {/* Animasyonlu Işık Noktası */}
        <Animated.View
          style={[
            styles.lightPoint,
            {
              backgroundColor: theme.link,
              shadowColor: theme.link,
            },
            animatedStyle,
          ]}
        >
          {/* İç ışık */}
          <View
            style={[
              styles.innerGlow,
              {
                backgroundColor: theme.link,
              },
            ]}
          />
        </Animated.View>

        {/* Dış Glow */}
        <Animated.View
          style={[
            styles.lightGlow,
            {
              borderColor: theme.link,
            },
            animatedStyle,
          ]}
        />
      </View>

      {/* Durum Metni */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: theme.link,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  mapContainer: {
    width: 280,
    height: 180,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  mapShape: {
    position: "absolute",
    width: "85%",
    height: "75%",
    borderWidth: 2,
    borderRadius: 100,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 120,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 80,
    left: "7%",
    top: "12%",
  },
  region: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  lightPoint: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  innerGlow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    alignSelf: "center",
    marginTop: 4,
    opacity: 0.8,
  },
  lightGlow: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    opacity: 0.3,
    marginLeft: -12,
    marginTop: -12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
