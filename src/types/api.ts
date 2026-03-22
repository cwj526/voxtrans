export type SpeechStyle = "neutral" | "news" | "warm" | "energetic";

export interface TranslateRequest {
  text: string;
  style?: SpeechStyle;
}

export interface TranslateResponse {
  ok: boolean;
  translatedText: string;
  message?: string;
}

export interface TtsRequest {
  text: string;
  style?: SpeechStyle;
  voiceId?: string;
}

export interface TtsResponse {
  ok: boolean;
  audioUrl: string;
  message?: string;
}
