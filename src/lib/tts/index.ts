import { getVoicePresetByIdOrStyle } from "@/config/voice-presets";
import { AppError, parseProviderStatusCode } from "@/lib/api-error";
import type { AudioFormat, SpeechStyle, VoiceSettings } from "@/types/api";

interface ElevenLabsTtsInput {
  text: string;
  style: SpeechStyle;
  presetId?: string;
  voiceId?: string;
  speakingRate: number;
  format: AudioFormat;
  stability?: number;
  similarityBoost?: number;
  voiceStyle?: number;
  useSpeakerBoost?: boolean;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new AppError("INTERNAL_CONFIG_MISSING", `Missing required env: ${name}`);
  }
  return value;
}

function mergeVoiceSettings(base: VoiceSettings, input: ElevenLabsTtsInput): VoiceSettings {
  return {
    stability: input.stability ?? base.stability,
    similarity_boost: input.similarityBoost ?? base.similarity_boost,
    style: input.voiceStyle ?? base.style,
    use_speaker_boost: input.useSpeakerBoost ?? base.use_speaker_boost,
  };
}

export async function generateSpeechDataUrl(input: ElevenLabsTtsInput): Promise<string> {
  const apiKey = getRequiredEnv("ELEVENLABS_API_KEY");
  const baseUrl =
    process.env.ELEVENLABS_BASE_URL?.replace(/\/$/, "") || "https://api.elevenlabs.io/v1";

  const preset = getVoicePresetByIdOrStyle(input.presetId, input.style);
  const targetVoiceId = input.voiceId || preset.elevenLabs.voiceId;
  const voiceSettings = mergeVoiceSettings(preset.elevenLabs.voiceSettings, input);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const url = `${baseUrl}/text-to-speech/${targetVoiceId}?output_format=${input.format}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: input.text,
        model_id: preset.elevenLabs.modelId,
        voice_settings: voiceSettings,
        speed: input.speakingRate,
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
