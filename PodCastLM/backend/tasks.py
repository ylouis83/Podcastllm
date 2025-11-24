import asyncio
import glob
import os
import re
import time
import uuid
from typing import Dict

from backend.celery_worker import celery_app
from backend.constants import AUDIO_CACHE_DIR, GRADIO_CLEAR_CACHE_OLDER_THAN
from backend.utils import clear_pdf_cache, process_lines_with_limit


@celery_app.task(bind=True)
def combine_audio_task(self, text: str, language: str, provider: str, host_voice: str, guest_voice: str) -> str:
    """
    Celery task to generate and combine audio files based on dialogue text.
    """
    try:
        dialogue_regex = r'\*\*([\s\S]*?)\*\*[:：]\s*([\s\S]*?)(?=\*\*|$)'
        matches = re.findall(dialogue_regex, text, re.DOTALL)
        
        lines = [
            {
                "speaker": match[0],
                "content": match[1].strip(),
            }
            for match in matches
        ]

        print("Starting audio generation task...")
        
        if provider == 'azure':
            concurrency = 10
        elif provider == 'qwen':
            concurrency = 1
        else:
            concurrency = 5

        # Since Celery tasks may not have an active asyncio loop, we run the async function
        # using asyncio.run()
        audio_segments = asyncio.run(process_lines_with_limit(lines, provider, host_voice, guest_voice, language, concurrency))
        print("Audio generation completed")

        # Combine audio
        combined_audio = sum(audio_segments)
        print("Audio combined")

        # Save the combined audio to a file
        unique_filename = f"{uuid.uuid4()}.mp3"
        os.makedirs(AUDIO_CACHE_DIR, exist_ok=True)
        file_path = os.path.join(AUDIO_CACHE_DIR, unique_filename)
        
        combined_audio.export(file_path, format="mp3")

        audio_url = f"/audio/{unique_filename}"

        # Clean up old audio files
        for file in glob.glob(f"{AUDIO_CACHE_DIR}*.mp3"):
            if os.path.isfile(file) and time.time() - os.path.getmtime(file) > GRADIO_CLEAR_CACHE_OLDER_THAN:
                os.remove(file)
        
        clear_pdf_cache()

        return audio_url
        
    except Exception as e:
        print(f"Task failed: {e}")
        # The exception will be stored by Celery as the task's result.
        raise

