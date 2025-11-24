import asyncio
from pathlib import Path
from tempfile import SpooledTemporaryFile

from fastapi import UploadFile
import pytest

from services.transcription import TranscriptionResult, TranscriptionService


def _create_upload_file(content: bytes, name: str = "demo.wav") -> UploadFile:
    tmp = SpooledTemporaryFile()
    tmp.write(content)
    tmp.seek(0)
    return UploadFile(filename=name, file=tmp)


def test_transcribe_local_file_uses_model_loader(tmp_path, monkeypatch):
    called = []

    class DummyModel:
        def transcribe(self, path, **kwargs):
            called.append((Path(path).name, kwargs))
            return {"text": " sample text ", "segments": [{"text": "sample"}]}

    service = TranscriptionService(
        model_name="dummy",
        model_loader=lambda _: DummyModel(),
    )

    audio_path = tmp_path / "audio.wav"
    audio_path.write_bytes(b"fake")

    result = service.transcribe_local_file(audio_path)

    assert isinstance(result, TranscriptionResult)
    assert result.text == "sample text"
    assert len(result.segments) == 1
    assert called, "model.transcribe was not invoked"


def test_transcribe_upload_reuses_loaded_model(tmp_path):
    loader_calls = 0

    class DummyModel:
        def __init__(self):
            pass

        def transcribe(self, path, **kwargs):
            data = Path(path).read_bytes().decode()
            return {"text": data, "segments": []}

    def loader(name):
        nonlocal loader_calls
        loader_calls += 1
        return DummyModel()

    service = TranscriptionService(model_name="dummy", model_loader=loader)

    upload = _create_upload_file(b"hello world")

    async def _transcribe_twice():
        first = await service.transcribe_upload(upload)
        upload.file.seek(0)
        second = await service.transcribe_upload(upload)
        return first, second

    first, second = asyncio.run(_transcribe_twice())

    assert first.text == second.text == "hello world"
    assert loader_calls == 1


def test_transcribe_upload_empty_file_raises():
    service = TranscriptionService(model_name="dummy", model_loader=lambda _: object())
    upload = _create_upload_file(b"")

    with pytest.raises(ValueError):
        asyncio.run(service.transcribe_upload(upload))
