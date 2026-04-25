import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Markdown from "react-native-markdown-display";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Message } from "../types/chat";

interface Props {
  message: Message;
}

const markdownStyles = {
  body: { color: "#fafafa", fontSize: 15, lineHeight: 22 },
  heading1: { color: "#fafafa", fontSize: 20, fontWeight: "700" as const, marginTop: 12, marginBottom: 4 },
  heading2: { color: "#fafafa", fontSize: 17, fontWeight: "700" as const, marginTop: 10, marginBottom: 4 },
  heading3: { color: "#a1a1aa", fontSize: 15, fontWeight: "600" as const, marginTop: 8, marginBottom: 2 },
  strong: { color: "#e4e4e7", fontWeight: "700" as const },
  em: { color: "#a1a1aa" },
  link: { color: "#818cf8" },
  blockquote: {
    backgroundColor: "#27272a",
    borderLeftColor: "#6366f1",
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginVertical: 6,
  },
  code_inline: {
    backgroundColor: "#27272a",
    color: "#818cf8",
    fontFamily: "monospace",
    borderRadius: 4,
    paddingHorizontal: 4,
    fontSize: 13,
  },
  fence: {
    backgroundColor: "#18181b",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  code_block: {
    color: "#a5b4fc",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
  },
  bullet_list: { marginVertical: 4 },
  ordered_list: { marginVertical: 4 },
  list_item: { marginVertical: 2 },
  hr: { backgroundColor: "#3f3f46", height: 1, marginVertical: 10 },
  table: { borderWidth: 1, borderColor: "#3f3f46", marginVertical: 8 },
  th: { backgroundColor: "#27272a", color: "#fafafa", fontWeight: "700" as const, padding: 8 },
  td: { color: "#a1a1aa", padding: 8, borderTopWidth: 1, borderTopColor: "#3f3f46" },
};

export const ChatMessage = React.memo(({ message }: Props) => {
  const isUser = message.role === "user";

  const translateY = useSharedValue(16);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 250 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animStyle}
      className={`mx-4 mb-3 max-w-[88%] ${isUser ? "self-end" : "self-start"}`}
    >
      {isUser ? (
        /* ── USER bubble ── */
        <View className="bg-accent rounded-2xl rounded-br-sm px-4 py-3">
          <Text className="text-white text-[15px] leading-[22px]">
            {message.content}
          </Text>
        </View>
      ) : (
        /* ── ASSISTANT bubble ── */
        <View
          className="bg-surface-muted rounded-2xl rounded-bl-sm px-4 py-3"
          style={{
            borderWidth: 1,
            borderColor: "#27272a",
          }}
        >
          <Markdown style={markdownStyles}>{message.content}</Markdown>
        </View>
      )}

      {/* Timestamp */}
      <Text
        className={`text-[11px] text-text-muted mt-1 ${
          isUser ? "text-right" : "text-left"
        }`}
      >
        {new Date(message.timestamp).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </Animated.View>
  );
});