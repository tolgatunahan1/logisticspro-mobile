import React from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface LiftPressableProps extends PressableProps {
  children: React.ReactNode;
  liftDistance?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const springConfig = {
  damping: 12,
  mass: 0.8,
  stiffness: 150,
  overshootClamping: false,
};

export function LiftPressable({
  children,
  liftDistance = 8,
  onPress,
  style,
  ...props
}: LiftPressableProps) {
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={() => {
        translateY.value = withSpring(-liftDistance, springConfig);
      }}
      onPressOut={() => {
        translateY.value = withSpring(0, springConfig);
      }}
      onPress={onPress}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
