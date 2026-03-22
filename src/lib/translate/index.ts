import type { SpeechStyle } from "@/types/api";

const STYLE_HINT: Record<SpeechStyle, string> = {
  neutral: "Neutral delivery",
  news: "News anchor style",
  warm: "Warm storytelling style",
  energetic: "Energetic promotional style",
};

export async function mockTranslateChineseToEnglish(
  text: string,
  style: SpeechStyle = "neutral",
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }

  return `[Mock Translation • ${STYLE_HINT[style]}] ${trimmed}`;
}
