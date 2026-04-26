// Типы для чата v2.0

export type Role = "user" | "assistant" | "system";

export type Theme = "light" | "dark" | "system";

export interface ImageAttachment {
  uri: string;
  base64: string;
  mimeType: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  image?: ImageAttachment;
}
