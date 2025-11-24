<h1 align="center">欢迎来到 PodCastLM 👋</h1>
<p align="center">将 PDF / URL 转成播客对话，支持多路 TTS 与本地 Whisper 转写。</p>

[English](/README_EN.md)

## ✨ 示例
- [demo.mp4](https://github.com/user-attachments/assets/ed846901-069e-48c5-8576-01b017cd581a)
- [audio demo](./example/demo.mp3)
- 在线体验：⚡️ [PodCastLM](https://endearing-rabanadas-2ee528.netlify.app)

## 功能概览
- 支持 PDF 上传或 URL 抓取（Jina 抓取）生成播客脚本、摘要与节目简介。
- 多路 TTS：FishAudio、Azure Speech、Qwen3 TTS，前端可切换主持人/嘉宾音色。
- 本地 Whisper 转写：前端直接上传音频，或用 CLI 批量转写并导出时间戳文本。
- 流式响应：对话生成、摘要、信息流均以流式返回，前端实时渲染。
- 技术栈：FastAPI + React + Tailwind，后端提供 `/api/v1/chat/*` API。

## 快速开始

### 前置依赖
- Python 3.9+、Node.js 18+（推荐搭配 pnpm）、ffmpeg（pydub 导出 MP3 需要）。
- 首次转写会自动下载 Whisper 模型，可通过 `WHISPER_MODEL_NAME` 选择体量。

### 后端
```bash
cd backend
cp .env.example .env  # 填写下方环境变量
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-local.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

必填/常用环境变量：
- `BAILIAN_API_KEY` 或 `QWEN_API_KEY`：Qwen LLM 及 Qwen3 TTS（Fireworks 失效时兜底）。
- `FIREWORKS_API_KEY`（可选）：启用 Llama 3.1 405B（`FIREWORKS_MODEL_ID` 可覆盖）。
- `SPEECH_KEY` / `SPEECH_REGION`：Azure TTS。
- `FISHAUDIO_KEY`：FishAudio TTS。
- `JINA_KEY`：URL 抓取（必填，自行申请后填入）。
- `WHISPER_MODEL_NAME`：Whisper 模型名，默认 `small`。
- 其它可选：`DASHSCOPE_LLM_MODEL_ID`、`DASHSCOPE_TEMPERATURE`。

### 前端
```bash
cd frontend
cp .env.template .env
# 推荐填写
# VITE_HOST_URL=http://localhost:8000
# VITE_BASE_URL=http://localhost:8000/api/v1/chat
pnpm install
pnpm dev --host
```

## 主要接口
- `POST /api/v1/chat/generate_transcript`：生成播客对话（PDF/URL + 提问，流式 JSON）。
- `POST /api/v1/chat/summarize`：生成摘要（流式）。
- `POST /api/v1/chat/pod_info`：生成节目简介与要点。
- `POST /api/v1/chat/transcribe_audio`：上传音频并用本地 Whisper 转写。
- `POST /api/v1/chat/generate_audio`：按对话文本生成音频，返回 `task_id`；`GET /api/v1/chat/audio_status/{task_id}` 查询结果。
- `GET /api/v1/chat/speekers`：获取可选音色列表。

## 本地转写 CLI
```bash
PYTHONPATH=backend WHISPER_MODEL_NAME=base \
python scripts/local_transcribe.py path/to/audio.m4a --output-file tmp/result.txt
```

## 开发与测试
- 后端单测：`cd backend && pytest`
- 前端开发：`cd frontend && pnpm dev`

## 致谢
- 初始作者与贡献者：[@YOYZHANG](https://github.com/YOYZHANG)
- 赞助者：[@JiongXin](https://github.com/tonyljx)、[@Terry Zhang](https://github.com/tzhangchi)
