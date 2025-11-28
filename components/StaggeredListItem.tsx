import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

interface StaggeredListItemProps {
  index: number;
  children: React.ReactNode;
}

const springConfig = {
  damping: 15,
  mass: 0.8,
  stiffness: 150,
  overshootClamping: false,
};

const STAGGER_DELAY = 50; // ms between each item

export function StaggeredListItem({ index, children }: StaggeredListItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const delay = index * STAGGER_DELAY;
    const timer = setTimeout(() => {
      opacity.value = withSpring(1, springConfig);
      translateY.value = withSpring(0, springConfig);
    }, delay);

    return () => clearTimeout(timer);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
