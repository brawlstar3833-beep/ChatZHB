// Модальное окно настроек
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { X, Sun, Moon, Smartphone, Trash2 } from "lucide-react-native";
import { Theme } from "../types/chat";

interface Props {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  onClearHistory: () => void;
  colors: any;
}

const THEMES: { value: Theme; label: string; icon: any }[] = [
  { value: "light", label: "Светлая", icon: Sun },
  { value: "dark", label: "Тёмная", icon: Moon },
  { value: "system", label: "Системная", icon: Smartphone },
];

export const SettingsModal = ({
  visible,
  onClose,
  theme,
  onThemeChange,
  onClearHistory,
  colors,
}: Props) => {
  const handleClear = () => {
    Alert.alert(
      "Очистить историю?",
      "Все сообщения будут удалены. Это действие нельзя отменить.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Очистить",
          style: "destructive",
          onPress: () => {
            onClearHistory();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[styles.sheet, { backgroundColor: colors.modalBg, borderColor: colors.border }]}
        >
          {/* Заголовок */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
              Настройки
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.iconColor} />
            </Pressable>
          </View>

          {/* Тема */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ТЕМА
          </Text>
          <View
            style={[styles.themeRow, { backgroundColor: colors.bgMuted, borderColor: colors.border }]}
          >
            {THEMES.map(({ value, label, icon: Icon }) => {
              const isSelected = theme === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => onThemeChange(value)}
                  style={[
                    styles.themeBtn,
                    isSelected && {
                      backgroundColor: colors.accent,
                    },
                  ]}
                >
                  <Icon
                    size={16}
                    color={isSelected ? "#fff" : colors.iconColor}
                  />
                  <Text
                    style={[
                      styles.themeBtnText,
                      { color: isSelected ? "#fff" : colors.textSecondary },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Очистить историю */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ДАННЫЕ
          </Text>
          <Pressable
            onPress={handleClear}
            style={({ pressed }) => [
              styles.dangerBtn,
              {
                backgroundColor: colors.bgMuted,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Trash2 size={18} color={colors.danger} />
            <Text style={[styles.dangerBtnText, { color: colors.danger }]}>
              Очистить историю чата
            </Text>
          </Pressable>

          {/* Версия */}
          <Text style={[styles.version, { color: colors.textMuted }]}>
            Zhan AI 2.0 • Gemini 2.0 Flash-Lite
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  closeBtn: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  themeRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  themeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 9,
    gap: 5,
  },
  themeBtnText: {
    fontSize: 13,
    fontWeight: "500",
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 24,
  },
  dangerBtnText: {
    fontSize: 15,
    fontWeight: "500",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
  },
});
