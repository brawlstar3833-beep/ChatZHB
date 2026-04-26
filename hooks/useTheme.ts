// Хук для управления темой приложения
import { useColorScheme } from "react-native";
import { Theme } from "../types/chat";

// --- Цветовые палитры ---
export const lightColors = {
  bg: "#ffffff",
  bgMuted: "#f4f4f5",
  bgCard: "#e4e4e7",
  border: "#d4d4d8",
  userBubble: "#6366f1",
  userText: "#ffffff",
  aiBubble: "#f4f4f5",
  aiText: "#09090b",
  inputBg: "#f4f4f5",
  inputBorder: "#d4d4d8",
  inputText: "#09090b",
  placeholder: "#a1a1aa",
  headerBg: "#ffffff",
  headerText: "#09090b",
  headerBorder: "#e4e4e7",
  accent: "#6366f1",
  accentDim: "#e0e7ff",
  textPrimary: "#09090b",
  textSecondary: "#71717a",
  textMuted: "#a1a1aa",
  sendActive: "#6366f1",
  sendInactive: "#e4e4e7",
  sendIconActive: "#ffffff",
  sendIconInactive: "#a1a1aa",
  modalBg: "#ffffff",
  modalOverlay: "rgba(0,0,0,0.4)",
  danger: "#ef4444",
  iconColor: "#52525b",
};

export const darkColors: typeof lightColors = {
  bg: "#09090b",
  bgMuted: "#18181b",
  bgCard: "#27272a",
  border: "#3f3f46",
  userBubble: "#6366f1",
  userText: "#ffffff",
  aiBubble: "#18181b",
  aiText: "#fafafa",
  inputBg: "#18181b",
  inputBorder: "#27272a",
  inputText: "#fafafa",
  placeholder: "#52525b",
  headerBg: "#09090b",
  headerText: "#fafafa",
  headerBorder: "#27272a",
  accent: "#6366f1",
  accentDim: "#312e81",
  textPrimary: "#fafafa",
  textSecondary: "#a1a1aa",
  textMuted: "#52525b",
  sendActive: "#6366f1",
  sendInactive: "#27272a",
  sendIconActive: "#ffffff",
  sendIconInactive: "#52525b",
  modalBg: "#18181b",
  modalOverlay: "rgba(0,0,0,0.7)",
  danger: "#f87171",
  iconColor: "#71717a",
};

// --- Хук ---
export function useTheme(themePreference: Theme) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null

  const isDark =
    themePreference === "dark" ||
    (themePreference === "system" && systemScheme === "dark");

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
}
