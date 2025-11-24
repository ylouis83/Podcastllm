import io
import random
from typing import Optional

from pydub import AudioSegment

from constants import FISHAUDIO_KEY, FISHAUDIO_SPEEKER

try:
    from fish_audio_sdk import Session, TTSRequest, ReferenceAudio  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    Session = None
    TTSRequest = None
    ReferenceAudio = None

def get_adapter_speeker_id(speaker_name):
    speeker = FISHAUDIO_SPEEKER[0]
    if speaker_name != "主持人": 
        speeker = random.choice(FISHAUDIO_SPEEKER)
    return speeker["id"]

def fishaudio_tts(text, reference_id=None) -> AudioSegment:
    """
    将给定的文本转换为语音并返回AudioSegment对象。
    
    :param text: 要转换的文本
    :param reference_id: 可选参数，使用的模型 ID
    :return: 返回生成的语音的AudioSegment对象
    """
    if Session is None or TTSRequest is None:
        raise RuntimeError("fish_audio_sdk 未安装或不可用，无法调用 Fish Audio TTS。")
    session = Session(FISHAUDIO_KEY)
    audio_buffer = io.BytesIO()
    for chunk in session.tts(TTSRequest(
        reference_id=reference_id,
        text=text
    )):
        audio_buffer.write(chunk)
    audio_buffer.seek(0)  # 重置缓冲区的位置
    return AudioSegment.from_file(audio_buffer, format="mp3")
