import { AppError, parseProviderStatusCode } from "@/lib/api-error";
import type { Audience, Locale, SpeechStyle } from "@/types/api";

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

export async function translateChineseToEnglish({
  text,
  style,
  locale,
  audience,
}: TranslateInput): Promise<string> {
  if (!isChineseText(text)) {
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
        STYLE_PROMPT[style],
        AUDIENCE_HINT[audience],
        LOCALE_HINT[locale],
        "Keep the output natural for voice-over delivery.",
        "Return only the final English translation.",
        "",
        "Chinese text:",
        text,
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
        temperature: 0.6,
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
