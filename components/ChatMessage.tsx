import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { Message } from "../types/chat";

interface Props {
  message: Message;
}

const markdownStyles = StyleSheet.create({
  body: { color: "#fafafa", fontSize: 15, lineHeight: 22 },
  heading1: {
    color: "#fafafa",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },
  heading2: {
    color: "#fafafa",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 4,
  },
  heading3: {
    color: "#a1a1aa",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 2,
  },
  strong: { color: "#e4e4e7", fontWeight: "700" },
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
  th: {
    backgroundColor: "#27272a",
    color: "#fafafa",
    fontWeight: "700",
    padding: 8,
  },
  td: {
    color: "#a1a1aa",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#3f3f46",
  },
});

export const ChatMessage = React.memo(({ message }: Props) => {
  const isUser = message.role === "user";

  const translateY = useRef(new Animated.Value(16)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        marginHorizontal: 16,
        marginBottom: 12,
        maxWidth: "88%",
        alignSelf: isUser ? "flex-end" : "flex-start",
      }}
    >
      {isUser ? (
        <View
          style={{
            backgroundColor: "#6366f1",
            borderRadius: 16,
            borderBottomRightRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 15, lineHeight: 22 }}>
            {message.content}
          </Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: "#18181b",
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: "#27272a",
          }}
        >
          <Markdown style={markdownStyles}>{message.content}</Markdown>
        </View>
      )}

      <Text
        style={{
          fontSize: 11,
          color: "#52525b",
          marginTop: 4,
          textAlign: isUser ? "right" : "left",
        }}
      >
        {new Date(message.timestamp).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </Animated.View>
  );
});
