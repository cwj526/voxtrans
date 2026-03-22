# VoxTrans

中文口播文案 -> 英文翻译 -> ElevenLabs 语音。

当前版本已接入：
- Tuzi（OpenAI-compatible）翻译
- ElevenLabs 语音生成
- Zod 请求校验
- 分层错误码与统一响应结构
- 6 组 voice/style 预设（见 `docs/tts-pipeline-spec.md`）

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

访问 `http://localhost:3000`。

## Environment Variables

```env
TRANSLATION_PROVIDER=tuzi
TRANSLATION_API_KEY=
TRANSLATION_BASE_URL=https://api.tu-zi.com/v1
TRANSLATION_MODEL=gpt-5.4

ELEVENLABS_API_KEY=
ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1
```

## API Contracts

### `POST /api/translate`

Request:

```json
{
  "text": "中文文案",
  "style": "warm",
  "locale": "zh-CN",
  "audience": "general"
}
```

Success:

```json
{
  "ok": true,
  "translatedText": "...",
  "requestId": "...",
  "error": null
}
```

### `POST /api/tts`

Request:

```json
{
  "text": "English text",
  "style": "warm",
  "voiceId": "EXAVITQu4vr4xnSDxMaL",
  "speakingRate": 1.0,
  "format": "mp3_44100_128"
}
```

Success:

```json
{
  "ok": true,
  "audioUrl": "data:audio/mpeg;base64,...",
  "requestId": "...",
  "error": null
}
```

Failure shape:

```json
{
  "ok": false,
  "requestId": "...",
  "error": {
    "code": "VALIDATION_PARAM_OUT_OF_RANGE",
    "message": "语速参数超出允许范围（0.85～1.20）",
    "retryable": false
  }
}
```

## Key Files

- `src/lib/schemas.ts`: Zod schemas
- `src/lib/api-error.ts`: error code map + response helpers
- `src/config/voice-presets.ts`: 6 组 voice/style presets
- `src/app/api/translate/route.ts`: translate endpoint
- `src/app/api/tts/route.ts`: tts endpoint
