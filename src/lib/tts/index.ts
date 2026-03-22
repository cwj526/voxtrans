import type { SpeechStyle } from "@/types/api";

export interface MockTtsInput {
  text: string;
  style?: SpeechStyle;
  voiceId?: string;
}

export async function mockGenerateSpeech({
  text,
  style = "neutral",
  voiceId = "default",
}: MockTtsInput): Promise<string> {
  const encodedText = encodeURIComponent(text.slice(0, 64));
  return `https://example.com/mock-audio.mp3?voice=${voiceId}&style=${style}&preview=${encodedText}`;
}
