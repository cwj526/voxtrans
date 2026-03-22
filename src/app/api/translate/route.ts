import { NextResponse } from "next/server";

import { mockTranslateChineseToEnglish } from "@/lib/translate";
import type { TranslateRequest, TranslateResponse } from "@/types/api";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<TranslateRequest>;
  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json<TranslateResponse>(
      {
        ok: false,
        translatedText: "",
        message: "`text` is required.",
      },
      { status: 400 },
    );
  }

  const translatedText = await mockTranslateChineseToEnglish(text, body.style);

  return NextResponse.json<TranslateResponse>({
    ok: true,
    translatedText,
  });
}
