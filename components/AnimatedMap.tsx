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
import { ThemedText } from "@/components/ThemedText";

export function AnimatedMap() {
  const { theme, isDark } = useTheme();
  const positionX = useSharedValue(80);
  const positionY = useSharedValue(45);

  useEffect(() => {
    // Yatay hareket (Batı -> Doğu -> Batı)
    positionX.value = withRepeat(
      withTiming(180, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Dikey hareket (Kuzey -> Güney -> Kuzey)
    positionY.value = withRepeat(
      withTiming(100, {
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
      {/* Türkiye Haritası Şekli - Çerçeve olarak */}
      <View
        style={[
          styles.mapContainer,
          {
            backgroundColor: isDark ? "#1a2a3a" : "#f0f4f9",
          },
        ]}
      >
        {/* Türkiye Haritası Çerçevesi - Basitleştirilmiş Şekil */}
        
        {/* Kuzey Sınırı */}
        <View
          style={[
            styles.border,
            {
              top: 30,
              left: 50,
              width: 180,
              height: 15,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 50,
              backgroundColor: theme.link,
              opacity: 0.25,
            },
          ]}
        />

        {/* Batı Sınırı */}
        <View
          style={[
            styles.border,
            {
              left: 30,
              top: 45,
              width: 20,
              height: 80,
              borderRadius: 10,
              backgroundColor: theme.link,
              opacity: 0.25,
            },
          ]}
        />

        {/* Doğu Sınırı */}
        <View
          style={[
            styles.border,
            {
              right: 20,
              top: 50,
              width: 20,
              height: 70,
              borderRadius: 10,
              backgroundColor: theme.link,
              opacity: 0.25,
            },
          ]}
        />

        {/* Güney Sınırı */}
        <View
          style={[
            styles.border,
            {
              bottom: 25,
              left: 55,
              width: 170,
              height: 15,
              borderBottomLeftRadius: 35,
              borderBottomRightRadius: 45,
              backgroundColor: theme.link,
              opacity: 0.25,
            },
          ]}
        />

        {/* İç Bölgeler - Az opacity ile */}
        {/* Karadeniz */}
        <View
          style={[
            styles.region,
            {
              top: 35,
              left: 70,
              width: 90,
              height: 20,
              backgroundColor: theme.link,
              opacity: 0.06,
              borderRadius: 10,
            },
          ]}
        />

        {/* Marmara */}
        <View
          style={[
            styles.region,
            {
              top: 45,
              left: 45,
              width: 45,
              height: 30,
              backgroundColor: theme.link,
              opacity: 0.06,
              borderRadius: 8,
            },
          ]}
        />

        {/* Ege */}
        <View
          style={[
            styles.region,
            {
              top: 60,
              left: 35,
              width: 35,
              height: 50,
              backgroundColor: theme.link,
              opacity: 0.06,
              borderRadius: 8,
            },
          ]}
        />

        {/* Akdeniz */}
        <View
          style={[
            styles.region,
            {
              bottom: 35,
              left: 80,
              width: 60,
              height: 25,
              backgroundColor: theme.link,
              opacity: 0.06,
              borderRadius: 8,
            },
          ]}
        />

        {/* Doğu */}
        <View
          style={[
            styles.region,
            {
              top: 65,
              right: 30,
              width: 50,
              height: 40,
              backgroundColor: theme.link,
              opacity: 0.06,
              borderRadius: 8,
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
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  border: {
    position: "absolute",
  },
  region: {
    position: "absolute",
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
