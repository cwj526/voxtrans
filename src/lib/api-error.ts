import { NextResponse } from "next/server";
import { ZodError } from "zod";

import type { ApiError, TranslateFailureResponse, TtsFailureResponse } from "@/types/api";

interface ErrorMeta {
  httpStatus: number;
  message: string;
  retryable: boolean;
}

const ERROR_MAP: Record<string, ErrorMeta> = {
  VALIDATION_TEXT_MISSING: {
    httpStatus: 400,
    message: "请输入需要处理的文本内容",
    retryable: false,
  },
  VALIDATION_TEXT_TOO_LONG: {
    httpStatus: 400,
    message: "输入文本超出最大长度限制",
    retryable: false,
  },
  VALIDATION_ENUM_INVALID: {
    httpStatus: 400,
    message: "参数值不合法，请检查请求格式",
    retryable: false,
  },
  VALIDATION_PARAM_OUT_OF_RANGE: {
    httpStatus: 400,
    message: "语速参数超出允许范围（0.85～1.20）",
    retryable: false,
  },
  VALIDATION_VOICE_ID_UNKNOWN: {
    httpStatus: 400,
    message: "声音 ID 不存在，请重新选择",
    retryable: false,
  },
  VALIDATION_PRESET_ID_UNKNOWN: {
    httpStatus: 400,
    message: "语音预设不存在，请重新选择",
    retryable: false,
  },
  TRANSLATION_PROVIDER_TIMEOUT: {
    httpStatus: 502,
    message: "翻译服务响应超时，请稍后重试",
    retryable: true,
  },
  TRANSLATION_PROVIDER_ERROR: {
    httpStatus: 502,
    message: "翻译服务暂时不可用，请稍后重试",
    retryable: true,
  },
  TRANSLATION_QUOTA_EXCEEDED: {
    httpStatus: 429,
    message: "翻译配额已用尽，请联系管理员",
    retryable: false,
  },
  TRANSLATION_LANGUAGE_UNSUPPORTED: {
    httpStatus: 400,
    message: "当前仅支持简体/繁体中文输入",
    retryable: false,
  },
  TTS_PROVIDER_TIMEOUT: {
    httpStatus: 502,
    message: "语音生成超时，请稍后重试",
    retryable: true,
  },
  TTS_PROVIDER_ERROR: {
    httpStatus: 502,
    message: "语音服务暂时不可用，请稍后重试",
    retryable: true,
  },
  TTS_QUOTA_EXCEEDED: {
    httpStatus: 429,
    message: "语音生成配额已用尽，请联系管理员",
    retryable: false,
  },
  TTS_AUDIO_EMPTY: {
    httpStatus: 502,
    message: "语音生成结果异常，请重试",
    retryable: true,
  },
  INTERNAL_UNHANDLED: {
    httpStatus: 500,
    message: "服务内部错误，请稍后重试",
    retryable: true,
  },
  INTERNAL_STORAGE_FAILED: {
    httpStatus: 500,
    message: "音频存储失败，请稍后重试",
    retryable: true,
  },
  INTERNAL_CONFIG_MISSING: {
    httpStatus: 500,
    message: "服务配置异常，请联系技术支持",
    retryable: false,
  },
  INTERNAL_REQUEST_ID_FAIL: {
    httpStatus: 500,
    message: "服务内部错误，请稍后重试",
    retryable: true,
  },
};

export class AppError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message?: string, details?: unknown) {
    super(message || code);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

export function getRequestIdFromHeaders(request: Request): string {
  return request.headers.get("x-request-id") || crypto.randomUUID();
}

export function mapZodErrorToCode(error: ZodError): string {
  const issues = error.issues;
  if (issues.some((issue) => issue.path[0] === "text" && issue.code === "too_big")) {
    return "VALIDATION_TEXT_TOO_LONG";
  }

  if (issues.some((issue) => issue.path[0] === "text")) {
    return "VALIDATION_TEXT_MISSING";
  }

  if (issues.some((issue) => issue.path[0] === "speakingRate" && issue.code === "too_small")) {
    return "VALIDATION_PARAM_OUT_OF_RANGE";
  }

  if (issues.some((issue) => issue.path[0] === "speakingRate" && issue.code === "too_big")) {
    return "VALIDATION_PARAM_OUT_OF_RANGE";
  }

  return "VALIDATION_ENUM_INVALID";
}

function toApiError(code: string, requestId: string, details?: unknown): ApiError {
  const meta = ERROR_MAP[code] || ERROR_MAP.INTERNAL_UNHANDLED;
  return {
    code,
    message: meta.message,
    details,
    requestId,
    retryable: meta.retryable,
  };
}

export function errorResponse(
  code: string,
  requestId: string,
  details?: unknown,
): NextResponse<TranslateFailureResponse | TtsFailureResponse> {
  const meta = ERROR_MAP[code] || ERROR_MAP.INTERNAL_UNHANDLED;
  return NextResponse.json(
    {
      ok: false,
      requestId,
      error: toApiError(code, requestId, details),
    },
    { status: meta.httpStatus },
  );
}

export function normalizeUnknownError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new AppError("INTERNAL_UNHANDLED");
  }

  return new AppError("INTERNAL_UNHANDLED", undefined, {
    message: error instanceof Error ? error.message : String(error),
  });
}

export function parseProviderStatusCode(status: number, kind: "translation" | "tts"): string {
  if (status === 429) {
    return kind === "translation" ? "TRANSLATION_QUOTA_EXCEEDED" : "TTS_QUOTA_EXCEEDED";
  }

  if (status >= 500) {
    return kind === "translation" ? "TRANSLATION_PROVIDER_ERROR" : "TTS_PROVIDER_ERROR";
  }

  return kind === "translation" ? "TRANSLATION_PROVIDER_ERROR" : "TTS_PROVIDER_ERROR";
}
