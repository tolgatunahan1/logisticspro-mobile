import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";

const { width } = Dimensions.get("window");

export function AnimatedMap() {
  const { theme, isDark } = useTheme();
  const positionX = useSharedValue(10);
  const positionY = useSharedValue(20);

  useEffect(() => {
    // Yatay hareket (Batı -> Doğu -> Batı)
    positionX.value = withRepeat(
      withTiming(240, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Dikey hareket (Kuzey -> Güney -> Kuzey)
    positionY.value = withRepeat(
      withTiming(140, {
        duration: 3500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [positionX, positionY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: positionX.value },
      { translateY: positionY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Türkiye Haritası Konteyner */}
      <View
        style={[
          styles.mapContainer,
          {
            backgroundColor: isDark ? "#1a2a3a" : "#f0f4f9",
            borderColor: theme.link,
          },
        ]}
      >
        {/* Bölgeler - Türkiye'nin simgesel temsili */}
        
        {/* Karadeniz Bölgesi */}
        <View
          style={[
            styles.region,
            {
              top: 15,
              left: 30,
              width: 90,
              height: 25,
              borderRadius: 12,
              backgroundColor: theme.link,
              opacity: 0.08,
            },
          ]}
        />

        {/* Marmara Bölgesi */}
        <View
          style={[
            styles.region,
            {
              top: 25,
              left: 15,
              width: 40,
              height: 50,
              borderRadius: 20,
              backgroundColor: theme.link,
              opacity: 0.08,
            },
          ]}
        />

        {/* Ege Bölgesi */}
        <View
          style={[
            styles.region,
            {
              top: 50,
              left: 10,
              width: 35,
              height: 60,
              borderRadius: 18,
              backgroundColor: theme.link,
              opacity: 0.08,
            },
          ]}
        />

        {/* İç Anadolu Bölgesi */}
        <View
          style={[
            styles.region,
            {
              top: 45,
              left: 75,
              width: 70,
              height: 50,
              borderRadius: 15,
              backgroundColor: theme.link,
              opacity: 0.08,
            },
          ]}
        />

        {/* Akdeniz Bölgesi */}
        <View
          style={[
            styles.region,
            {
              top: 110,
              left: 60,
              width: 60,
              height: 30,
              borderRadius: 15,
              backgroundColor: theme.link,
              opacity: 0.08,
            },
          ]}
        />

        {/* Doğu Anadolu Bölgesi */}
        <View
          style={[
            styles.region,
            {
              top: 60,
              right: 15,
              width: 50,
              height: 45,
              borderRadius: 12,
              backgroundColor: theme.link,
              opacity: 0.08,
            },
          ]}
        />

        {/* Şehir Noktaları */}
        {/* İstanbul */}
        <View
          style={[
            styles.cityPoint,
            {
              top: 30,
              left: 20,
              backgroundColor: theme.link,
              opacity: 0.6,
            },
          ]}
        />

        {/* Ankara */}
        <View
          style={[
            styles.cityPoint,
            {
              top: 65,
              left: 100,
              backgroundColor: theme.link,
              opacity: 0.5,
            },
          ]}
        />

        {/* İzmir */}
        <View
          style={[
            styles.cityPoint,
            {
              top: 85,
              left: 25,
              backgroundColor: theme.link,
              opacity: 0.5,
            },
          ]}
        />

        {/* Antalya */}
        <View
          style={[
            styles.cityPoint,
            {
              top: 125,
              left: 85,
              backgroundColor: theme.link,
              opacity: 0.5,
            },
          ]}
        />

        {/* Harita Sınırı */}
        <View
          style={[
            styles.mapBorder,
            {
              borderColor: theme.link,
            },
          ]}
        />

        {/* Animasyonlu Işık Noktası */}
        <Animated.View style={[styles.lightPoint, animatedStyle]}>
          <View
            style={[
              styles.lightCircle,
              {
                backgroundColor: theme.link,
                shadowColor: theme.link,
              },
            ]}
          />
          <View
            style={[
              styles.lightGlow,
              {
                borderColor: theme.link,
              },
            ]}
          />
        </Animated.View>
      </View>

      {/* Alt Bilgi */}
      <View style={styles.footer}>
        <Feather name="navigation" size={14} color={theme.link} />
        <ThemedText type="small" style={{ color: theme.link, fontWeight: "500" }}>
          Türkiye Ağı
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  mapContainer: {
    width: 300,
    height: 190,
    borderRadius: 20,
    borderWidth: 2,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  region: {
    position: "absolute",
  },
  cityPoint: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  mapBorder: {
    position: "absolute",
    top: 25,
    left: 10,
    width: 280,
    height: 140,
    borderWidth: 1.5,
    borderRadius: 30,
    opacity: 0.2,
  },
  lightPoint: {
    position: "absolute",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  lightCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
  },
  lightGlow: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    opacity: 0.4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
