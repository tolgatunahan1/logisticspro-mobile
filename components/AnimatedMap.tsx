import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { useTheme } from "../hooks/useTheme";
import { ThemedText } from "./ThemedText";

export function AnimatedMap() {
  const { theme, isDark } = useTheme();
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [animationProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      animationProgress.value,
      [0, 1],
      [-150, 150],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      animationProgress.value,
      [0, 0.2, 0.8, 1],
      [0, 1, 1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      {/* Akan LogisticsPRO Yazısı */}
      <View style={styles.textWrapper}>
        <Animated.View style={animatedStyle}>
          <ThemedText
            type="h1"
            style={[
              styles.animatedText,
              {
                color: theme.link,
              },
            ]}
          >
            LogisticsPRO
          </ThemedText>
        </Animated.View>
      </View>

      {/* Alt dekoratif çizgi */}
      <View
        style={[
          styles.decorativeLine,
          {
            backgroundColor: theme.link,
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
    gap: 12,
  },
  textWrapper: {
    width: 280,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  animatedText: {
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
  },
  decorativeLine: {
    height: 3,
    width: 120,
    borderRadius: 1.5,
    marginTop: 8,
  },
});
