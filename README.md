# VoxTrans

一个面向非技术用户的网页工具骨架：
- 中文口播文案 -> 英文翻译
- 英文文案 -> 英文语音（多风格）

当前阶段为 Step 1：项目骨架 + Mock API，可直接运行并继续扩展。

## 技术栈

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- npm

## 快速启动

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 环境变量

复制示例文件并填写后续真实服务配置：

```bash
cp .env.example .env.local
```

示例键名：
- `TRANSLATION_API_KEY`
- `TRANSLATION_BASE_URL`
- `TRANSLATION_MODEL`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_BASE_URL`
- `ELEVENLABS_VOICE_ID`

## 当前 API 占位接口

### `POST /api/translate`

Request:

```json
{
  "text": "中文文案",
  "style": "neutral"
}
```

Response:

```json
{
  "ok": true,
  "translatedText": "[Mock Translation ...]"
}
```

### `POST /api/tts`

Request:

```json
{
  "text": "English text",
  "style": "neutral",
  "voiceId": "default"
}
```

Response:

```json
{
  "ok": true,
  "audioUrl": "https://example.com/mock-audio.mp3?..."
}
```

## 目录说明（后续扩展位）

- `src/app/api/translate/route.ts`: 翻译 API 路由
- `src/app/api/tts/route.ts`: 语音 API 路由
- `src/lib/translate`: 翻译服务封装（后续接 DeepSeek/OpenAI）
- `src/lib/tts`: TTS 服务封装（后续接 ElevenLabs）
- `src/types`: 请求/响应类型
