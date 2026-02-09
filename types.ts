export type AIProvider = 'google' | 'openai' | 'anthropic';

export interface TranscriptionState {
  status: 'idle' | 'loading' | 'success' | 'error';
  markdown: string;
  error?: string;
}

export interface UploadedImage {
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface Book {
  id: string;
  title: string;
  createdAt: number;
  description?: string;
}

export interface Note {
  id: string;
  bookId: string;
  content: string; // The markdown
  createdAt: number;
  previewImage?: string; // base64 snippet or url
}