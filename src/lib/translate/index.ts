import { AppError, parseProviderStatusCode } from "@/lib/api-error";
import type {
  Audience,
  ColloquialLevel,
  Locale,
  Rhythm,
  SentenceLength,
  SpeechStyle,
} from "@/types/api";

const STYLE_PROMPT: Record<SpeechStyle, string> = {
  neutral: "Use neutral and natural spoken English.",
  news: "Use concise and formal news-anchor style English.",
  warm: "Use warm, friendly and conversational English.",
  energetic: "Use energetic, promotional spoken English.",
};

const AUDIENCE_HINT: Record<Audience, string> = {
  general: "Target a general public audience.",
  business: "Target a business audience and keep terms professional.",
  social: "Target social media audience with lively expressions.",
};

const LOCALE_HINT: Record<Locale, string> = {
  "zh-CN": "The source text is Simplified Chinese.",
  "zh-TW": "The source text is Traditional Chinese.",
};

const COLLOQUIAL_HINT: Record<ColloquialLevel, string> = {
  low: "Keep wording polished, with light colloquial language.",
  medium: "Use everyday spoken English with natural contractions.",
  high: "Use highly conversational spoken English with energetic phrasing.",
};

const SENTENCE_LENGTH_HINT: Record<SentenceLength, string> = {
  short: "Target 8-14 words per sentence.",
  medium: "Target 12-20 words per sentence.",
};

const RHYTHM_HINT: Record<Rhythm, string> = {
  steady: "Use smooth pacing and balanced sentence rhythm.",
  punchy: "Use punchy pacing, short beats, and clear pauses.",
};

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

interface ChatCompletionChoice {
  message?: {
    content?: string;
  };
}

interface ChatCompletionResponse {
  choices?: ChatCompletionChoice[];
  error?: {
    message?: string;
  };
}

interface TranslateInput {
  text: string;
  style: SpeechStyle;
  locale: Locale;
  audience: Audience;
  videoMode: boolean;
  colloquialLevel: ColloquialLevel;
  sentenceLength: SentenceLength;
  rhythm: Rhythm;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new AppError("INTERNAL_CONFIG_MISSING", `Missing required env: ${name}`);
  }
  return value;
}

function isChineseText(text: string): boolean {
  return /[\u4E00-\u9FFF]/.test(text);
}

function buildVideoModePrompt(input: TranslateInput): string[] {
  if (!input.videoMode) {
    return ["Video mode is off. Keep translation natural and spoken."];
  }

  return [
    "Video mode is on. Optimize for short-video voice-over.",
    "Prefer active voice and avoid long subordinate clauses.",
    SENTENCE_LENGTH_HINT[input.sentenceLength],
    RHYTHM_HINT[input.rhythm],
    COLLOQUIAL_HINT[input.colloquialLevel],
  ];
}

export async function translateChineseToEnglish(input: TranslateInput): Promise<string> {
  if (!isChineseText(input.text)) {
    throw new AppError("TRANSLATION_LANGUAGE_UNSUPPORTED");
  }

  const apiKey = getRequiredEnv("TRANSLATION_API_KEY");
  const baseUrl =
    process.env.TRANSLATION_BASE_URL?.replace(/\/$/, "") || "https://api.tu-zi.com/v1";
  const model = process.env.TRANSLATION_MODEL || "gpt-5.4";

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a professional translator for spoken scripts. Translate Chinese into fluent spoken English only.",
    },
    {
      role: "user",
      content: [
        STYLE_PROMPT[input.style],
        AUDIENCE_HINT[input.audience],
        LOCALE_HINT[input.locale],
        ...buildVideoModePrompt(input),
        "Return only the final English translation.",
        "",
        "Chinese text:",
        input.text,
      ].join("\n"),
    },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.65,
      }),
      signal: controller.signal,
    });

    const data = (await response.json()) as ChatCompletionResponse;

    if (!response.ok) {
      const code = parseProviderStatusCode(response.status, "translation");
      throw new AppError(code, undefined, {
        providerStatus: response.status,
      });
    }

    const translatedText = data.choices?.[0]?.message?.content?.trim();
    if (!translatedText) {
      throw new AppError("TRANSLATION_PROVIDER_ERROR", undefined, {
        providerMessage: "empty translation",
      });
    }

    return translatedText;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("TRANSLATION_PROVIDER_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
