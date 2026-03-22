import { NextResponse } from "next/server";

import {
  AppError,
  errorResponse,
  getRequestIdFromHeaders,
  mapZodErrorToCode,
  normalizeUnknownError,
} from "@/lib/api-error";
import { TranslateRequestSchema } from "@/lib/schemas";
import { translateChineseToEnglish } from "@/lib/translate";
import type { TranslateSuccessResponse } from "@/types/api";

export async function POST(request: Request) {
  const requestId = getRequestIdFromHeaders(request);

  try {
    const rawBody: unknown = await request.json();
    const parsed = TranslateRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return errorResponse(
        mapZodErrorToCode(parsed.error),
        requestId,
        parsed.error.flatten().fieldErrors,
      );
    }

    const translatedText = await translateChineseToEnglish(parsed.data);

    return NextResponse.json<TranslateSuccessResponse>({
      ok: true,
      translatedText,
      requestId,
      error: null,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, requestId, error.details);
    }

    const appError = normalizeUnknownError(error);
    console.error("translate.unhandled", {
      requestId,
      message: appError.message,
      details: appError.details,
    });

    return errorResponse(appError.code, requestId);
  }
}
