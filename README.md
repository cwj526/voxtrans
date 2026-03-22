# VoxTrans

VoxTrans 是一个面向非技术用户的网页工具：

- 输入中文口播文案
- 一键翻译为英文（可按场景优化）
- 再生成英文语音（支持多预设 + 高级参数）

## 如何使用（给最终用户）

1. 在「文本输入」区输入中文文案。
2. 点击 `1. 生成英文文本`，得到英文脚本。
3. 可直接在「生成结果」区手动微调英文文本。
4. 按需调整「翻译配置」与「语音配置」。
5. 点击 `2. 生成英文音频`，生成并试听语音。
6. 使用结果区按钮执行：
   - 复制英文文本
   - 下载英文文本（`.txt`）
   - 下载音频（`.mp3`）
   - 打开音频链接
7. 在「历史记录」区可加载之前的记录（含已缓存的历史音频）。

### 翻译配置说明

- 翻译风格：控制整体语言语气（neutral/news/warm/energetic）。
- 目标受众：让翻译更贴近大众、商业或社媒表达。
- 短视频优化：
  - 开启时：更偏短视频口播，句子更利落、节奏更清晰。
  - 关闭时：更偏通用自然表达。
- 口语化强度 / 句子长度 / 表达节奏：细化输出风格。

### 语音配置说明

- 基础配置：语音预设、音频格式、语速。
- 高级参数（可折叠）：
  - 音色 ID（Voice ID）
  - 稳定度（stability）
  - 音色相似度（similarity_boost）
  - 表现风格（style）
  - 说话者增强（use_speaker_boost）

## 线上地址

预览环境：
- https://skill-deploy-s5ovt4ks8g-codex-agent-deploys.vercel.app

## 核心功能

- 两步工作流：
  1. 生成英文文本
  2. 生成英文音频
- 翻译优化参数：
  - 语气风格（neutral/news/warm/energetic）
  - 短视频模式
  - 口语化强度
  - 句长控制
  - 节奏控制
- 语音高度自定义：
  - 6 套语音预设
  - 音色 ID（Voice ID）、语速、格式
  - stability / similarity_boost / style / use_speaker_boost（高级参数）
- 结果操作：
  - 一键复制英文文本
  - 下载英文文本（.txt）
  - 下载音频文件（.mp3）
- 使用体验：
  - 历史记录（本地保存最近 20 条）
  - 历史音频缓存（IndexedDB，本机浏览器可回放）
  - 参数模板自动记忆
  - 统一错误码与 requestId 展示
  - 可重试错误支持“重试上一步”

## 技术栈

- Next.js（App Router）
- TypeScript
- Tailwind CSS
- Zod
- Tuzi（OpenAI-compatible）翻译接口
- ElevenLabs TTS

## 本地启动

```bash
npm install
cp .env.example .env.local
npm run dev
```

启动后访问：
- http://localhost:3000

## 环境变量

在 `.env.local` 中配置：

```env
TRANSLATION_PROVIDER=tuzi
TRANSLATION_API_KEY=
TRANSLATION_BASE_URL=https://api.tu-zi.com/v1
TRANSLATION_MODEL=gpt-5.4

ELEVENLABS_API_KEY=
ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1
```

## API 概览

### `POST /api/translate`

用于中文 -> 英文翻译。

请求示例：

```json
{
  "text": "今天给大家介绍一款新工具。",
  "style": "warm",
  "audience": "general",
  "videoMode": true,
  "colloquialLevel": "medium",
  "sentenceLength": "short",
  "rhythm": "punchy"
}
```

### `POST /api/tts`

用于英文 -> 语音生成。

请求示例：

```json
{
  "text": "Today I want to introduce a new tool.",
  "style": "warm",
  "presetId": "warm_story_female",
  "voiceId": "EXAVITQu4vr4xnSDxMaL",
  "speakingRate": 1.0,
  "format": "mp3_44100_128",
  "stability": 0.6,
  "similarityBoost": 0.78,
  "voiceStyle": 0.42,
  "useSpeakerBoost": true
}
```

## 目录说明

- `src/app/page.tsx`：主工作台页面
- `src/app/api/translate/route.ts`：翻译接口
- `src/app/api/tts/route.ts`：语音接口
- `src/lib/audio-history-db.ts`：历史音频（IndexedDB）读写
- `src/lib/schemas.ts`：Zod 请求校验
- `src/lib/api-error.ts`：错误码映射与响应构建
- `src/config/voice-presets.ts`：语音预设配置
- `docs/tts-pipeline-spec.md`：语音与参数规范文档
