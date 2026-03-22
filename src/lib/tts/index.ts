import { getVoicePresetByStyle } from "@/config/voice-presets";
import { AppError, parseProviderStatusCode } from "@/lib/api-error";
import type { AudioFormat, SpeechStyle, VoiceSettings } from "@/types/api";

interface ElevenLabsTtsInput {
  text: string;
  style: SpeechStyle;
  voiceId?: string;
  speakingRate: number;
  format: AudioFormat;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new AppError("INTERNAL_CONFIG_MISSING", `Missing required env: ${name}`);
  }
  return value;
}

function mergeVoiceSettings(base: VoiceSettings, speakingRate: number) {
  const speedWeight = speakingRate >= 1 ? 0.12 : 0.08;
  const rateDelta = speakingRate - 1;
  const style = Math.max(0, Math.min(1, base.style + rateDelta * speedWeight));

  return {
    ...base,
    style,
  };
}

export async function generateSpeechDataUrl({
  text,
  style,
  voiceId,
  speakingRate,
  format,
}: ElevenLabsTtsInput): Promise<string> {
  const apiKey = getRequiredEnv("ELEVENLABS_API_KEY");
  const baseUrl =
    process.env.ELEVENLABS_BASE_URL?.replace(/\/$/, "") || "https://api.elevenlabs.io/v1";

  const preset = getVoicePresetByStyle(style);
  const targetVoiceId = voiceId || preset.elevenLabs.voiceId;
  const voiceSettings = mergeVoiceSettings(preset.elevenLabs.voiceSettings, speakingRate);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const url = `${baseUrl}/text-to-speech/${targetVoiceId}?output_format=${format}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: preset.elevenLabs.modelId,
        voice_settings: voiceSettings,
        speed: speakingRate,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(parseProviderStatusCode(response.status, "tts"), undefined, {
        providerStatus: response.status,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      throw new AppError("TTS_AUDIO_EMPTY");
    }

    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    return `data:audio/mpeg;base64,${base64Audio}`;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("TTS_PROVIDER_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
