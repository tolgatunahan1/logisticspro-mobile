import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

import { ThemedText } from "./ThemedText";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "../constants/theme";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function FormProgress({ currentStep, totalSteps }: FormProgressProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring((currentStep / totalSteps) * 100, {
      damping: 15,
      mass: 0.8,
      stiffness: 150,
    });
  }, [currentStep, totalSteps]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.progressBar,
          { backgroundColor: colors.border },
        ]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: Colors.light.link },
            progressAnimatedStyle,
          ]}
        />
      </View>
      <ThemedText type="small" style={[styles.label, { color: colors.textSecondary }]}>
        Adım {currentStep} / {totalSteps}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
  },
});
