import { NextResponse } from "next/server";

import { mockGenerateSpeech } from "@/lib/tts";
import type { TtsRequest, TtsResponse } from "@/types/api";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<TtsRequest>;
  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json<TtsResponse>(
      {
        ok: false,
        audioUrl: "",
        message: "`text` is required.",
      },
      { status: 400 },
    );
  }

  const audioUrl = await mockGenerateSpeech({
    text,
    style: body.style,
    voiceId: body.voiceId,
  });

  return NextResponse.json<TtsResponse>({
    ok: true,
    audioUrl,
  });
}
