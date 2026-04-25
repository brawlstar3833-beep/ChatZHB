import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const Dot = ({ delay }: { delay: number }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={style}
      className="w-2 h-2 rounded-full bg-accent mx-0.5"
    />
  );
};

export const TypingIndicator = () => (
  <View className="flex-row items-center px-4 py-3 mx-4 mb-2 rounded-2xl rounded-bl-sm bg-surface-muted self-start max-w-[80px]">
    <Dot delay={0} />
    <Dot delay={160} />
    <Dot delay={320} />
  </View>
);