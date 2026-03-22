import { z } from "zod";

export const TranslateRequestSchema = z.object({
  text: z
    .string({ error: "text 为必填项" })
    .trim()
    .min(1, "text 不能为空")
    .max(2000, "text 最多 2000 字"),
  style: z.enum(["neutral", "news", "warm", "energetic"]).default("neutral"),
  locale: z.enum(["zh-CN", "zh-TW"]).default("zh-CN"),
  audience: z.enum(["general", "business", "social"]).default("general"),
  videoMode: z.boolean().default(true),
  colloquialLevel: z.enum(["low", "medium", "high"]).default("medium"),
  sentenceLength: z.enum(["short", "medium"]).default("short"),
  rhythm: z.enum(["steady", "punchy"]).default("punchy"),
});

export const TtsRequestSchema = z.object({
  text: z
    .string({ error: "text 为必填项" })
    .trim()
    .min(1, "text 不能为空")
    .max(3000, "英文 text 最多 3000 字符"),
  style: z.enum(["neutral", "news", "warm", "energetic"]).default("neutral"),
  presetId: z.string().trim().min(1).max(128, "presetId 过长").optional(),
  voiceId: z.string().trim().min(1).max(128, "voiceId 过长").optional(),
  speakingRate: z
    .number({ error: "speakingRate 须为数字" })
    .min(0.85, "speakingRate 须在 0.85 ~ 1.20 之间")
    .max(1.2, "speakingRate 须在 0.85 ~ 1.20 之间")
    .default(1),
  format: z.enum(["mp3_44100_128", "mp3_44100_192"]).default("mp3_44100_128"),
  stability: z.number().min(0).max(1).optional(),
  similarityBoost: z.number().min(0).max(1).optional(),
  voiceStyle: z.number().min(0).max(1).optional(),
  useSpeakerBoost: z.boolean().optional(),
});

export type TranslateRequestInput = z.infer<typeof TranslateRequestSchema>;
export type TtsRequestInput = z.infer<typeof TtsRequestSchema>;
