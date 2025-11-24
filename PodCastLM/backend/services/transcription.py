"""
Local Whisper transcription service.
"""

from __future__ import annotations

import asyncio
import logging
import os
import tempfile
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, Optional

from fastapi import UploadFile
import whisper

try:
    from ..constants import WHISPER_MODEL_NAME
except ImportError:
    from constants import WHISPER_MODEL_NAME  # type: ignore

logger = logging.getLogger(__name__)


ModelLoader = Callable[[str], Any]
WhisperResult = Dict[str, Any]


@dataclass(frozen=True)
class TranscriptionResult:
    """Normalized transcription payload."""

    text: str
    segments: Iterable[Dict[str, Any]]


class TranscriptionService:
    """Encapsulates Whisper model loading and transcription helpers."""

    def __init__(
        self,
        model_name: Optional[str] = None,
        *,
        task: str = "transcribe",
        temperature: float = 0.0,
        initial_prompt: Optional[str] = None,
        condition_on_previous_text: bool = True,
        model_loader: Optional[ModelLoader] = None,
    ) -> None:
        self.model_name = model_name or WHISPER_MODEL_NAME
        self.task = task
        self.temperature = temperature
        self.initial_prompt = initial_prompt
        self.condition_on_previous_text = condition_on_previous_text
        self._model_loader = model_loader or whisper.load_model
        self._model: Optional[Any] = None
        self._lock = threading.Lock()

    def _ensure_model(self) -> Any:
        if self._model is not None:
            return self._model
        with self._lock:
            if self._model is None:
                logger.info("Loading Whisper model '%s'", self.model_name)
                self._model = self._model_loader(self.model_name)
        return self._model

    def _transcribe_path(self, audio_path: Path, *, language: Optional[str]) -> TranscriptionResult:
        model = self._ensure_model()
        raw: WhisperResult = model.transcribe(
            str(audio_path),
            language=language,
            task=self.task,
            temperature=self.temperature,
            initial_prompt=self.initial_prompt,
            condition_on_previous_text=self.condition_on_previous_text,
            fp16=False,
            verbose=False,
        )
        text = (raw.get("text") or "").strip()
        segments = raw.get("segments") or []
        return TranscriptionResult(text=text, segments=segments)

    async def transcribe_upload(self, audio_file: UploadFile, *, language: Optional[str] = None) -> TranscriptionResult:
        """Transcribe an uploaded audio file."""
        contents = await audio_file.read()
        await audio_file.seek(0)

        if not contents:
            raise ValueError("音频文件为空或无法读取。")

        suffix = Path(audio_file.filename or "").suffix or ".wav"

        def _run_transcription() -> TranscriptionResult:
            tmp_path: Optional[Path] = None
            try:
                with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_file:
                    tmp_file.write(contents)
                    tmp_path = Path(tmp_file.name)
                return self._transcribe_path(tmp_path, language=language)
            finally:
                if tmp_path and tmp_path.exists():
                    try:
                        tmp_path.unlink()
                    except OSError as exc:
                        logger.warning("Failed to remove temp audio file %s: %s", tmp_path, exc)

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, _run_transcription)

    def transcribe_local_file(self, audio_path: Path, *, language: Optional[str] = None) -> TranscriptionResult:
        """Synchronously transcribe a local audio file."""
        audio_path = audio_path.expanduser().resolve()
        if not audio_path.exists():
            raise FileNotFoundError(audio_path)
        return self._transcribe_path(audio_path, language=language)


_SERVICE: Optional[TranscriptionService] = None


def get_transcription_service() -> TranscriptionService:
    """Return a singleton TranscriptionService."""
    global _SERVICE
    if _SERVICE is None:
        _SERVICE = TranscriptionService(model_name=os.getenv("WHISPER_MODEL_NAME", WHISPER_MODEL_NAME))
    return _SERVICE
