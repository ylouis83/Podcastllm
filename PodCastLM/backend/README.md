## Installation

To set up the project, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone git@github.com:YOYZHANG/PodCastLM.git
   cd PodCastLM/backend
   ```

2. **Create a virtual environment and activate it:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

3. **Install the required packages:**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Set up API Key(s):**
   For this project, I am using LLama 3.1 405B hosted on Fireworks API and Azure OpenAI TTS API. So, please set the API key as the `FIREWORKS_API_KEY` and `SPEECH_KEY`environment variable

```
FIREWORKS_API_KEY=
SPEECH_KEY=
WHISPER_MODEL_NAME=small  # 可选，默认为 small
```

复制 `.env.example` 为 `.env` 并填写 `BAILIAN_API_KEY`（百炼）、`FIREWORKS_API_KEY` 等：

```bash
cp backend/.env.example backend/.env
```

2. **Install FFmpeg (Whisper 依赖):**

Whisper 在本地推理需要 FFmpeg。macOS 可使用 `brew install ffmpeg`，其他平台请参考 FFmpeg 官网文档。

3. **Run the application:**
   ```bash
   uvicorn main:app --reload
   ```

## Whisper 本地语音转写

- 依赖 `openai-whisper` Python 包（已包含在 `requirements*.txt` 中）与 FFmpeg。
- 通过 `POST /api/v1/chat/transcribe_audio` 上传音频文件，可获得本地模型转写结果。
- 使用 `WHISPER_MODEL_NAME` 环境变量控制模型尺寸（如 `base`、`small`、`medium`、`large-v3` 等），默认为 `small`。

## Testing

1. 安装开发依赖：
   ```bash
   pip install -r requirements-local.txt
   ```
2. 运行单元测试：
   ```bash
   pytest
   ```

## CLI 转写脚本

根目录的 `scripts/local_transcribe.py` 复用了后端的 Whisper 服务，可输出带时间戳的转写结果并写入文件。

```bash
PYTHONPATH=backend WHISPER_MODEL_NAME=medium python scripts/local_transcribe.py /path/to/audio.m4a --output-file tmp/result.txt
```

## License
MIT License © 2024 YOYZHANG
