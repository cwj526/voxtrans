# 中文文案 → 英文翻译 → ElevenLabs 语音工具配置方案

> 版本 v1.0 · 适用技术栈：Next.js App Router + TypeScript + Zod + ElevenLabs API

---

## 目录

- [A. Voice/Style 组合方案](#a-voicestyle-组合方案)
- [B. API 请求参数校验规范（Zod）](#b-api-请求参数校验规范zod)
- [C. 错误码分层规范](#c-错误码分层规范)
- [工程落地建议清单](#工程落地建议清单)

---

## A. Voice/Style 组合方案

**默认推荐组合 ID：`warm_story_female`**

---

### 1. `formal_news_male` — 正式新闻男声

| 字段 | 值 |
|------|----|
| **displayNameZh** | 正式新闻男声 |
| **useCase** | 新闻播报 / 财经资讯 / 政企公告 |
| **translationTone** | `news` |
| **speakingRate** | `0.95` |

**ElevenLabs 配置**

```json
{
  "voiceId": "onwK4e9ZLuTAKqWW03F9",
  "voiceName": "Daniel - Steady Broadcaster",
  "modelId": "eleven_multilingual_v2",
  "voiceSettings": {
    "stability": 0.82,
    "similarity_boost": 0.70,
    "style": 0.10,
    "use_speaker_boost": true
  }
}
```

**示例文案**

- 中文：`今日，国家统计局发布最新消费价格指数，同比上涨0.4%。`
- 英文风格说明：Neutral, authoritative AP-wire style; precise noun phrases, no contractions, no filler

---

### 2. `warm_story_female` — 温暖讲述女声 ⭐ 默认推荐

| 字段 | 值 |
|------|----|
| **displayNameZh** | 温暖讲述女声 |
| **useCase** | 品牌故事 / 纪录片旁白 / 情感短视频 |
| **translationTone** | `warm` |
| **speakingRate** | `0.90` |

**ElevenLabs 配置**

```json
{
  "voiceId": "EXAVITQu4vr4xnSDxMaL",
  "voiceName": "Sarah - Mature, Reassuring, Confident",
  "modelId": "eleven_multilingual_v2",
  "voiceSettings": {
    "stability": 0.60,
    "similarity_boost": 0.78,
    "style": 0.42,
    "use_speaker_boost": true
  }
}
```

**示例文案**

- 中文：`每一款产品背后，都藏着一个关于坚持的故事。`
- 英文风格说明：Warm, conversational; gentle imagery, light metaphor, sentence rhythm mimics spoken cadence

---

### 3. `energetic_promo_male` — 强促销男声

| 字段 | 值 |
|------|----|
| **displayNameZh** | 强促销男声 |
| **useCase** | 大促活动 / 限时秒杀 / 电商口播 |
| **translationTone** | `energetic` |
| **speakingRate** | `1.12` |

**ElevenLabs 配置**

```json
{
  "voiceId": "IKne3meq5aSn9XLyUdCD",
  "voiceName": "Charlie - Deep, Confident, Energetic",
  "modelId": "eleven_multilingual_v2",
  "voiceSettings": {
    "stability": 0.38,
    "similarity_boost": 0.85,
    "style": 0.75,
    "use_speaker_boost": true
  }
}
```

**示例文案**

- 中文：`全场五折，仅限今天！错过再等一年！`
- 英文风格说明：High-energy, punchy; short imperatives, exclamation rhythm, urgency words like "now / only / limited"

---

### 4. `professional_explainer_female` — 专业讲解女声

| 字段 | 值 |
|------|----|
| **displayNameZh** | 专业讲解女声 |
| **useCase** | 产品介绍 / 功能演示 / 教育课程 |
| **translationTone** | `neutral` |
| **speakingRate** | `0.97` |

**ElevenLabs 配置**

```json
{
  "voiceId": "Xb7hH8MSUJpSbSDYk0k2",
  "voiceName": "Alice - Clear, Engaging Educator",
  "modelId": "eleven_multilingual_v2",
  "voiceSettings": {
    "stability": 0.72,
    "similarity_boost": 0.68,
    "style": 0.20,
    "use_speaker_boost": false
  }
}
```

**示例文案**

- 中文：`这项功能可以自动识别异常数据，并在三秒内完成修复。`
- 英文风格说明：Clear, instructional; active voice, subject-verb-object, minimal jargon, smooth logical connectors

---

### 5. `youth_social_female` — 年轻社媒女声

| 字段 | 值 |
|------|----|
| **displayNameZh** | 年轻社媒女声 |
| **useCase** | 短视频口播 / 潮品种草 / Z世代内容 |
| **translationTone** | `energetic` |
| **speakingRate** | `1.18` |

**ElevenLabs 配置**

```json
{
  "voiceId": "FGY2WhTYpPnrIDTdsKH5",
  "voiceName": "Laura - Enthusiast, Quirky Attitude",
  "modelId": "eleven_multilingual_v2",
  "voiceSettings": {
    "stability": 0.30,
    "similarity_boost": 0.88,
    "style": 0.85,
    "use_speaker_boost": true
  }
}
```

**示例文案**

- 中文：`这个口红颜色真的绝了，每次出门都被问链接！`
- 英文风格说明：Casual, vivid, colloquial; contractions, trendy intensifiers ("literally", "obsessed"), TikTok pacing

---

### 6. `calm_service_female` — 客服安抚女声

| 字段 | 值 |
|------|----|
| **displayNameZh** | 客服安抚女声 |
| **useCase** | 客服说明 / 投诉处理 / 退换货引导 |
| **translationTone** | `warm` |
| **speakingRate** | `0.87` |

**ElevenLabs 配置**

```json
{
  "voiceId": "XrExE9yKIg1WjnnlVkGX",
  "voiceName": "Matilda - Knowledgeable, Professional",
  "modelId": "eleven_multilingual_v2",
  "voiceSettings": {
    "stability": 0.88,
    "similarity_boost": 0.62,
    "style": 0.08,
    "use_speaker_boost": false
  }
}
```

**示例文案**

- 中文：`非常抱歉给您带来不便，我们将在24小时内为您妥善处理。`
- 英文风格说明：Calm, empathetic; acknowledge first, clear next-step, no passive-blame language

---

### 参数区分度一览

| id | stability | similarity_boost | style | speakingRate | speaker_boost |
|----|-----------|-----------------|-------|--------------|---------------|
| formal_news_male | 0.82 | 0.70 | 0.10 | 0.95 | true |
| warm_story_female | 0.60 | 0.78 | 0.42 | 0.90 | true |
| energetic_promo_male | 0.38 | 0.85 | 0.75 | 1.12 | true |
| professional_explainer_female | 0.72 | 0.68 | 0.20 | 0.97 | false |
| youth_social_female | 0.30 | 0.88 | 0.85 | 1.18 | true |
| calm_service_female | 0.88 | 0.62 | 0.08 | 0.87 | false |

---

## B. API 请求参数校验规范（Zod）

### POST `/api/translate`

#### 请求体字段说明

| 字段 | 类型 | 必填 | 默认值 | 范围/枚举 | 错误提示 |
|------|------|------|--------|-----------|----------|
| `text` | string | ✅ | — | 1 ~ 2000 字 | "text 为必填项" / "text 不能为空" / "text 最多 2000 字" |
| `style` | enum | ❌ | `neutral` | neutral / news / warm / energetic | "style 须为 neutral/news/warm/energetic 之一" |
| `locale` | enum | ❌ | `zh-CN` | zh-CN / zh-TW | "locale 须为 zh-CN 或 zh-TW" |
| `audience` | enum | ❌ | `general` | general / business / social | "audience 须为 general/business/social 之一" |

#### Zod Schema

```typescript
import { z } from "zod";

export const TranslateRequestSchema = z.object({
  text: z
    .string({ required_error: "text 为必填项" })
    .min(1, "text 不能为空")
    .max(2000, "text 最多 2000 字"),

  style: z
    .enum(["neutral", "news", "warm", "energetic"], {
      errorMap: () => ({ message: "style 须为 neutral/news/warm/energetic 之一" }),
    })
    .optional()
    .default("neutral"),

  locale: z
    .enum(["zh-CN", "zh-TW"], {
      errorMap: () => ({ message: "locale 须为 zh-CN 或 zh-TW" }),
    })
    .optional()
    .default("zh-CN"),

  audience: z
    .enum(["general", "business", "social"], {
      errorMap: () => ({ message: "audience 须为 general/business/social 之一" }),
    })
    .optional()
    .default("general"),
});

export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;
```

#### 响应体结构

```typescript
// 成功
{
  ok: true,
  translatedText: string,
  requestId: string,
  error: null
}

// 失败
{
  ok: false,
  requestId: string,
  error: {
    code: string,
    message: string,
    details?: unknown,
    requestId: string
  }
}
```

---

### POST `/api/tts`

#### 请求体字段说明

| 字段 | 类型 | 必填 | 默认值 | 范围/枚举 | 错误提示 |
|------|------|------|--------|-----------|----------|
| `text` | string | ✅ | — | 1 ~ 3000 字符 | "text 为必填项" / "英文 text 最多 3000 字符" |
| `style` | enum | ❌ | `neutral` | neutral / news / warm / energetic | "style 须为 neutral/news/warm/energetic 之一" |
| `voiceId` | string | ❌ | — | 最长 128 字符；空值时服务端取 style 对应默认 voice | "voiceId 过长" |
| `speakingRate` | number | ❌ | `1.0` | 0.85 ~ 1.20 | "speakingRate 须在 0.85 ~ 1.20 之间" |
| `format` | enum | ❌ | `mp3_44100_128` | mp3_44100_128 / mp3_44100_192 | "format 须为 mp3_44100_128 或 mp3_44100_192" |

#### Zod Schema

```typescript
import { z } from "zod";

export const TtsRequestSchema = z.object({
  text: z
    .string({ required_error: "text 为必填项" })
    .min(1, "text 不能为空")
    .max(3000, "英文 text 最多 3000 字符"),

  style: z
    .enum(["neutral", "news", "warm", "energetic"], {
      errorMap: () => ({ message: "style 须为 neutral/news/warm/energetic 之一" }),
    })
    .optional()
    .default("neutral"),

  voiceId: z
    .string()
    .max(128, "voiceId 过长")
    .optional(), // 空值时服务端取 style 对应默认 voice

  speakingRate: z
    .number({
      invalid_type_error: "speakingRate 须为数字",
    })
    .min(0.85, "speakingRate 最小 0.85")
    .max(1.20, "speakingRate 最大 1.20")
    .optional()
    .default(1.0),

  format: z
    .enum(["mp3_44100_128", "mp3_44100_192"], {
      errorMap: () => ({ message: "format 须为 mp3_44100_128 或 mp3_44100_192" }),
    })
    .optional()
    .default("mp3_44100_128"),
});

export type TtsRequest = z.infer<typeof TtsRequestSchema>;
```

#### 响应体结构

```typescript
// 成功
{
  ok: true,
  audioUrl: string, // https://cdn.xxx/xxx.mp3 或 data:audio/mp3;base64,...
  requestId: string,
  error: null
}

// 失败
{
  ok: false,
  requestId: string,
  error: {
    code: string,
    message: string,
    details?: unknown,
    requestId: string
  }
}
```

---

### 共用 Zod Response Schema

```typescript
import { z } from "zod";

const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  requestId: z.string(),
});

export const TranslateResponseSchema = z.object({
  ok: z.boolean(),
  translatedText: z.string().optional(),
  requestId: z.string(),
  error: ErrorSchema.nullable(),
});

export const TtsResponseSchema = z.object({
  ok: z.boolean(),
  audioUrl: z.string().optional(),
  requestId: z.string(),
  error: ErrorSchema.nullable(),
});
```

---

### 非法请求示例

**示例 1：text 超长**

```http
POST /api/translate
Content-Type: application/json

{ "text": "...（2001 字）..." }
```

期望错误：

```json
{
  "ok": false,
  "requestId": "req_abc123",
  "error": {
    "code": "VALIDATION_TEXT_TOO_LONG",
    "message": "输入文本不能超过 2000 字",
    "requestId": "req_abc123"
  }
}
```

**示例 2：speakingRate 越界**

```http
POST /api/tts
Content-Type: application/json

{ "text": "Hello world", "speakingRate": 1.5 }
```

期望错误：

```json
{
  "ok": false,
  "requestId": "req_def456",
  "error": {
    "code": "VALIDATION_PARAM_OUT_OF_RANGE",
    "message": "speakingRate 须在 0.85 ~ 1.20 之间",
    "requestId": "req_def456"
  }
}
```

**示例 3：style 枚举不合法**

```http
POST /api/translate
Content-Type: application/json

{ "text": "你好世界", "style": "funny" }
```

期望错误：

```json
{
  "ok": false,
  "requestId": "req_ghi789",
  "error": {
    "code": "VALIDATION_ENUM_INVALID",
    "message": "style 须为 neutral/news/warm/energetic 之一",
    "requestId": "req_ghi789"
  }
}
```

---

## C. 错误码分层规范

### 统一错误结构

```typescript
interface ApiError {
  code: string;       // 机器可读，全大写下划线，如 VALIDATION_TEXT_TOO_LONG
  message: string;    // 用户可读中文，直接展示在 Toast/提示组件
  details?: unknown;  // 可选：字段级校验列表 { field, msg }[]，或供日志的原始信息
  requestId: string;  // 每次请求唯一 ID，用于日志追查
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error: ApiError | null;
  requestId: string;
}
```

---

### VALIDATION_* — HTTP 400 参数问题

| 错误码 | HTTP | 触发条件 | 前端 message | 可重试 |
|--------|------|----------|-------------|--------|
| `VALIDATION_TEXT_MISSING` | 400 | text 字段缺失或为 undefined | 请输入需要处理的文本内容 | 否 |
| `VALIDATION_TEXT_TOO_LONG` | 400 | text 超过长度限制 | 输入文本超出最大长度限制 | 否 |
| `VALIDATION_ENUM_INVALID` | 400 | style/locale/audience/format 枚举值不在允许集合内 | 参数值不合法，请检查请求格式 | 否 |
| `VALIDATION_PARAM_OUT_OF_RANGE` | 400 | speakingRate 不在 0.85~1.20 | 语速参数超出允许范围（0.85～1.20） | 否 |
| `VALIDATION_VOICE_ID_UNKNOWN` | 400 | voiceId 不在服务端声纹白名单内 | 声音 ID 不存在，请重新选择 | 否 |

---

### TRANSLATION_* — HTTP 502/503/429 翻译供应商问题

| 错误码 | HTTP | 触发条件 | 前端 message | 可重试 |
|--------|------|----------|-------------|--------|
| `TRANSLATION_PROVIDER_TIMEOUT` | 502 | 翻译 API 响应超时（> 10s） | 翻译服务响应超时，请稍后重试 | 是 |
| `TRANSLATION_PROVIDER_ERROR` | 502 | 翻译供应商返回 5xx 错误 | 翻译服务暂时不可用，请稍后重试 | 是 |
| `TRANSLATION_QUOTA_EXCEEDED` | 429 | 翻译供应商配额耗尽 | 翻译配额已用尽，请联系管理员 | 否 |
| `TRANSLATION_LANGUAGE_UNSUPPORTED` | 400 | 检测到非 zh-CN/zh-TW 语言 | 当前仅支持简体/繁体中文输入 | 否 |

---

### TTS_* — HTTP 502/503/429 语音供应商问题

| 错误码 | HTTP | 触发条件 | 前端 message | 可重试 |
|--------|------|----------|-------------|--------|
| `TTS_PROVIDER_TIMEOUT` | 502 | ElevenLabs API 响应超时（> 15s） | 语音生成超时，请稍后重试 | 是 |
| `TTS_PROVIDER_ERROR` | 502 | ElevenLabs 返回 5xx | 语音服务暂时不可用，请稍后重试 | 是 |
| `TTS_QUOTA_EXCEEDED` | 429 | ElevenLabs 字符配额不足 | 语音生成配额已用尽，请联系管理员 | 否 |
| `TTS_AUDIO_EMPTY` | 502 | ElevenLabs 返回空音频流 | 语音生成结果异常，请重试 | 是 |

---

### INTERNAL_* — HTTP 500 服务内部问题

| 错误码 | HTTP | 触发条件 | 前端 message | 可重试 |
|--------|------|----------|-------------|--------|
| `INTERNAL_UNHANDLED` | 500 | 未捕获异常 / runtime crash | 服务内部错误，请稍后重试 | 是 |
| `INTERNAL_STORAGE_FAILED` | 500 | 音频文件上传 CDN/OSS 失败 | 音频存储失败，请稍后重试 | 是 |
| `INTERNAL_CONFIG_MISSING` | 500 | 环境变量 / 声纹配置未初始化 | 服务配置异常，请联系技术支持 | 否 |
| `INTERNAL_REQUEST_ID_FAIL` | 500 | requestId 生成失败（极低概率） | 服务内部错误，请稍后重试 | 是 |

---

## 工程落地建议清单

> 面向 Next.js App Router Route Handlers（`app/api/*/route.ts`）

**1. 集中校验入口**
在每个 Route Handler 顶部统一执行 `Schema.safeParse(body)`，失败直接 `return` 格式化错误，不进入业务逻辑。

```typescript
// app/api/translate/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = TranslateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return makeErrorResponse("VALIDATION_ENUM_INVALID", parsed.error.flatten());
  }
  // 业务逻辑...
}
```

**2. requestId 中间件**
在 `middleware.ts` 为每个请求注入 `x-request-id` 头（`nanoid(12)`），Route Handler 读取并写入所有响应和日志。

```typescript
// middleware.ts
import { nanoid } from "nanoid";
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("x-request-id", nanoid(12));
  return res;
}
```

**3. 错误工厂函数**
创建 `lib/apiError.ts` 导出 `makeError(code, details?)`，内部自动查表获取 `httpStatus` / `message`，避免在各路由硬编码。

```typescript
// lib/apiError.ts
const ERROR_MAP: Record<string, { httpStatus: number; message: string }> = {
  VALIDATION_TEXT_TOO_LONG: { httpStatus: 400, message: "输入文本超出最大长度限制" },
  TTS_PROVIDER_TIMEOUT:     { httpStatus: 502, message: "语音生成超时，请稍后重试" },
  // ...
};

export function makeError(code: string, details?: unknown, requestId?: string) {
  const { httpStatus, message } = ERROR_MAP[code] ?? { httpStatus: 500, message: "未知错误" };
  return NextResponse.json({ ok: false, error: { code, message, details, requestId } }, { status: httpStatus });
}
```

**4. Zod 错误扁平化**
使用 `err.flatten().fieldErrors` 将 Zod 多字段错误转为 `details` 数组，前端直接映射到表单字段提示。

```typescript
const parsed = Schema.safeParse(body);
if (!parsed.success) {
  return makeError("VALIDATION_ENUM_INVALID", parsed.error.flatten().fieldErrors, requestId);
}
```

**5. 超时 AbortController**
翻译/TTS 的 `fetch` 调用均包裹 `AbortController + setTimeout`，翻译建议 10s，TTS 建议 20s。

```typescript
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 10_000);
try {
  const res = await fetch(TRANSLATE_URL, { signal: controller.signal, ... });
} catch (e) {
  if ((e as Error).name === "AbortError") throw new AppError("TRANSLATION_PROVIDER_TIMEOUT");
} finally {
  clearTimeout(timer);
}
```

**6. 供应商错误隔离**
捕获外部 API 错误后，仅将 `code + requestId` 返回给前端；原始 `response.text()` 写入 server log，不泄露到客户端。

```typescript
const raw = await elevenLabsRes.text();
logger.error({ requestId, raw }); // 只写日志
return makeError("TTS_PROVIDER_ERROR", undefined, requestId); // 不透传 raw
```

**7. speakingRate 传递策略**
`speakingRate` 为我方自定义参数，不直接传 ElevenLabs；在 Route Handler 内将速率映射到 ElevenLabs `voice_settings` 相关字段（如有），或在后处理音频时通过 FFmpeg 变速。

```typescript
// 示例：映射到 ElevenLabs speed（如 API 支持）
const elevenPayload = {
  voice_settings: {
    stability: voiceConfig.stability,
    similarity_boost: voiceConfig.similarity_boost,
    style: voiceConfig.style,
    use_speaker_boost: voiceConfig.use_speaker_boost,
    // speed 字段视 ElevenLabs 版本而定
  }
};
```

**8. 音频 URL 策略**
优先将 ElevenLabs 音频流 pipe 到 R2/S3 返回持久 URL；文件 < 500KB 时可返回 data URL（Base64），需在响应头注明 `X-Audio-Delivery: dataurl`。

```typescript
if (audioBuffer.byteLength < 500_000) {
  const dataUrl = `data:audio/mp3;base64,${Buffer.from(audioBuffer).toString("base64")}`;
  return NextResponse.json({ ok: true, audioUrl: dataUrl, requestId }, {
    headers: { "X-Audio-Delivery": "dataurl" }
  });
}
// 否则上传 R2/S3 返回持久 URL
```

**9. 重试标记透出**
在错误响应中可选加 `retryable: true`，前端据此决定是否展示"重试"按钮，避免对不可重试错误（如配额耗尽）显示重试入口。

```typescript
// ERROR_MAP 中扩展 retryable 字段
const ERROR_MAP = {
  TTS_PROVIDER_TIMEOUT: { httpStatus: 502, message: "...", retryable: true },
  TTS_QUOTA_EXCEEDED:   { httpStatus: 429, message: "...", retryable: false },
};
```

**10. 类型导出对齐**
将 `TranslateRequest` / `TtsRequest` / `ApiError` 类型统一从 `types/api.ts` 导出，Route Handler 和前端 fetch wrapper 共用同一份类型，消除不一致。

```typescript
// types/api.ts
export type { TranslateRequest, TtsRequest } from "@/lib/schemas";
export type { ApiError, ApiResponse } from "@/lib/apiError";

// 前端 fetch wrapper 直接引用
import type { TtsRequest, ApiResponse } from "@/types/api";
```

---