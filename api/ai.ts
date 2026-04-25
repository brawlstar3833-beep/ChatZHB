import Groq from "groq-sdk";
import { Message } from "../types/chat";

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn("⚠️  EXPO_PUBLIC_GROQ_API_KEY не задан в .env");
}

const groq = new Groq({ apiKey: GROQ_API_KEY ?? "" });

const SYSTEM_PROMPT = `Ты — продвинутый ИИ-ассистент. Отвечай чётко и по существу. Используй Markdown для структурирования ответа: заголовки (##), жирный текст (**text**), списки (- item), блоки кода (\`\`\`lang). При написании кода всегда указывай язык.`;

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Отправляет историю сообщений в Groq и возвращает полный ответ ассистента.
 * @param messages - массив сообщений чата (без system prompt)
 * @returns строка с ответом модели
 */
export async function sendMessage(messages: AIMessage[]): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const text = completion.choices[0]?.message?.content;

    if (!text) {
      throw new Error("Пустой ответ от модели.");
    }

    return text;
  } catch (err: unknown) {
    if (err instanceof Groq.APIError) {
      const status = err.status;
      if (status === 401) throw new Error("Неверный API-ключ Groq.");
      if (status === 429) throw new Error("Превышен лимит запросов. Попробуй позже.");
      if (status === 503) throw new Error("Groq недоступен. Попробуй позже.");
      throw new Error(`Ошибка API Groq (${status}): ${err.message}`);
    }
    throw new Error("Неизвестная ошибка при запросе к AI.");
  }
}