import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send, Sparkles, Trash2 } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { sendMessage, AIMessage } from "../api/ai";
import { ChatMessage } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";
import { Message } from "../types/chat";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const listRef = useRef<FlashList<Message | "typing">>(null);

  // ─── Send button scale animation ───
  const sendScale = useSharedValue(1);
  const sendAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const hasText = input.trim().length > 0;

  // ─── Scroll to bottom helper ───
  const scrollToBottom = useCallback((delay = 80) => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, delay);
  }, []);

  // ─── Send message ───
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    // Press animation
    sendScale.value = withSpring(0.85, {}, () => {
      sendScale.value = withSpring(1);
    });

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

    // Build context for API (exclude welcome placeholder)
    const history: AIMessage[] = [...messages, userMsg]
      .filter((m) => m.id !== WELCOME_ID)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

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
        content: `**Ошибка:** ${err instanceof Error ? err.message : "Что-то пошло не так."}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      scrollToBottom(100);
    }
  }, [input, isTyping, messages, scrollToBottom]);

  // ─── Clear chat ───
  const handleClear = useCallback(() => {
    setMessages([welcomeMessage]);
    setInput("");
    setIsTyping(false);
  }, []);

  // ─── List data ───
  type ListItem = Message | "typing";
  const listData: ListItem[] = isTyping ? [...messages, "typing"] : messages;

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item === "typing") return <TypingIndicator />;
      return <ChatMessage message={item} />;
    },
    []
  );

  const keyExtractor = useCallback((item: ListItem) => {
    if (item === "typing") return "typing-indicator";
    return item.id;
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-surface-card">
        <View className="flex-row items-center gap-2">
          <Sparkles size={20} color="#6366f1" />
          <Text className="text-text-primary text-[17px] font-semibold tracking-wide">
            Gemini Clone
          </Text>
        </View>
        <Pressable
          onPress={handleClear}
          className="p-2 rounded-xl active:opacity-60"
          accessibilityLabel="Очистить чат"
        >
          <Trash2 size={18} color="#52525b" />
        </Pressable>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlashList
          ref={listRef}
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={80}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollToBottom(0)}
        />

        {/* ── Input Bar ── */}
        <View className="flex-row items-end gap-2 px-4 py-3 border-t border-surface-card bg-surface">
          <View className="flex-1 flex-row items-end bg-surface-muted rounded-2xl border border-surface-card px-4 py-2 min-h-[48px]">
            <TextInput
              className="flex-1 text-text-primary text-[15px] leading-[22px] max-h-[120px]"
              placeholder="Напиши сообщение..."
              placeholderTextColor="#52525b"
              value={input}
              onChangeText={setInput}
              multiline
              returnKeyType="default"
              style={{ paddingTop: 4, paddingBottom: 4 }}
            />
          </View>

          {/* Send button */}
          <AnimatedPressable
            style={sendAnimStyle}
            onPress={handleSend}
            disabled={!hasText || isTyping}
            accessibilityLabel="Отправить"
            className={`w-[48px] h-[48px] rounded-2xl items-center justify-center ${
              hasText && !isTyping ? "bg-accent" : "bg-surface-card"
            }`}
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
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}