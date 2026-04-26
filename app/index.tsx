// Главный экран Zhan AI 2.0
import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings, Send, Image as ImageIcon, Mic, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ChatMessage } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";
import { SettingsModal } from "../components/SettingsModal";
import { useChat } from "../hooks/useChat";
import { useTheme } from "../hooks/useTheme";
import { Theme, ImageAttachment } from "../types/chat";

const THEME_STORAGE_KEY = "@zhan_ai_theme";

export default function ChatScreen() {
  const [themePreference, setThemePreference] = useState<Theme>("dark");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [input, setInput] = useState("");
  const [attachedImage, setAttachedImage] = useState<ImageAttachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const { colors } = useTheme(themePreference);
  const { messages, isTyping, isLoaded, sendMessage, clearHistory } = useChat();

  const hasContent = input.trim().length > 0 || attachedImage !== null;

  // --- Загрузка сохранённой темы ---
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved) setThemePreference(saved as Theme);
      })
      .catch(() => {});
  }, []);

  // --- Сохранение темы при изменении ---
  const handleThemeChange = useCallback((t: Theme) => {
    setThemePreference(t);
    AsyncStorage.setItem(THEME_STORAGE_KEY, t).catch(() => {});
  }, []);

  // --- Скролл вниз ---
  const scrollToBottom = useCallback((delay = 80) => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, delay);
  }, []);

  // --- Отправка сообщения ---
  const handleSend = useCallback(async () => {
    if (!hasContent || isTyping) return;
    const text = input;
    const image = attachedImage ?? undefined;
    setInput("");
    setAttachedImage(null);
    scrollToBottom(60);
    await sendMessage(text, image);
    scrollToBottom(120);
  }, [hasContent, isTyping, input, attachedImage, sendMessage, scrollToBottom]);

  // --- Выбор изображения ---
  const handlePickImage = useCallback(async () => {
    // Запрашиваем разрешение
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Нет доступа",
        "Разреши доступ к галерее в настройках телефона."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true, // Нужен для отправки в Gemini
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert("Ошибка", "Не удалось получить данные изображения.");
        return;
      }
      setAttachedImage({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: "image/jpeg",
      });
    }
  }, []);

  // --- Камера ---
  const handleCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Нет доступа", "Разреши доступ к камере в настройках.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (!asset.base64) return;
      setAttachedImage({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: "image/jpeg",
      });
    }
  }, []);

  // --- Голосовой ввод (заглушка — показывает инструкцию) ---
  const handleVoice = useCallback(() => {
    Alert.alert(
      "Голосовой ввод",
      "Для голосового ввода нажми на микрофон на клавиатуре телефона при вводе текста — это самый надёжный способ в Expo Go.\n\nПолноценный STT доступен в кастомной сборке.",
      [{ text: "Понятно" }]
    );
  }, []);

  // --- Выбор фото: галерея или камера ---
  const handleImagePress = useCallback(() => {
    Alert.alert("Прикрепить изображение", "Выбери источник:", [
      { text: "Галерея", onPress: handlePickImage },
      { text: "Камера", onPress: handleCamera },
      { text: "Отмена", style: "cancel" },
    ]);
  }, [handlePickImage, handleCamera]);

  if (!isLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.headerBorder,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          {/* Логотип */}
          <View style={[styles.logoCircle, { backgroundColor: colors.accentDim }]}>
            <Text style={[styles.logoText, { color: colors.accent }]}>Z</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.headerText }]}>
              Zhan AI
            </Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>
              2.0 · Gemini Flash
            </Text>
          </View>
        </View>

        {/* Кнопка настроек */}
        <Pressable
          onPress={() => setSettingsVisible(true)}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
        >
          <Settings size={20} color={colors.iconColor} />
        </Pressable>
      </View>

      {/* ── Чат + Инпут ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Список сообщений */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollToBottom(0)}
        >
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} colors={colors} />
          ))}
          {isTyping && <TypingIndicator colors={colors} />}
        </ScrollView>

        {/* Превью прикреплённого изображения */}
        {attachedImage && (
          <View
            style={[
              styles.imagePreviewContainer,
              { backgroundColor: colors.bgMuted, borderTopColor: colors.border },
            ]}
          >
            <Image
              source={{ uri: attachedImage.uri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <Pressable
              onPress={() => setAttachedImage(null)}
              style={[styles.removeImageBtn, { backgroundColor: colors.bgCard }]}
            >
              <X size={14} color={colors.textPrimary} />
            </Pressable>
            <Text style={[styles.imagePreviewLabel, { color: colors.textSecondary }]}>
              Изображение прикреплено
            </Text>
          </View>
        )}

        {/* ── Поле ввода ── */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.bg,
              borderTopColor: colors.border,
            },
          ]}
        >
          {/* Кнопка изображения */}
          <Pressable
            onPress={handleImagePress}
            style={({ pressed }) => [
              styles.iconBtn,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <ImageIcon
              size={22}
              color={attachedImage ? colors.accent : colors.iconColor}
            />
          </Pressable>

          {/* Кнопка микрофона */}
          <Pressable
            onPress={handleVoice}
            style={({ pressed }) => [
              styles.iconBtn,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Mic size={22} color={colors.iconColor} />
          </Pressable>

          {/* Текстовый инпут */}
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.inputText }]}
              placeholder="Напиши сообщение..."
              placeholderTextColor={colors.placeholder}
              value={input}
              onChangeText={setInput}
              multiline
              returnKeyType="default"
            />
          </View>

          {/* Кнопка отправки */}
          <Pressable
            onPress={handleSend}
            disabled={!hasContent || isTyping}
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  hasContent && !isTyping
                    ? colors.sendActive
                    : colors.sendInactive,
              },
            ]}
          >
            {isTyping ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Send
                size={18}
                color={
                  hasContent ? colors.sendIconActive : colors.sendIconInactive
                }
                strokeWidth={2}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* ── Модальное окно настроек ── */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        theme={themePreference}
        onThemeChange={handleThemeChange}
        onClearHistory={clearHistory}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerSub: {
    fontSize: 11,
    marginTop: 1,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
  },
  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 4,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: "center",
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
    paddingTop: 2,
    paddingBottom: 2,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  // Image preview
  imagePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  imagePreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  removeImageBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -20,
    marginTop: -30,
  },
  imagePreviewLabel: {
    fontSize: 13,
    flex: 1,
  },
});
