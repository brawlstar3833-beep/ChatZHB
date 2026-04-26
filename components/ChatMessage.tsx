// Компонент сообщения с поддержкой изображений
import React, { useEffect, useRef } from "react";
import { Animated, View, Text, Image, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { Message } from "../types/chat";

interface Props {
  message: Message;
  colors: any;
}

export const ChatMessage = React.memo(({ message, colors }: Props) => {
  const isUser = message.role === "user";

  // Анимация появления
  const translateY = useRef(new Animated.Value(12)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Стили Markdown — зависят от текущей темы
  const markdownStyles = StyleSheet.create({
    body: { color: colors.aiText, fontSize: 15, lineHeight: 22 },
    heading1: {
      color: colors.aiText,
      fontSize: 20,
      fontWeight: "700",
      marginTop: 10,
      marginBottom: 4,
    },
    heading2: {
      color: colors.aiText,
      fontSize: 17,
      fontWeight: "700",
      marginTop: 8,
      marginBottom: 4,
    },
    heading3: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: "600",
      marginTop: 6,
    },
    strong: { color: colors.aiText, fontWeight: "700" },
    em: { color: colors.textSecondary },
    link: { color: colors.accent },
    blockquote: {
      backgroundColor: colors.bgCard,
      borderLeftColor: colors.accent,
      borderLeftWidth: 3,
      paddingLeft: 10,
      marginVertical: 6,
    },
    code_inline: {
      backgroundColor: colors.bgCard,
      color: colors.accent,
      fontFamily: "monospace",
      borderRadius: 4,
      paddingHorizontal: 4,
      fontSize: 13,
    },
    fence: {
      backgroundColor: colors.bg,
      borderRadius: 10,
      padding: 12,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    code_block: {
      color: colors.accent,
      fontFamily: "monospace",
      fontSize: 13,
      lineHeight: 20,
    },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    list_item: { marginVertical: 2 },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: 10,
    },
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        marginHorizontal: 16,
        marginBottom: 10,
        maxWidth: "88%",
        alignSelf: isUser ? "flex-end" : "flex-start",
      }}
    >
      {/* Прикреплённое изображение */}
      {message.image && (
        <Image
          source={{ uri: message.image.uri }}
          style={[
            styles.attachedImage,
            {
              alignSelf: isUser ? "flex-end" : "flex-start",
              borderColor: colors.border,
            },
          ]}
          resizeMode="cover"
        />
      )}

      {/* Пузырь сообщения */}
      {message.content ? (
        <View
          style={[
            styles.bubble,
            isUser
              ? {
                  backgroundColor: colors.userBubble,
                  borderBottomRightRadius: 4,
                }
              : {
                  backgroundColor: colors.aiBubble,
                  borderBottomLeftRadius: 4,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
          ]}
        >
          {isUser ? (
            <Text style={[styles.userText, { color: colors.userText }]}>
              {message.content}
            </Text>
          ) : (
            <Markdown style={markdownStyles}>{message.content}</Markdown>
          )}
        </View>
      ) : null}

      {/* Время */}
      <Text
        style={[
          styles.timestamp,
          {
            color: colors.textMuted,
            textAlign: isUser ? "right" : "left",
          },
        ]}
      >
        {new Date(message.timestamp).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
  },
  attachedImage: {
    width: 220,
    height: 160,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 3,
  },
});
