import asyncio
from http import HTTPStatus
import glob
import io
import os
import re
import time
import hashlib
import json
import logging
from typing import Any, Dict, Generator, Optional
import uuid
from openai import OpenAI, APIError
import requests
from fishaudio import fishaudio_tts
from prompts import LANGUAGE_MODIFIER, LENGTH_MODIFIERS, PODCAST_INFO_PROMPT, QUESTION_MODIFIER, SUMMARY_INFO_PROMPT, SYSTEM_PROMPT, TONE_MODIFIER
from pydub import AudioSegment
from fastapi import UploadFile
from PyPDF2 import PdfReader, errors
from schema import PodcastInfo, ShortDialogue, Summary
from constants import (
    AUDIO_CACHE_DIR,
    BAILIAN_API_KEY,
    FIREWORKS_API_KEY,
    FIREWORKS_BASE_URL,
    FIREWORKS_MODEL_ID,
    FIREWORKS_MAX_TOKENS,
    FIREWORKS_TEMPERATURE,
    GRADIO_CLEAR_CACHE_OLDER_THAN,
    JINA_KEY,
    SPEECH_KEY,
    SPEECH_REGION,
    DASHSCOPE_LLM_MODEL_ID,
    DASHSCOPE_TEMPERATURE,
    WHISPER_MODEL_NAME,
)
import azure.cognitiveservices.speech as speechsdk
import dashscope
from diskcache import Cache
from dashscope import MultiModalConversation, Generation
fw_client = OpenAI(base_url=FIREWORKS_BASE_URL, api_key=FIREWORKS_API_KEY) if FIREWORKS_API_KEY else None
logger = logging.getLogger(__name__)

# Initialize disk cache
PDF_CACHE_DIR = os.path.join(os.path.dirname(__file__), "tmp", "pdf_cache")
os.makedirs(PDF_CACHE_DIR, exist_ok=True)
pdf_cache = Cache(PDF_CACHE_DIR)


def generate_dialogue(pdfFile, textInput, tone, duration, language) -> Generator[str, None, None]:
    modified_system_prompt = get_prompt(pdfFile, textInput, tone, duration, language)
    if (modified_system_prompt == False):
        yield json.dumps({
            "type": "error",
            "content": "Prompt is too long"
        }) + "\n"
        return
    full_response = ""
    llm_stream = call_llm_stream(SYSTEM_PROMPT, modified_system_prompt, ShortDialogue, isJSON=False)

    for chunk in llm_stream:
        yield json.dumps({"type": "chunk", "content": chunk}) + "\n"
        full_response += chunk
        
    yield json.dumps({"type": "final", "content": full_response})


async def _get_whisper_model():
    global _whisper_model
    if _whisper_model is not None:
        return _whisper_model

    def _load_model():
        global _whisper_model
        with _whisper_model_lock:
            if _whisper_model is None:
                logger.info("Loading Whisper model '%s' for local transcription", WHISPER_MODEL_NAME)
                _whisper_model = whisper.load_model(WHISPER_MODEL_NAME)
        return _whisper_model

    return await asyncio.to_thread(_load_model)

async def process_line(line, voice, provider, language):
    if provider == 'fishaudio':
        return await generate_podcast_audio(line['content'], voice)
    if provider == 'qwen':
        return await generate_podcast_audio_by_qwen(line['content'], voice, language)
    return await generate_podcast_audio_by_azure(line['content'], voice)

async def generate_podcast_audio_by_azure(text: str, voice: str) -> str:
    try:
        speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION)
        speech_config.speech_synthesis_voice_name = voice

        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)
        future = await asyncio.to_thread(synthesizer.speak_text_async, text)
        
        result = await asyncio.to_thread(future.get)

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            logger.info("Azure TTS audio synthesized successfully.")
            audio_data = result.audio_data
            return AudioSegment.from_wav(io.BytesIO(audio_data))
        else:
            cancellation_details = result.cancellation_details
            logger.error(f"Azure TTS synthesis failed: {result.reason}")
            if cancellation_details:
                logger.error(f"Cancellation reason: {cancellation_details.reason}")
                logger.error(f"Cancellation error details: {cancellation_details.error_details}")
            return None

    except Exception as e:
        logger.error(f"Error in Azure TTS audio generation: {e}", exc_info=True)
        raise

async def generate_podcast_audio(text: str, voice: str) -> str:
    return await generate_podcast_audio_by_fish(text,voice) 

async def generate_podcast_audio_by_fish(text: str, voice: str) -> str:
    try: 
        return fishaudio_tts(text=text,reference_id=voice)
    except Exception as e:
        print(f"Error in generate_podcast_audio: {e}")
        raise

async def generate_podcast_audio_by_qwen(text: str, voice: str, language: str) -> AudioSegment:
    if not BAILIAN_API_KEY:
        raise RuntimeError("BAILIAN_API_KEY 未配置，无法调用 Qwen TTS。")
    try:
        dashscope.api_key = BAILIAN_API_KEY
        language_type = language or "Chinese"

        def _call_qwen_tts():
            return MultiModalConversation.call(
                model="qwen3-tts-flash",
                api_key=BAILIAN_API_KEY,
                text=text,
                voice=voice,
                language_type=language_type,
                stream=False,
            )

        result = None
        last_error: Optional[Exception] = None
        for attempt in range(3):
            try:
                result = await asyncio.to_thread(_call_qwen_tts)
            except Exception as exc:
                last_error = exc
            else:
                message = getattr(result, "message", "")
                status_code = getattr(result, "status_code", HTTPStatus.OK)
                if status_code == HTTPStatus.OK:
                    break
                if message and "rate limit" in message.lower() and attempt < 2:
                    await asyncio.sleep(2 * (attempt + 1))
                    last_error = RuntimeError(message)
                    continue
                last_error = RuntimeError(message)
                break
            await asyncio.sleep(1)

        if result is None:
            msg = str(last_error) if last_error else "未知错误"
            raise RuntimeError(f"Qwen3 TTS 调用失败: {msg}")

        if getattr(result, "status_code", HTTPStatus.OK) != HTTPStatus.OK:
            raise RuntimeError(f"Qwen3 TTS 调用失败: {getattr(result, 'message', '未知错误')}")

        audio_output = getattr(result, "output", None)
        if audio_output is None:
            try:
                audio_output = result.to_dict().get("output")  # type: ignore[attr-defined]
            except Exception:
                audio_output = None
        if audio_output is None:
            raise RuntimeError("Qwen3 TTS 未返回有效的输出数据")

        try:
            audio_meta = audio_output.get("audio")  # type: ignore[attr-defined]
        except Exception:
            audio_meta = getattr(audio_output, "audio", None)

        audio_url = None
        if audio_meta is not None:
            try:
                audio_url = audio_meta.get("url")  # type: ignore[attr-defined]
            except Exception:
                audio_url = getattr(audio_meta, "url", None)

        if not audio_url:
            raise RuntimeError("Qwen3 TTS 未返回音频链接")

        def _download_audio():
            response = requests.get(audio_url, timeout=30)
            response.raise_for_status()
            return response.content

        audio_bytes = await asyncio.to_thread(_download_audio)
        audio_format = "wav"
        if audio_url.endswith(".mp3"):
            audio_format = "mp3"
        elif audio_url.endswith(".wav"):
            audio_format = "wav"

        # 简单节流，避免频繁触发速率限制
        await asyncio.sleep(1)

        return AudioSegment.from_file(io.BytesIO(audio_bytes), format=audio_format)
    except Exception as e:
        print(f"Error in generate_podcast_audio_by_qwen: {e}")
        raise
async def process_lines_with_limit(lines, provider , host_voice, guest_voice, language, max_concurrency):
    semaphore = asyncio.Semaphore(max_concurrency)

    async def limited_process_line(line):
        async with semaphore:
            voice = host_voice if (line['speaker'] == '主持人' or line['speaker'] == 'Host') else guest_voice
            return await process_line(line, voice , provider, language)

    tasks = [limited_process_line(line) for line in lines]
    results = await asyncio.gather(*tasks)
    return results



def generate_podcast_summary(pdf_content: str, text: str, tone: str, length: str, language: str) -> Generator[str, None, None]:
    modified_system_prompt = get_prompt(pdf_content, text, '', '', '')
    if (modified_system_prompt == False):
        yield json.dumps({
            "type": "error",
            "content": "Prompt is too long"
        }) + "\n"
        return
    stream = call_llm_stream(SUMMARY_INFO_PROMPT, modified_system_prompt, Summary, False)
    full_response = ""
    for chunk in stream:
        # 将每个 chunk 作为 JSON 字符串 yield
        full_response += chunk
        yield json.dumps({"type": "chunk", "content": chunk}) + "\n"
    
    yield json.dumps({"type": "final", "content": full_response})

def generate_podcast_info(pdfContent: str, text: str, tone: str, length: str, language: str) -> Generator[str, None, None]:
    modified_system_prompt = get_prompt(pdfContent, text, '', '', '')
    if (modified_system_prompt == False):
        yield json.dumps({
            "type": "error",
            "content": "Prompt is too long"
        }) + "\n"
        return

    full_response = ""
    for chunk in call_llm_stream(PODCAST_INFO_PROMPT, modified_system_prompt, PodcastInfo):
        full_response += chunk
    try:
        result = json.loads(full_response)
        
        yield json.dumps({
            "type": "podcast_info",
            "content": result
        }) + "\n"
    except Exception as e:
        yield json.dumps({
            "type": "error",
            "content": f"An unexpected error occurred: {str(e)}"
        }) + "\n"

def call_llm_stream(system_prompt: str, text: str, dialogue_format: Any, isJSON: bool = True) -> Generator[str, None, None]:
    """Call the LLM with the given prompt and dialogue format, returning a stream of responses."""
    if fw_client:
        request_params = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            "model": FIREWORKS_MODEL_ID,
            "max_tokens": FIREWORKS_MAX_TOKENS,
            "temperature": FIREWORKS_TEMPERATURE,
            "stream": True  # 启用流式输出
        }

        # 如果需要 JSON 响应，添加 response_format 参数
        if isJSON:
            request_params["response_format"] = {
                "type": "json_object",
                "schema": dialogue_format.model_json_schema(),
            }
        try:
            stream = fw_client.chat.completions.create(**request_params)

            full_response = ""
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    yield content
            return
        except APIError as e:
            logger.error(f"Error calling Fireworks LLM: {e}. Falling back to DashScope.", exc_info=True)

    if not BAILIAN_API_KEY:
        raise RuntimeError("未配置可用的 LLM API Key。")

    dashscope.api_key = BAILIAN_API_KEY
    responses = Generation.call(
        model=DASHSCOPE_LLM_MODEL_ID,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ],
        api_key=BAILIAN_API_KEY,
        stream=True,
        temperature=DASHSCOPE_TEMPERATURE,
        result_format="text",
    )

    previous_text = ""
    for response in responses:
        output = getattr(response, "output", None)
        if not output:
            continue

        current_text = output.get("text") or ""
        if not current_text:
            continue

        new_chunk = current_text[len(previous_text):]
        previous_text = current_text
        if new_chunk:
            yield new_chunk

        if output.get("finish_reason") == "stop":
            break

    # 在流结束时，尝试解析完整的 JSON 响应
    # try:
    #     parsed_response = json.loads(full_response)
    #     yield json.dumps({"type": "final", "content": parsed_response})
    # except json.JSONDecodeError:
    #     yield json.dumps({"type": "error", "content": "Failed to parse JSON response"})

def call_llm(system_prompt: str, text: str, dialogue_format: Any) -> Any:
    """Call the LLM with the given prompt and dialogue format."""
    if fw_client:
        try:
            return fw_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text},
                ],
                model=FIREWORKS_MODEL_ID,
                max_tokens=FIREWORKS_MAX_TOKENS,
                temperature=FIREWORKS_TEMPERATURE,
                response_format={
                    "type": "json_object",
                    "schema": dialogue_format.model_json_schema(),
                },
            )
        except APIError as e:
            logger.error(f"Error calling Fireworks LLM: {e}. Falling back to DashScope.", exc_info=True)

    if not BAILIAN_API_KEY:
        raise RuntimeError("未配置可用的 LLM API Key。")

    dashscope.api_key = BAILIAN_API_KEY
    return Generation.call(
        model=DASHSCOPE_LLM_MODEL_ID,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ],
        api_key=BAILIAN_API_KEY,
        stream=False,
        temperature=DASHSCOPE_TEMPERATURE,
        result_format="text",
    )

def get_link_text(url: str):
    """ 通过jina.ai 抓取url内容 """
    if not JINA_KEY:
        raise RuntimeError("JINA_KEY 未配置，无法抓取 URL。")
    
    request_url = f"https://r.jina.ai/{url}"
    headers = {
        'Authorization': f'Bearer {JINA_KEY}',
        'Accept': 'application/json',
        'X-Return-Format': 'text'
    }
    
    try:
        response = requests.get(request_url, headers=headers, timeout=30)
        response.raise_for_status()  # Will raise an HTTPError for bad responses (4xx or 5xx)
        
        data = response.json()
        if 'data' not in data:
            raise ValueError("Jina API response did not contain 'data' field.")
        return data['data']
        
    except requests.exceptions.RequestException as e:
        logger.error(f"抓取URL时发生网络错误: {e}", exc_info=True)
        raise RuntimeError(f"无法抓取内容从 {url}。") from e
    except (ValueError, KeyError) as e:
        logger.error(f"解析Jina API响应时出错: {e}", exc_info=True)
        raise RuntimeError("处理Jina API响应时出错。") from e

async def get_pdf_text(pdf_file: UploadFile):
    try:
        contents = await pdf_file.read()
        file_hash = hashlib.md5(contents).hexdigest()

        cached_text = pdf_cache.get(file_hash)
        if cached_text:
            await pdf_file.seek(0)
            return cached_text

        pdf_reader = PdfReader(io.BytesIO(contents))

        page_texts = []
        for page in pdf_reader.pages:
            extracted = page.extract_text()
            if extracted is None:
                continue
            page_texts.append(extracted)

        text = "\n\n".join(page_texts).strip()
        await pdf_file.seek(0)

        if not text:
            return {"error": "未能从 PDF 中提取文本，请确认文件不是扫描件或受保护。"}

        pdf_cache.set(file_hash, text)
        return text

    except errors.PdfReadError:
        await pdf_file.seek(0)
        return {"error": "无法解析PDF文件，文件可能已损坏或格式不正确。"}
    except IOError:
        await pdf_file.seek(0)
        return {"error": "读取文件时发生I/O错误。"}
    except Exception as e:
        await pdf_file.seek(0)
        logger.error(f"处理PDF时发生未知错误: {e}", exc_info=True)
        return {"error": "处理PDF时发生未知错误。"}

def get_prompt(pdfContent: str, text: str, tone: str, length: str, language: str):
    modified_system_prompt = ""
    new_text = pdfContent +text
    if pdfContent:
        modified_system_prompt += f"\n\n{QUESTION_MODIFIER} {new_text}"
    if tone:
        modified_system_prompt += f"\n\n{TONE_MODIFIER} {tone}."
    if length:
        modified_system_prompt += f"\n\n{LENGTH_MODIFIERS[length]}"
    if language:
        modified_system_prompt += f"\n\n{LANGUAGE_MODIFIER} {language}."

    return modified_system_prompt
