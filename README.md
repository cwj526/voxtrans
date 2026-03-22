# VoxTrans

VoxTrans 是一个面向非技术用户的网页工具：

- 输入中文口播文案
- 一键翻译为英文（可按场景优化）
- 再生成英文语音（支持多预设 + 高级参数）

## 使用方法

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

### 翻译配置

- 翻译风格：控制整体语言语气（neutral/news/warm/energetic）。
- 目标受众：让翻译更贴近大众、商业或社媒表达。
- 短视频优化：
  - 开启时：更偏短视频口播，句子更利落、节奏更清晰。
  - 关闭时：更偏通用自然表达。
- 口语化强度 / 句子长度 / 表达节奏：细化输出风格。

### 语音配置

- 基础配置：语音预设、音频格式、语速。
- 高级参数（可折叠）：
  - 音色 ID（Voice ID）
  - 稳定度（stability）
  - 音色相似度（similarity_boost）
  - 表现风格（style）
  - 说话者增强（use_speaker_boost）

## 线上地址

生产环境：
- https://voxtrans-indol.vercel.app

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

# 可选：体验保护
DEMO_ACCESS_CODE=
DEMO_MAX_REQUESTS_PER_HOUR=30
```

### 体验码与限流

- `DEMO_ACCESS_CODE`：
  - 为空时：任何用户都可访问（仅受限流影响）。
  - 非空时：用户需在页面右上角输入体验码后才能调用 API。
- `DEMO_ACCESS_CODE` 规则：
  - 建议仅使用字母和数字（例如 `VOXTRIAL2026`），避免用户输入符号时出错。
  - 体验码由你在部署平台（Vercel）手动设置，不会自动生成。
  - 更换体验码后需要重新部署一次以确保立即生效。
- `DEMO_MAX_REQUESTS_PER_HOUR`：
  - 按 IP + 接口（translate / tts）每小时限流。
  - 限流与体验码是叠加关系：即使体验码正确，仍会受到限流约束。
  - 示例：设为 `30` 时，同一 IP 每小时最多请求 `30` 次翻译接口 + `30` 次语音接口。
  - 设为 `0` 可关闭限流（不建议线上关闭）。

### 页面提示

- 首次进入页面可先填写右上角「体验码（可选）」输入框。
- 未填写体验码调用接口时，会提示“请先输入体验码后再试”。
- 体验码错误时，会提示“体验码不正确，请检查后重试”。
- 达到限流时，会提示“当前访问较多，请稍后再试”。

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
