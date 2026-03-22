import type { SpeechStyle, VoicePreset } from "@/types/api";

export const DEFAULT_VOICE_PRESET_ID = "warm_story_female";

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: "formal_news_male",
    displayNameZh: "正式新闻男声",
    useCase: "新闻播报 / 财经资讯 / 政企公告",
    translationTone: "news",
    speakingRate: 0.95,
    elevenLabs: {
      voiceId: "onwK4e9ZLuTAKqWW03F9",
      voiceName: "Daniel - Steady Broadcaster",
      modelId: "eleven_multilingual_v2",
      voiceSettings: {
        stability: 0.82,
        similarity_boost: 0.7,
        style: 0.1,
        use_speaker_boost: true,
      },
    },
  },
  {
    id: "warm_story_female",
    displayNameZh: "温暖讲述女声",
    useCase: "品牌故事 / 纪录片旁白 / 情感短视频",
    translationTone: "warm",
    speakingRate: 0.9,
    elevenLabs: {
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      voiceName: "Sarah - Mature, Reassuring, Confident",
      modelId: "eleven_multilingual_v2",
      voiceSettings: {
        stability: 0.6,
        similarity_boost: 0.78,
        style: 0.42,
        use_speaker_boost: true,
      },
    },
  },
  {
    id: "energetic_promo_male",
    displayNameZh: "强促销男声",
    useCase: "大促活动 / 限时秒杀 / 电商口播",
    translationTone: "energetic",
    speakingRate: 1.12,
    elevenLabs: {
      voiceId: "IKne3meq5aSn9XLyUdCD",
      voiceName: "Charlie - Deep, Confident, Energetic",
      modelId: "eleven_multilingual_v2",
      voiceSettings: {
        stability: 0.38,
        similarity_boost: 0.85,
        style: 0.75,
        use_speaker_boost: true,
      },
    },
  },
  {
    id: "professional_explainer_female",
    displayNameZh: "专业讲解女声",
    useCase: "产品介绍 / 功能演示 / 教育课程",
    translationTone: "neutral",
    speakingRate: 0.97,
    elevenLabs: {
      voiceId: "Xb7hH8MSUJpSbSDYk0k2",
      voiceName: "Alice - Clear, Engaging Educator",
      modelId: "eleven_multilingual_v2",
      voiceSettings: {
        stability: 0.72,
        similarity_boost: 0.68,
        style: 0.2,
        use_speaker_boost: false,
      },
    },
  },
  {
    id: "youth_social_female",
    displayNameZh: "年轻社媒女声",
    useCase: "短视频口播 / 潮品种草 / Z世代内容",
    translationTone: "energetic",
    speakingRate: 1.18,
    elevenLabs: {
      voiceId: "FGY2WhTYpPnrIDTdsKH5",
      voiceName: "Laura - Enthusiast, Quirky Attitude",
      modelId: "eleven_multilingual_v2",
      voiceSettings: {
        stability: 0.3,
        similarity_boost: 0.88,
        style: 0.85,
        use_speaker_boost: true,
      },
    },
  },
  {
    id: "calm_service_female",
    displayNameZh: "客服安抚女声",
    useCase: "客服说明 / 投诉处理 / 退换货引导",
    translationTone: "warm",
    speakingRate: 0.87,
    elevenLabs: {
      voiceId: "XrExE9yKIg1WjnnlVkGX",
      voiceName: "Matilda - Knowledgeable, Professional",
      modelId: "eleven_multilingual_v2",
      voiceSettings: {
        stability: 0.88,
        similarity_boost: 0.62,
        style: 0.08,
        use_speaker_boost: false,
      },
    },
  },
];

const FALLBACK_BY_STYLE: Record<SpeechStyle, string> = {
  neutral: "professional_explainer_female",
  news: "formal_news_male",
  warm: "warm_story_female",
  energetic: "energetic_promo_male",
};

export function getVoicePresetById(id: string): VoicePreset | undefined {
  return VOICE_PRESETS.find((preset) => preset.id === id);
}

export function getVoicePresetByStyle(style: SpeechStyle): VoicePreset {
  const id = FALLBACK_BY_STYLE[style];
  return getVoicePresetById(id) || VOICE_PRESETS[0];
}

export function isKnownVoiceId(voiceId: string): boolean {
  return VOICE_PRESETS.some((preset) => preset.elevenLabs.voiceId === voiceId);
}
