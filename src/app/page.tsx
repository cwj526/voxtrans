"use client";

import { useEffect, useMemo, useState } from "react";

import { DEFAULT_VOICE_PRESET_ID, VOICE_PRESETS, getVoicePresetById } from "@/config/voice-presets";
import type {
  Audience,
  AudioFormat,
  ColloquialLevel,
  Locale,
  Rhythm,
  SentenceLength,
  SpeechStyle,
  TranslateResponse,
  TtsResponse,
} from "@/types/api";

type UiStatus = "idle" | "translating" | "translated" | "synthesizing" | "voiced" | "error";

type ErrorState = {
  message: string;
  requestId?: string;
  retryable?: boolean;
  step: "translate" | "tts";
} | null;

type Notice = {
  type: "success" | "error" | "info";
  message: string;
} | null;

type TemplateState = {
  style: SpeechStyle;
  locale: Locale;
  audience: Audience;
  videoMode: boolean;
  colloquialLevel: ColloquialLevel;
  sentenceLength: SentenceLength;
  rhythm: Rhythm;
  presetId: string;
  voiceId: string;
  speakingRate: number;
  format: AudioFormat;
  stability: number;
  similarityBoost: number;
  voiceStyle: number;
  useSpeakerBoost: boolean;
};

type HistoryItem = {
  id: string;
  createdAt: string;
  chineseText: string;
  englishText: string;
  style: SpeechStyle;
  locale: Locale;
  audience: Audience;
  videoMode: boolean;
  colloquialLevel: ColloquialLevel;
  sentenceLength: SentenceLength;
  rhythm: Rhythm;
  presetId: string;
  voiceId: string;
  speakingRate: number;
  format: AudioFormat;
  stability: number;
  similarityBoost: number;
  voiceStyle: number;
  useSpeakerBoost: boolean;
  hasAudio: boolean;
};

const HISTORY_KEY = "voxtrans.history.v1";
const TEMPLATE_KEY = "voxtrans.template.v1";

const STYLE_OPTIONS: { label: string; value: SpeechStyle }[] = [
  { label: "Neutral", value: "neutral" },
  { label: "News", value: "news" },
  { label: "Warm", value: "warm" },
  { label: "Energetic", value: "energetic" },
];

const LOCALE_OPTIONS: { label: string; value: Locale }[] = [
  { label: "简体中文", value: "zh-CN" },
  { label: "繁体中文", value: "zh-TW" },
];

const AUDIENCE_OPTIONS: { label: string; value: Audience }[] = [
  { label: "大众用户", value: "general" },
  { label: "商业用户", value: "business" },
  { label: "社媒用户", value: "social" },
];

const COLLOQUIAL_OPTIONS: { label: string; value: ColloquialLevel }[] = [
  { label: "低", value: "low" },
  { label: "中", value: "medium" },
  { label: "高", value: "high" },
];

const SENTENCE_LENGTH_OPTIONS: { label: string; value: SentenceLength }[] = [
  { label: "短句 (8-14词)", value: "short" },
  { label: "中句 (12-20词)", value: "medium" },
];

const RHYTHM_OPTIONS: { label: string; value: Rhythm }[] = [
  { label: "平稳", value: "steady" },
  { label: "有张力", value: "punchy" },
];

const AUDIO_FORMAT_OPTIONS: { label: string; value: AudioFormat }[] = [
  { label: "MP3 44.1kHz / 128kbps", value: "mp3_44100_128" },
  { label: "MP3 44.1kHz / 192kbps", value: "mp3_44100_192" },
];

function timestampForFilename(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, data] = dataUrl.split(",");
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] || "audio/mpeg";
  const binary = atob(data);
  const len = binary.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function statusLabel(status: UiStatus): string {
  if (status === "idle") return "Ready";
  if (status === "translating") return "Translating";
  if (status === "translated") return "Translated";
  if (status === "synthesizing") return "Synthesizing";
  if (status === "voiced") return "Done";
  return "Error";
}

function defaultTemplate(): TemplateState {
  const preset = getVoicePresetById(DEFAULT_VOICE_PRESET_ID) || VOICE_PRESETS[0];
  return {
    style: "warm",
    locale: "zh-CN",
    audience: "general",
    videoMode: true,
    colloquialLevel: "medium",
    sentenceLength: "short",
    rhythm: "punchy",
    presetId: preset.id,
    voiceId: preset.elevenLabs.voiceId,
    speakingRate: preset.speakingRate,
    format: "mp3_44100_128",
    stability: preset.elevenLabs.voiceSettings.stability,
    similarityBoost: preset.elevenLabs.voiceSettings.similarity_boost,
    voiceStyle: preset.elevenLabs.voiceSettings.style,
    useSpeakerBoost: preset.elevenLabs.voiceSettings.use_speaker_boost,
  };
}

export default function Home() {
  const [status, setStatus] = useState<UiStatus>("idle");
  const [notice, setNotice] = useState<Notice>(null);
  const [errorState, setErrorState] = useState<ErrorState>(null);

  const [chineseText, setChineseText] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  const [template, setTemplate] = useState<TemplateState>(defaultTemplate());
  const [translateRequestId, setTranslateRequestId] = useState("");
  const [ttsRequestId, setTtsRequestId] = useState("");

  const [isTranslating, setIsTranslating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const selectedPreset = useMemo(
    () => getVoicePresetById(template.presetId) || VOICE_PRESETS[0],
    [template.presetId],
  );

  const isCustomTts = useMemo(() => {
    const base = selectedPreset.elevenLabs.voiceSettings;
    return (
      template.voiceId !== selectedPreset.elevenLabs.voiceId ||
      template.speakingRate !== selectedPreset.speakingRate ||
      template.stability !== base.stability ||
      template.similarityBoost !== base.similarity_boost ||
      template.voiceStyle !== base.style ||
      template.useSpeakerBoost !== base.use_speaker_boost
    );
  }, [selectedPreset, template]);

  useEffect(() => {
    try {
      const rawHistory = localStorage.getItem(HISTORY_KEY);
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory) as HistoryItem[];
        setHistory(Array.isArray(parsed) ? parsed : []);
      }

      const rawTemplate = localStorage.getItem(TEMPLATE_KEY);
      if (rawTemplate) {
        const parsed = JSON.parse(rawTemplate) as Partial<TemplateState>;
        setTemplate((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      setNotice({ type: "error", message: "本地配置加载失败，已使用默认值。" });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(template));
  }, [template]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2200);
    return () => clearTimeout(timer);
  }, [notice]);

  function pushHistory(hasAudio: boolean, translatedText: string) {
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      chineseText,
      englishText: translatedText,
      style: template.style,
      locale: template.locale,
      audience: template.audience,
      videoMode: template.videoMode,
      colloquialLevel: template.colloquialLevel,
      sentenceLength: template.sentenceLength,
      rhythm: template.rhythm,
      presetId: template.presetId,
      voiceId: template.voiceId,
      speakingRate: template.speakingRate,
      format: template.format,
      stability: template.stability,
      similarityBoost: template.similarityBoost,
      voiceStyle: template.voiceStyle,
      useSpeakerBoost: template.useSpeakerBoost,
      hasAudio,
    };

    setHistory((prev) => {
      const next = [item, ...prev].slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  function applyPreset(presetId: string) {
    const preset = getVoicePresetById(presetId);
    if (!preset) return;

    setTemplate((prev) => ({
      ...prev,
      presetId: preset.id,
      voiceId: preset.elevenLabs.voiceId,
      speakingRate: preset.speakingRate,
      stability: preset.elevenLabs.voiceSettings.stability,
      similarityBoost: preset.elevenLabs.voiceSettings.similarity_boost,
      voiceStyle: preset.elevenLabs.voiceSettings.style,
      useSpeakerBoost: preset.elevenLabs.voiceSettings.use_speaker_boost,
    }));

    setNotice({ type: "info", message: `已应用预设：${preset.displayNameZh}` });
  }

  function resetToPreset() {
    applyPreset(template.presetId);
  }

  async function runTranslate() {
    const text = chineseText.trim();
    if (!text) {
      setNotice({ type: "error", message: "请先输入中文文案。" });
      return;
    }

    setIsTranslating(true);
    setStatus("translating");
    setErrorState(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          style: template.style,
          locale: template.locale,
          audience: template.audience,
          videoMode: template.videoMode,
          colloquialLevel: template.colloquialLevel,
          sentenceLength: template.sentenceLength,
          rhythm: template.rhythm,
        }),
      });

      const data = (await response.json()) as TranslateResponse;
      if (!response.ok || !data.ok) {
        setStatus("error");
        setTranslateRequestId(data.requestId || "");
        setErrorState({
          message: data.error?.message || "翻译失败",
          requestId: data.requestId,
          retryable: data.error?.retryable,
          step: "translate",
        });
        return;
      }

      setTranslateRequestId(data.requestId);
      setEnglishText(data.translatedText);
      setAudioUrl("");
      setTtsRequestId("");
      setStatus("translated");
      pushHistory(false, data.translatedText);
      setNotice({ type: "success", message: "英文文本已生成。" });
    } catch {
      setStatus("error");
      setErrorState({ message: "网络异常，翻译请求失败。", step: "translate", retryable: true });
    } finally {
      setIsTranslating(false);
    }
  }

  async function runTts() {
    const text = englishText.trim();
    if (!text) {
      setNotice({ type: "error", message: "请先生成或填写英文文本。" });
      return;
    }

    setIsSynthesizing(true);
    setStatus("synthesizing");
    setErrorState(null);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          style: template.style,
          presetId: template.presetId,
          voiceId: template.voiceId,
          speakingRate: template.speakingRate,
          format: template.format,
          stability: template.stability,
          similarityBoost: template.similarityBoost,
          voiceStyle: template.voiceStyle,
          useSpeakerBoost: template.useSpeakerBoost,
        }),
      });

      const data = (await response.json()) as TtsResponse;
      if (!response.ok || !data.ok) {
        setStatus("error");
        setTtsRequestId(data.requestId || "");
        setErrorState({
          message: data.error?.message || "语音生成失败",
          requestId: data.requestId,
          retryable: data.error?.retryable,
          step: "tts",
        });
        return;
      }

      setTtsRequestId(data.requestId);
      setAudioUrl(data.audioUrl);
      setStatus("voiced");
      pushHistory(true, text);
      setNotice({ type: "success", message: "英文语音已生成。" });
    } catch {
      setStatus("error");
      setErrorState({ message: "网络异常，语音请求失败。", step: "tts", retryable: true });
    } finally {
      setIsSynthesizing(false);
    }
  }

  async function copyEnglishText() {
    if (!englishText.trim()) {
      setNotice({ type: "error", message: "当前没有可复制的英文文本。" });
      return;
    }

    try {
      await navigator.clipboard.writeText(englishText);
      setNotice({ type: "success", message: "英文文本已复制。" });
    } catch {
      setNotice({ type: "error", message: "复制失败，请检查浏览器权限。" });
    }
  }

  function downloadEnglishText() {
    if (!englishText.trim()) {
      setNotice({ type: "error", message: "当前没有可下载的英文文本。" });
      return;
    }

    const blob = new Blob([englishText], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `voxtrans_text_${timestampForFilename()}.txt`);
    setNotice({ type: "success", message: "英文文本已下载。" });
  }

  function downloadAudio() {
    if (!audioUrl.startsWith("data:audio")) {
      setNotice({ type: "error", message: "当前没有可下载的音频。" });
      return;
    }

    const blob = dataUrlToBlob(audioUrl);
    downloadBlob(blob, `voxtrans_audio_${template.style}_${timestampForFilename()}.mp3`);
    setNotice({ type: "success", message: "音频已下载。" });
  }

  function loadHistoryItem(item: HistoryItem) {
    setChineseText(item.chineseText);
    setEnglishText(item.englishText);
    setAudioUrl("");
    setTemplate({
      style: item.style,
      locale: item.locale,
      audience: item.audience,
      videoMode: item.videoMode,
      colloquialLevel: item.colloquialLevel,
      sentenceLength: item.sentenceLength,
      rhythm: item.rhythm,
      presetId: item.presetId,
      voiceId: item.voiceId,
      speakingRate: item.speakingRate,
      format: item.format,
      stability: item.stability,
      similarityBoost: item.similarityBoost,
      voiceStyle: item.voiceStyle,
      useSpeakerBoost: item.useSpeakerBoost,
    });
    setStatus("translated");
    setNotice({
      type: "info",
      message: item.hasAudio ? "历史已载入，音频需重新生成或重新下载。" : "历史记录已载入到编辑区。",
    });
  }

  function removeHistoryItem(id: string) {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clearHistory() {
    setHistory([]);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    setNotice({ type: "info", message: "历史记录已清空。" });
  }

  function retryLastStep() {
    if (!errorState?.retryable) return;
    if (errorState.step === "translate") {
      void runTranslate();
      return;
    }
    void runTts();
  }

  const audioReady = audioUrl.startsWith("data:audio");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7d6_0%,#fff7ed_36%,#f4f7ff_100%)] pb-10">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
        <header className="rounded-2xl border border-orange-200/70 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-orange-500">VOXTRANS STUDIO</p>
              <h1 className="mt-1 text-2xl font-bold text-zinc-900 md:text-3xl">中文口播到英文语音工作台</h1>
              <p className="mt-1 text-sm text-zinc-600">
                两步流程：先翻译，再生成语音。支持短视频优化、语音参数高级自定义、复制与下载。
              </p>
            </div>
            <div className="rounded-full border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
              Status: {statusLabel(status)}
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <section className="space-y-6">
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">输入区</h2>
              <p className="mt-1 text-sm text-zinc-600">输入中文口播文案，可用于广告、短视频、品牌内容等。</p>
              <textarea
                className="mt-4 min-h-44 w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-orange-400"
                placeholder="输入中文文案..."
                value={chineseText}
                onChange={(event) => setChineseText(event.target.value)}
              />
              <div className="mt-2 text-xs text-zinc-500">当前字数：{chineseText.trim().length} / 2000</div>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">翻译配置</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">翻译风格</span>
                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.style}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, style: event.target.value as SpeechStyle }))
                    }
                  >
                    {STYLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">中文类型</span>
                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.locale}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, locale: event.target.value as Locale }))
                    }
                  >
                    {LOCALE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">目标受众</span>
                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.audience}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, audience: event.target.value as Audience }))
                    }
                  >
                    {AUDIENCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">短视频优化</span>
                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.videoMode ? "on" : "off"}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, videoMode: event.target.value === "on" }))
                    }
                  >
                    <option value="on">开启</option>
                    <option value="off">关闭</option>
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">口语化强度</span>
                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.colloquialLevel}
                    onChange={(event) =>
                      setTemplate((prev) => ({
                        ...prev,
                        colloquialLevel: event.target.value as ColloquialLevel,
                      }))
                    }
                  >
                    {COLLOQUIAL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">句子长度</span>
                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.sentenceLength}
                    onChange={(event) =>
                      setTemplate((prev) => ({
                        ...prev,
                        sentenceLength: event.target.value as SentenceLength,
                      }))
                    }
                  >
                    {SENTENCE_LENGTH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="font-medium text-zinc-700">表达节奏</span>
                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.rhythm}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, rhythm: event.target.value as Rhythm }))
                    }
                  >
                    {RHYTHM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-zinc-900">语音配置（高度自定义）</h2>
                <div className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {isCustomTts ? "已启用自定义覆盖" : "使用预设参数"}
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="font-medium text-zinc-700">语音预设</span>
                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.presetId}
                    onChange={(event) => applyPreset(event.target.value)}
                  >
                    {VOICE_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.displayNameZh} · {preset.useCase}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">Voice ID</span>
                  <input
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.voiceId}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, voiceId: event.target.value.trim() }))
                    }
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">音频格式</span>
                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.format}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, format: event.target.value as AudioFormat }))
                    }
                  >
                    {AUDIO_FORMAT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">语速 (0.85-1.20)</span>
                  <input
                    type="number"
                    step="0.01"
                    min={0.85}
                    max={1.2}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.speakingRate}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, speakingRate: Number(event.target.value) || 1 }))
                    }
                  />
                </label>

                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  onClick={resetToPreset}
                >
                  重置为预设
                </button>
              </div>

              <div className="mt-5 grid gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">stability</span>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step="0.01"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.stability}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, stability: Number(event.target.value) || 0 }))
                    }
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">similarity_boost</span>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step="0.01"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.similarityBoost}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, similarityBoost: Number(event.target.value) || 0 }))
                    }
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">style</span>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step="0.01"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.voiceStyle}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, voiceStyle: Number(event.target.value) || 0 }))
                    }
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-zinc-700">use_speaker_boost</span>
                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-400"
                    value={template.useSpeakerBoost ? "true" : "false"}
                    onChange={(event) =>
                      setTemplate((prev) => ({ ...prev, useSpeakerBoost: event.target.value === "true" }))
                    }
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </label>
              </div>
            </article>
          </section>

          <section className="space-y-6">
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="sticky top-3 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white/90 p-3 backdrop-blur">
                <button
                  type="button"
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
                  onClick={() => void runTranslate()}
                  disabled={isTranslating}
                >
                  {isTranslating ? "翻译中..." : "1. 生成英文文本"}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                  onClick={() => void runTts()}
                  disabled={isSynthesizing || !englishText.trim()}
                >
                  {isSynthesizing ? "合成中..." : "2. 生成英文音频"}
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  onClick={retryLastStep}
                  disabled={!errorState?.retryable}
                >
                  重试上一步
                </button>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-zinc-900">翻译结果区</h2>
              <p className="mt-1 text-sm text-zinc-600">翻译完成后可手动编辑英文，再单独生成语音。</p>
              <textarea
                className="mt-4 min-h-44 w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm outline-none focus:border-orange-400"
                value={englishText}
                placeholder="英文翻译结果会显示在这里..."
                onChange={(event) => setEnglishText(event.target.value)}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  onClick={copyEnglishText}
                  disabled={!englishText.trim()}
                >
                  一键复制英文文本
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  onClick={downloadEnglishText}
                  disabled={!englishText.trim()}
                >
                  下载英文文本 (.txt)
                </button>
              </div>

              <h3 className="mt-6 text-base font-semibold text-zinc-900">音频结果区</h3>
              <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                {audioReady ? (
                  <>
                    <audio controls src={audioUrl} className="w-full" />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-white"
                        onClick={downloadAudio}
                      >
                        下载音频 (.mp3)
                      </button>
                      <a
                        href={audioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-white"
                      >
                        打开音频链接
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-zinc-500">尚未生成音频。</p>
                )}
              </div>

              {(translateRequestId || ttsRequestId || errorState?.requestId) && (
                <details className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
                  <summary className="cursor-pointer font-medium">调试信息（requestId）</summary>
                  <div className="mt-2 space-y-1 font-mono text-xs">
                    {translateRequestId ? <p>translate: {translateRequestId}</p> : null}
                    {ttsRequestId ? <p>tts: {ttsRequestId}</p> : null}
                    {errorState?.requestId ? <p>error: {errorState.requestId}</p> : null}
                  </div>
                </details>
              )}

              {errorState ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                  {errorState.message}
                </div>
              ) : null}
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">历史记录</h2>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  onClick={clearHistory}
                  disabled={history.length === 0}
                >
                  清空历史
                </button>
              </div>

              {history.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-500">暂无历史记录。</p>
              ) : (
                <div className="mt-3 max-h-80 space-y-3 overflow-auto pr-1">
                  {history.map((item) => (
                    <div key={item.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <p className="text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
                      <p className="mt-1 max-h-10 overflow-hidden text-sm text-zinc-700">{item.chineseText}</p>
                      <p className="mt-1 max-h-10 overflow-hidden text-xs text-zinc-500">{item.englishText}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-white"
                          onClick={() => loadHistoryItem(item)}
                        >
                          加载
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-white"
                          onClick={() => removeHistoryItem(item.id)}
                        >
                          删除
                        </button>
                        <span className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600">
                          {item.hasAudio ? "含音频" : "仅文本"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </div>
      </main>

      {notice ? (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={
              notice.type === "success"
                ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 shadow"
                : notice.type === "error"
                  ? "rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 shadow"
                  : "rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 shadow"
            }
          >
            {notice.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}
