import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const Dot = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity }}
      className="w-2 h-2 rounded-full bg-accent mx-0.5"
    />
  );
};

export const TypingIndicator = () => (
  <View className="flex-row items-center px-4 py-3 mx-4 mb-2 rounded-2xl rounded-bl-sm bg-surface-muted self-start">
    <Dot delay={0} />
    <Dot delay={160} />
    <Dot delay={320} />
  </View>
);