import { NextResponse } from "next/server";

import { isKnownPresetId, isKnownVoiceId } from "@/config/voice-presets";
import {
  AppError,
  errorResponse,
  getRequestIdFromHeaders,
  mapZodErrorToCode,
  normalizeUnknownError,
} from "@/lib/api-error";
import { guardDemoAccess } from "@/lib/demo-guard";
import { TtsRequestSchema } from "@/lib/schemas";
import { generateSpeechDataUrl } from "@/lib/tts";
import type { TtsSuccessResponse } from "@/types/api";

export async function POST(request: Request) {
  const requestId = getRequestIdFromHeaders(request);

  try {
    guardDemoAccess(request);

    const rawBody: unknown = await request.json();
    const parsed = TtsRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return errorResponse(
        mapZodErrorToCode(parsed.error),
        requestId,
        parsed.error.flatten().fieldErrors,
      );
    }

    if (parsed.data.presetId && !isKnownPresetId(parsed.data.presetId)) {
      return errorResponse("VALIDATION_PRESET_ID_UNKNOWN", requestId);
    }

    if (parsed.data.voiceId && !isKnownVoiceId(parsed.data.voiceId)) {
      return errorResponse("VALIDATION_VOICE_ID_UNKNOWN", requestId);
    }

    const audioUrl = await generateSpeechDataUrl(parsed.data);

    return NextResponse.json<TtsSuccessResponse>({
      ok: true,
      audioUrl,
      requestId,
      error: null,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, requestId, error.details);
    }

    const appError = normalizeUnknownError(error);
    console.error("tts.unhandled", {
      requestId,
      message: appError.message,
      details: appError.details,
    });

    return errorResponse(appError.code, requestId);
  }
}
