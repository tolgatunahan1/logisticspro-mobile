import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { ThemedText } from "./ThemedText";

interface AnimatedCounterProps {
  value: number;
  type?: "h2" | "h3" | "h4";
  style?: any;
}

const springConfig = {
  damping: 15,
  mass: 1,
  stiffness: 100,
  overshootClamping: false,
};

export function AnimatedCounter({ value, type = "h3", style }: AnimatedCounterProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withSpring(value, springConfig);
  }, [value]);

  return (
    <ThemedText type={type} style={[{ fontWeight: "700" }, style]}>
      {Math.round(value)}
    </ThemedText>
  );
}

const styles = StyleSheet.create({});
