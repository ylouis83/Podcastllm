import asyncio
import hashlib
from unittest.mock import MagicMock

import pytest
from fastapi import UploadFile
from tempfile import SpooledTemporaryFile

from .. import utils


def _create_upload_file(content: bytes, name: str = "test.pdf") -> UploadFile:
    """Helper function to create an UploadFile for testing."""
    tmp = SpooledTemporaryFile()
    tmp.write(content)
    tmp.seek(0)
    return UploadFile(filename=name, file=tmp)


@pytest.fixture
def mock_cache(monkeypatch):
    """Mocks the diskcache.Cache object in the utils module."""
    mock = MagicMock()
    mock.get.return_value = None
    monkeypatch.setattr(utils, "pdf_cache", mock)
    return mock


def test_get_pdf_text_caching(mock_cache):
    """
    Tests that the get_pdf_text function correctly uses the cache.
    It should call cache.set on the first call and cache.get on the second.
    """
    # PyPDF2 is not installed in the test environment, so we mock the text extraction
    # This also isolates the test to focus only on the caching logic.
    original_pdf_reader = utils.PdfReader
    def mock_pdf_reader(stream):
        mock = MagicMock()
        mock.pages = [MagicMock()]
        mock.pages[0].extract_text.return_value = "This is a test PDF."
        return mock
    
    utils.PdfReader = mock_pdf_reader

    # Prepare a dummy file
    dummy_content = b"dummy pdf content"
    dummy_file = _create_upload_file(dummy_content)
    file_hash = hashlib.md5(dummy_content).hexdigest()

    # --- First Call ---
    # Simulate cache miss
    mock_cache.get.return_value = None
    
    result1 = asyncio.run(utils.get_pdf_text(dummy_file))

    # Assertions for the first call
    mock_cache.get.assert_called_once_with(file_hash)
    mock_cache.set.assert_called_once_with(file_hash, "This is a test PDF.")
    assert result1 == "This is a test PDF."

    # Reset mocks for the second call
    mock_cache.get.reset_mock()
    mock_cache.set.reset_mock()

    # --- Second Call ---
    # Simulate cache hit
    dummy_file.file.seek(0) # Reset file pointer
    mock_cache.get.return_value = "This is a test PDF."

    result2 = asyncio.run(utils.get_pdf_text(dummy_file))

    # Assertions for the second call
    mock_cache.get.assert_called_once_with(file_hash)
    mock_cache.set.assert_not_called() # Should not set again
    assert result2 == "This is a test PDF."

    # Restore original PdfReader
    utils.PdfReader = original_pdf_reader

