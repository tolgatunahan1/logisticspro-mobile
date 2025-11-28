import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, TextInput, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "./ThemedText";
import { useTheme } from "../hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "../constants/theme";

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  success?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
}

const springConfig: WithSpringConfig = {
  damping: 12,
  mass: 0.8,
  stiffness: 150,
  overshootClamping: false,
};

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  success,
  keyboardType = "default",
  editable = true,
  onFocus,
  onBlur,
  multiline = false,
  numberOfLines = 1,
}: FormInputProps) {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const colors = isDark ? Colors.dark : Colors.light;
  
  // Animations
  const labelScale = useSharedValue(1);
  const labelTranslateY = useSharedValue(0);
  const shakeOffset = useSharedValue(0);
  const successScale = useSharedValue(0);

  // Error shake animation
  useEffect(() => {
    if (error) {
      shakeOffset.value = withSpring(5, {
        damping: 10,
        mass: 0.5,
        stiffness: 200,
      });
      setTimeout(() => {
        shakeOffset.value = withSpring(0, {
          damping: 10,
          mass: 0.5,
          stiffness: 200,
        });
      }, 200);
    }
  }, [error]);

  // Success checkmark animation
  useEffect(() => {
    if (success && !error) {
      successScale.value = withSpring(1, springConfig);
    } else {
      successScale.value = withSpring(0, springConfig);
    }
  }, [success, error]);

  // Floating label animation
  useEffect(() => {
    if (isFocused || value.length > 0) {
      labelScale.value = withSpring(0.85, springConfig);
      labelTranslateY.value = withSpring(-12, springConfig);
    } else {
      labelScale.value = withSpring(1, springConfig);
      labelTranslateY.value = withSpring(0, springConfig);
    }
  }, [isFocused, value]);

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: labelScale.value },
      { translateY: labelTranslateY.value },
    ],
    opacity: interpolate(labelScale.value, [1, 0.85], [0.6, 1], Extrapolate.CLAMP),
  }));

  const shakeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const borderColor = error
    ? colors.destructive
    : success
    ? colors.success
    : isFocused
    ? theme.link
    : colors.border;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Animated.View style={labelAnimatedStyle}>
          <ThemedText
            type="small"
            style={[
              styles.label,
              {
                color: error ? colors.destructive : isFocused ? theme.link : colors.textSecondary,
              },
            ]}
          >
            {label}
          </ThemedText>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: colors.backgroundDefault,
          },
          shakeAnimatedStyle,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              paddingRight: success ? 40 : Spacing.lg,
            },
          ]}
          placeholder={placeholder || label}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize="none"
        />
        
        {/* Success Checkmark */}
        {success && !error && (
          <Animated.View
            style={[styles.iconContainer, successAnimatedStyle]}
          >
            <Feather name="check-circle" size={20} color={colors.success} />
          </Animated.View>
        )}

        {/* Error Icon */}
        {error && (
          <View style={styles.iconContainer}>
            <Feather name="alert-circle" size={20} color={colors.destructive} />
          </View>
        )}
      </Animated.View>

      {/* Error Message */}
      {error && (
        <ThemedText type="small" style={[styles.errorText, { color: colors.destructive }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  labelContainer: {
    height: 20,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  label: {
    fontWeight: "600",
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 0,
  },
  iconContainer: {
    position: "absolute",
    right: Spacing.lg,
    top: "50%",
    marginTop: -10,
  },
  errorText: {
    marginTop: Spacing.xs,
    fontWeight: "500",
  },
});
