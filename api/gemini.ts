// Сервис для работы с Google Gemini API
import { Message, ImageAttachment } from "../types/chat";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";

// Модель Gemini 2.0 Flash-Lite (быстрая и дешёвая)
const MODEL = "gemini-2.0-flash-lite";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = `Ты — продвинутый ИИ-ассистент Zhan AI. Отвечай чётко и по существу. 
Используй Markdown: заголовки (##), жирный (**text**), списки (- item), код (\`\`\`lang). 
При анализе изображений описывай детально что видишь.`;

// --- Вспомогательная функция: конвертация сообщений в формат Gemini ---
function buildContents(messages: Message[]) {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => {
      const parts: object[] = [];

      // Если есть прикреплённое изображение
      if (m.image) {
        parts.push({
          inlineData: {
            mimeType: m.image.mimeType,
            data: m.image.base64,
          },
        });
      }

      // Текстовая часть
      if (m.content) {
        parts.push({ text: m.content });
      }

      return {
        role: m.role === "assistant" ? "model" : "user",
        parts,
      };
    });
}

// --- Основная функция отправки сообщения ---
export async function sendMessage(
  messages: Message[],
  image?: ImageAttachment
): Promise<string> {
  if (!API_KEY) {
    throw new Error("EXPO_PUBLIC_GEMINI_API_KEY не задан в .env");
  }

  const contents = buildContents(messages);

  // Если передано изображение к последнему сообщению — оно уже включено через buildContents
  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const status = response.status;

    if (status === 400) throw new Error("Неверный запрос к Gemini API.");
    if (status === 401 || status === 403)
      throw new Error("Неверный API-ключ Gemini. Проверь .env файл.");
    if (status === 429)
      throw new Error("Превышен лимит запросов Gemini. Попробуй позже.");
    if (status === 503)
      throw new Error("Gemini API временно недоступен.");

    const msg = (errorData as any)?.error?.message ?? "Неизвестная ошибка";
    throw new Error(`Ошибка Gemini (${status}): ${msg}`);
  }

  const data = await response.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    // Проверяем причину блокировки (safety filters)
    const reason = data?.candidates?.[0]?.finishReason;
    if (reason === "SAFETY") {
      throw new Error("Запрос заблокирован фильтрами безопасности Gemini.");
    }
    throw new Error("Gemini вернул пустой ответ.");
  }

  return text;
}
