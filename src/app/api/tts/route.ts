import { NextResponse } from "next/server";

import { isKnownVoiceId } from "@/config/voice-presets";
import {
  AppError,
  errorResponse,
  getRequestIdFromHeaders,
  mapZodErrorToCode,
  normalizeUnknownError,
} from "@/lib/api-error";
import { TtsRequestSchema } from "@/lib/schemas";
import { generateSpeechDataUrl } from "@/lib/tts";
import type { TtsSuccessResponse } from "@/types/api";

export async function POST(request: Request) {
  const requestId = getRequestIdFromHeaders(request);

  try {
    const rawBody: unknown = await request.json();
    const parsed = TtsRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return errorResponse(
        mapZodErrorToCode(parsed.error),
        requestId,
        parsed.error.flatten().fieldErrors,
      );
    }

    const { text, style, voiceId, speakingRate, format } = parsed.data;

    if (voiceId && !isKnownVoiceId(voiceId)) {
      return errorResponse("VALIDATION_VOICE_ID_UNKNOWN", requestId);
    }

    const audioUrl = await generateSpeechDataUrl({
      text,
      style,
      voiceId,
      speakingRate,
      format,
    });

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
