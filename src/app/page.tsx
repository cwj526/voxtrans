"use client";

import { useState } from "react";

import type {
  Audience,
  Locale,
  SpeechStyle,
  TranslateResponse,
  TtsResponse,
} from "@/types/api";

const STYLE_OPTIONS: { label: string; value: SpeechStyle }[] = [
  { label: "Neutral", value: "neutral" },
  { label: "News", value: "news" },
  { label: "Warm", value: "warm" },
  { label: "Energetic", value: "energetic" },
];

export default function Home() {
  const [chineseText, setChineseText] = useState("");
  const [style, setStyle] = useState<SpeechStyle>("warm");
  const [translatedText, setTranslatedText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    const text = chineseText.trim();
    if (!text) {
      setError("请输入中文文案。");
      return;
    }

    setLoading(true);
    setError("");
    setAudioUrl("");

    try {
      const translateRes = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          style,
          locale: "zh-CN" satisfies Locale,
          audience: "general" satisfies Audience,
        }),
      });

      const translateData = (await translateRes.json()) as TranslateResponse;
      if (!translateRes.ok || !translateData.ok) {
        throw new Error(translateData.error?.message || "翻译失败");
      }

      setTranslatedText(translateData.translatedText);

      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: translateData.translatedText,
          style,
          speakingRate: 1.0,
          format: "mp3_44100_128",
        }),
      });

      const ttsData = (await ttsRes.json()) as TtsResponse;
      if (!ttsRes.ok || !ttsData.ok) {
        throw new Error(ttsData.error?.message || "语音生成失败");
      }

      setAudioUrl(ttsData.audioUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">VoxTrans Demo</h1>
      <p className="mt-2 text-sm text-zinc-600">中文文案 - 英文翻译 - 英文语音（真实 API）</p>

      <section className="mt-6 space-y-4 rounded-xl border border-zinc-200 p-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium">中文口播文案</span>
          <textarea
            className="min-h-32 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
            placeholder="输入中文文案..."
            value={chineseText}
            onChange={(event) => setChineseText(event.target.value)}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">语音风格</span>
          <select
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
            value={style}
            onChange={(event) => setStyle(event.target.value as SpeechStyle)}
          >
            {STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "处理中..." : "生成英文与语音"}
        </button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="mt-6 space-y-3 rounded-xl border border-zinc-200 p-4">
        <h2 className="text-base font-semibold">输出结果</h2>

        <div>
          <p className="text-sm font-medium">英文文案</p>
          <p className="mt-1 min-h-14 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            {translatedText || "等待生成..."}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">英文语音</p>
          {audioUrl ? (
            <div className="mt-1 space-y-2">
              <audio controls src={audioUrl} className="w-full" />
              <a
                href={audioUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 underline"
              >
                打开音频链接
              </a>
            </div>
          ) : (
            <p className="mt-1 text-sm text-zinc-500">等待生成...</p>
          )}
        </div>
      </section>
    </main>
  );
}
