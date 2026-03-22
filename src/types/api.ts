export type SpeechStyle = "neutral" | "news" | "warm" | "energetic";
export type Locale = "zh-CN" | "zh-TW";
export type Audience = "general" | "business" | "social";
export type AudioFormat = "mp3_44100_128" | "mp3_44100_192";

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  requestId: string;
  retryable?: boolean;
}

export interface ApiSuccessBase {
  ok: true;
  requestId: string;
  error: null;
}

export interface ApiFailureBase {
  ok: false;
  requestId: string;
  error: ApiError;
}

export interface TranslateRequest {
  text: string;
  style?: SpeechStyle;
  locale?: Locale;
  audience?: Audience;
}

export type TranslateSuccessResponse = ApiSuccessBase & {
  translatedText: string;
};

export type TranslateFailureResponse = ApiFailureBase & {
  translatedText?: undefined;
};

export type TranslateResponse = TranslateSuccessResponse | TranslateFailureResponse;

export interface TtsRequest {
  text: string;
  style?: SpeechStyle;
  voiceId?: string;
  speakingRate?: number;
  format?: AudioFormat;
}

export type TtsSuccessResponse = ApiSuccessBase & {
  audioUrl: string;
};

export type TtsFailureResponse = ApiFailureBase & {
  audioUrl?: undefined;
};

export type TtsResponse = TtsSuccessResponse | TtsFailureResponse;

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface VoicePreset {
  id: string;
  displayNameZh: string;
  useCase: string;
  translationTone: SpeechStyle;
  speakingRate: number;
  elevenLabs: {
    voiceId: string;
    voiceName: string;
    modelId: string;
    voiceSettings: VoiceSettings;
  };
}
