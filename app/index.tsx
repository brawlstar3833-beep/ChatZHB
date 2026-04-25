import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send, Sparkles, Trash2 } from "lucide-react-native";

import { sendMessage, AIMessage } from "../api/ai";
import { ChatMessage } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";
import { Message } from "../types/chat";

const WELCOME_ID = "welcome";

const welcomeMessage: Message = {
  id: WELCOME_ID,
  role: "assistant",
  content:
    "## Привет! Я твой AI-ассистент 👋\n\nЯ использую модель **Llama 3.3 70B** от Groq.\n\nМогу помочь с:\n- 💡 Вопросами и объяснениями\n- 💻 Написанием и разбором кода\n- 📝 Текстами и аналитикой\n\nЧем займёмся?",
  timestamp: Date.now(),
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const hasText = input.trim().length > 0;

  const scrollToBottom = useCallback((delay = 80) => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, delay);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    scrollToBottom(60);

    const history: AIMessage[] = [...messages, userMsg]
      .filter((m) => m.id !== WELCOME_ID)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    try {
      const reply = await sendMessage(history);

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `**Ошибка:** ${
          err instanceof Error ? err.message : "Что-то пошло не так."
        }`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      scrollToBottom(100);
    }
  }, [input, isTyping, messages, scrollToBottom]);

  const handleClear = useCallback(() => {
    setMessages([welcomeMessage]);
    setInput("");
    setIsTyping(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={20} color="#6366f1" />
          <Text style={styles.headerTitle}>Gemini Clone</Text>
        </View>
        <Pressable
          onPress={handleClear}
          style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.5 }]}
          accessibilityLabel="Очистить чат"
        >
          <Trash2 size={18} color="#52525b" />
        </Pressable>
      </View>

      {/* ── Messages + Input ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollToBottom(0)}
        >
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
        </ScrollView>

        {/* ── Input Bar ── */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Напиши сообщение..."
              placeholderTextColor="#52525b"
              value={input}
              onChangeText={setInput}
              multiline
              returnKeyType="default"
            />
          </View>

          <Pressable
            onPress={handleSend}
            disabled={!hasText || isTyping}
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  hasText && !isTyping ? "#6366f1" : "#27272a",
              },
            ]}
            accessibilityLabel="Отправить"
          >
            {isTyping ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Send
                size={20}
                color={hasText ? "#ffffff" : "#52525b"}
                strokeWidth={2}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fafafa",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginLeft: 8,
  },
  clearBtn: {
    padding: 8,
    borderRadius: 12,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    backgroundColor: "#09090b",
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#18181b",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    maxHeight: 120,
    justifyContent: "center",
  },
  textInput: {
    color: "#fafafa",
    fontSize: 15,
    lineHeight: 22,
    paddingTop: 4,
    paddingBottom: 4,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
