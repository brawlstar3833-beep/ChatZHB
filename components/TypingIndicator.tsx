// Индикатор "Gemini думает..."
import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";

interface Props {
  colors: any;
}

const Dot = ({ delay, color }: { delay: number; color: string }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: -5,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.delay(200),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: color,
        marginHorizontal: 2,
      }}
    />
  );
};

export const TypingIndicator = ({ colors }: Props) => (
  <View style={[styles.container, { backgroundColor: colors.aiBubble }]}>
    <Text style={[styles.label, { color: colors.textMuted }]}>
      Gemini думает
    </Text>
    <View style={styles.dots}>
      <Dot delay={0} color={colors.accent} />
      <Dot delay={150} color={colors.accent} />
      <Dot delay={300} color={colors.accent} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 13,
    marginRight: 6,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
  },
});
