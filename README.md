# PodCastLM
将 PDF / URL 转成播客对话，支持多路 TTS 与本地 Whisper 转写。代码位于 `PodCastLM/` 目录。

完整说明请见 `PodCastLM/README.md`，下方是精简版。

## 示例
- [demo.mp4](https://github.com/user-attachments/assets/ed846901-069e-48c5-8576-01b017cd581a)
- [audio demo](./PodCastLM/example/demo.mp3)
- 在线体验：⚡️ [PodCastLM](https://endearing-rabanadas-2ee528.netlify.app)

## 功能
- PDF 上传或 URL 抓取（Jina）生成播客脚本、摘要与节目简介。
- 多路 TTS：FishAudio、Azure Speech、Qwen3 TTS；前端可切换主持人/嘉宾音色。
- 本地 Whisper 转写：前端上传音频，或 CLI 批量转写并导出时间戳文本。
- 流式响应：对话、摘要、信息均以流式返回，前端实时渲染。

## 快速开始

### 后端
```bash
cd PodCastLM/backend
cp .env.example .env  # 填写下方环境变量
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-local.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

关键环境变量：
- `BAILIAN_API_KEY` 或 `QWEN_API_KEY`：Qwen LLM 及 Qwen3 TTS（Fireworks 失效时兜底）。
- `FIREWORKS_API_KEY`（可选）：启用 Llama 3.1 405B（可改 `FIREWORKS_MODEL_ID`）。
- `SPEECH_KEY` / `SPEECH_REGION`：Azure TTS。
- `FISHAUDIO_KEY`：FishAudio TTS。
- `JINA_KEY`：URL 抓取，默认值可用但建议替换。
- `WHISPER_MODEL_NAME`：Whisper 模型名，默认 `small`。
- 其他可选：`DASHSCOPE_LLM_MODEL_ID`、`DASHSCOPE_TEMPERATURE`。

### 前端
```bash
cd PodCastLM/frontend
cp .env.template .env
# 推荐填写
# VITE_HOST_URL=http://localhost:8000
# VITE_BASE_URL=http://localhost:8000/api/v1/chat
pnpm install
pnpm dev --host
```

### 本地转写 CLI
```bash
cd PodCastLM
PYTHONPATH=backend WHISPER_MODEL_NAME=base \
python scripts/local_transcribe.py path/to/audio.m4a --output-file tmp/result.txt
```

## 主要接口（后端）
- `POST /api/v1/chat/generate_transcript`：生成播客对话（流式 JSON）。
- `POST /api/v1/chat/summarize`：生成摘要（流式）。
- `POST /api/v1/chat/pod_info`：生成节目简介与要点。
- `POST /api/v1/chat/transcribe_audio`：上传音频并用本地 Whisper 转写。
- `POST /api/v1/chat/generate_audio` + `GET /api/v1/chat/audio_status/{task_id}`：生成并查询音频。
- `GET /api/v1/chat/speekers`：获取可选音色列表。

## 贡献与致谢
- 初始作者与贡献者：[@YOYZHANG](https://github.com/YOYZHANG)
- 赞助者：[@JiongXin](https://github.com/tonyljx)、[@Terry Zhang](https://github.com/tzhangchi)
- 欢迎提 Issue / PR，若有帮助请 ⭐️ 支持。
