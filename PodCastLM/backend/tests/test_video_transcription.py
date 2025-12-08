
import pytest
from unittest.mock import MagicMock, patch
from pathlib import Path
from fastapi import UploadFile
import io

from services.transcription import TranscriptionService, TranscriptionResult

# Mock moviepy to avoid actual video processing during tests
@pytest.fixture
def mock_moviepy(monkeypatch):
    mock_video_clip = MagicMock()
    mock_video_clip.audio.write_audiofile = MagicMock()
    mock_video_clip.close = MagicMock()
    
    mock_VideoFileClip = MagicMock(return_value=mock_video_clip)
    
    # Needs to be patched where it is imported inside the function
    # Because the import is inside the method, we might need to mock sys.modules or patch the class method
    # For simplicity, we can mock the entire moviepy module
    import sys
    sys.modules["moviepy"] = MagicMock()
    sys.modules["moviepy"].VideoFileClip = mock_VideoFileClip
    return mock_VideoFileClip

@pytest.mark.asyncio
async def test_transcribe_video_upload(mock_moviepy):
    # Mock the transcription service internals
    service = TranscriptionService()
    
    # Mock _transcribe_path to avoid loading Whisper model
    expected_result = TranscriptionResult(text="Video transcription", segments=[])
    service._transcribe_path = MagicMock(return_value=expected_result)
    
    # Create a dummy video file upload
    file_content = b"fake video content"
    upload_file = UploadFile(filename="test.mp4", file=io.BytesIO(file_content))
    
    # Call the method
    # Since we cannot easily patch the local import in the method, 
    # we rely on sys.modules mocking from the fixture.
    
    result = await service.transcribe_video_upload(upload_file)
    
    assert result == expected_result
    service._transcribe_path.assert_called_once()
    
    # Check if a temp file was passed to _transcribe_path (it ends with .mp3)
    call_args = service._transcribe_path.call_args
    assert str(call_args[0][0]).endswith(".mp3")


