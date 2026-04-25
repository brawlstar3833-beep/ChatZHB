import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const Dot = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#6366f1",
        marginHorizontal: 2,
      }}
    />
  );
};

export const TypingIndicator = () => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 16,
      borderBottomLeftRadius: 4,
      backgroundColor: "#18181b",
      alignSelf: "flex-start",
    }}
  >
    <Dot delay={0} />
    <Dot delay={160} />
    <Dot delay={320} />
  </View>
);
