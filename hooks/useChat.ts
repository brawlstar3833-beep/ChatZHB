// Хук для управления чатом с сохранением истории
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Message, ImageAttachment } from "../types/chat";
import { sendMessage as sendToGemini } from "../api/gemini";

const STORAGE_KEY = "@zhan_ai_chat_history";
const MAX_CONTEXT_MESSAGES = 20; // Максимум сообщений для контекста

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "## Привет! Я Zhan AI 2.0 👋\n\nРаботаю на базе **Google Gemini**.\n\nМогу помочь с:\n- 💡 Вопросами и объяснениями\n- 💻 Написанием кода\n- 🖼️ Анализом изображений\n- 📝 Текстами и аналитикой\n\nЧем займёмся?",
  timestamp: Date.now(),
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Загрузка истории при старте ---
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Message[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.warn("Ошибка загрузки истории:", e);
    } finally {
      setIsLoaded(true);
    }
  };

  // --- Сохранение истории при изменении ---
  const saveHistory = useCallback(async (msgs: Message[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch (e) {
      console.warn("Ошибка сохранения истории:", e);
    }
  }, []);

  // --- Отправка сообщения ---
  const sendMessage = useCallback(
    async (text: string, image?: ImageAttachment) => {
      if ((!text.trim() && !image) || isTyping) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
        image,
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsTyping(true);

      // Сохраняем историю с новым сообщением пользователя
      await saveHistory(updatedMessages);

      try {
        // Берём последние N сообщений для контекста (исключая welcome)
        const contextMessages = updatedMessages
          .filter((m) => m.id !== "welcome")
          .slice(-MAX_CONTEXT_MESSAGES);

        const reply = await sendToGemini(contextMessages, image);

        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
        };

        const finalMessages = [...updatedMessages, assistantMsg];
        setMessages(finalMessages);
        await saveHistory(finalMessages);
      } catch (err: unknown) {
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `**Ошибка:** ${
            err instanceof Error ? err.message : "Что-то пошло не так."
          }`,
          timestamp: Date.now(),
        };
        const withError = [...updatedMessages, errorMsg];
        setMessages(withError);
        await saveHistory(withError);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isTyping, saveHistory]
  );

  // --- Очистка истории ---
  const clearHistory = useCallback(async () => {
    const fresh = [WELCOME_MESSAGE];
    setMessages(fresh);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Ошибка очистки истории:", e);
    }
  }, []);

  return {
    messages,
    isTyping,
    isLoaded,
    sendMessage,
    clearHistory,
  };
}
