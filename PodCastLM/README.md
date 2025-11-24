<h1 align="center">欢迎来到 PodCastLM 👋</h1>

[English](/README_EN.md)

## ✨ 示例
[demo.mp4](https://github.com/user-attachments/assets/ed846901-069e-48c5-8576-01b017cd581a)

[audio demo](./example/demo.mp3)

在线地址: ⚡️ [PodCastLM](https://endearing-rabanadas-2ee528.netlify.app.)

## OverView
该项目的灵感来自于 Google NotebookLM 工具。通过处理 PDF 的内容，生成适合音频播客的自然对话，并将其输出为 MP3 文件。

## 🔈 Whisper 转写
- 前端提供“导入语音生成问题”入口，可直接上传音频并调用本地 Whisper 模型转写，识别内容会自动注入问题输入框并展示在面板中。
- 后端 `/api/v1/chat/transcribe_audio` 统一由 `TranscriptionService` 管理 Whisper 模型加载，可通过 `WHISPER_MODEL_NAME` 在 CPU/GPU 之间切换不同体量的模型。
- 亦可使用 `scripts/local_transcribe.py` 在终端中批量转写音频，输出带时间戳的富文本内容。


## 🏆 赞助者

- [@JiongXin](https://github.com/tonyljx)
- [@Terry Zhang](https://github.com/tzhangchi)


## 💻 技术栈
- [React](https://react.dev/) - FrontEnd Development
- [Tailwindcss](https://tailwindcss.com/) - CSS Engine
- [FastAPI](https://fastapi.tiangolo.com/) - BackEnd Development

## 💗 AI 模型
- [Llama-3.1-405B](https://huggingface.co/meta-llama/Llama-3.1-405B) - AI Powered
- [Azure OpenAI TTS](https://azure.microsoft.com/en-us/products/ai-services/openai-service) - TTS Powered

## 👤作者

如果有任何疑问或技术上的交流，可以在 Twitter 或微信上联系我。

**YOYZHANG**

- twitter: [@alexu19049062](https://twitter.com/alexuzhang19049062)
- 微信: whdxzxq

## 🤝 贡献
欢迎贡献 [issues](https://github.com/YOYZHANG/ai-ppt/issues).
如果这个项目对你有帮助，欢迎 ⭐️ 或 Fork.

## 🧪 开发 & 测试
- 后端：`cd backend && pip install -r requirements-local.txt && pytest`
- 前端：`cd frontend && npm install && npm run dev`
- CLI 转写：`PYTHONPATH=backend WHISPER_MODEL_NAME=base python scripts/local_transcribe.py path/to/audio.m4a --output-file tmp/result.txt`

## 📝 License
MIT License © 2024 YOYZHANG
