import uuid
from fastapi import APIRouter, BackgroundTasks, Form, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse
import json
from typing import Dict, Optional
from constants import SPEEKERS
from utils import combine_audio, generate_dialogue, generate_podcast_info, generate_podcast_summary, get_link_text, get_pdf_text
try:
    from backend.services import get_transcription_service
except ImportError:
    from services import get_transcription_service  # type: ignore


async def _resolve_source_content(mode: str, pdf_file: Optional[UploadFile], url: Optional[str]) -> str:
    mode = (mode or "").lower()
    if mode not in {"pdf", "url"}:
        raise HTTPException(status_code=422, detail="mode must be either 'pdf' or 'url'")

    if mode == "pdf":
        if pdf_file is None:
            raise HTTPException(status_code=422, detail="请上传 PDF 文件或选择 URL 模式")
        pdf_content = await get_pdf_text(pdf_file)
        if isinstance(pdf_content, dict):
            raise HTTPException(status_code=400, detail=pdf_content.get("error", "读取 PDF 失败"))
        if not pdf_content or not pdf_content.strip():
            raise HTTPException(status_code=400, detail="PDF 文件内容为空")
        return pdf_content

    if not url:
        raise HTTPException(status_code=422, detail="请提供可抓取的 URL")
    try:
        link_data = get_link_text(url)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"抓取 URL 失败: {exc}")

    if not link_data or not isinstance(link_data, dict):
        raise HTTPException(status_code=400, detail="抓取到的 URL 内容为空")

    text = link_data.get("text") or link_data.get("data")
    if not text or not str(text).strip():
        raise HTTPException(status_code=400, detail="URL 返回内容为空")
    return text

router = APIRouter()
transcription_service = get_transcription_service()


def _normalize_language(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    normalized = value.strip().lower()
    mapping = {
        "chinese": "zh",
        "english": "en",
    }
    return mapping.get(normalized, value)

@router.post("/generate_transcript")
async def generate_transcript(
    pdfFile: Optional[UploadFile] = File(None),
    textInput: str = Form(...),
    mode: str = Form(...),
    url: Optional[str] = Form(None),
    tone: str = Form(...),
    duration: str = Form(...),
    language: str = Form(...),
    
): 
    pdfContent = await _resolve_source_content(mode, pdfFile, url)
    new_text = pdfContent
    return StreamingResponse(generate_dialogue(new_text,textInput, tone, duration, language), media_type="application/json")


@router.post("/transcribe_audio")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
):
    try:
        normalized = _normalize_language(language)
        result = await transcription_service.transcribe_upload(audio, language=normalized)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return JSONResponse({"text": result.text})


@router.get("/test")
def test():
    return {"message": "Hello World"}


@router.get("/speekers")
def speeker():
    return JSONResponse(content=SPEEKERS)

@router.get("/jina")
def jina():
    result = get_link_text("https://ui.shadcn.com/docs/components/select")
    return JSONResponse(content=result)


@router.post("/summarize")
async def get_summary(
    textInput: str = Form(...),
    tone: str = Form(...),
    duration: str = Form(...),
    language: str = Form(...),
    mode: str = Form(...),
    url: Optional[str] = Form(None),
    pdfFile: Optional[UploadFile] = File(None)
):
    pdfContent = await _resolve_source_content(mode, pdfFile, url)
    new_text = pdfContent
    return StreamingResponse(
        generate_podcast_summary(
            new_text,
            textInput,
            tone,
            duration,
            language,
        ),
        media_type="application/json"
    )

@router.post("/pod_info")
async def get_pod_info(
    textInput: str = Form(...),
    tone: str = Form(...),
    duration: str = Form(...),
    language: str = Form(...),
    mode: str = Form(...),
    url: Optional[str] = Form(None),
    pdfFile: Optional[UploadFile] = File(None)
):
    pdfContent = await _resolve_source_content(mode, pdfFile, url)

    new_text = pdfContent[:100]
    
    return StreamingResponse(generate_podcast_info(new_text, textInput, tone, duration, language), media_type="application/json")


task_status: Dict[str, Dict] = {}


@router.post("/generate_audio")
async def audio(
    background_tasks: BackgroundTasks,
    text: str = Form(...),
    host_voice: str = Form(...),
    guest_voice: str = Form(...),
    language: str = Form(...) ,
    provider: str = Form(...)
):  
    task_id = str(uuid.uuid4())
    task_status[task_id] = {"status": "processing"}
    
    background_tasks.add_task(combine_audio, task_status, task_id, text, language,provider , host_voice,guest_voice)

    return JSONResponse(content={"task_id": task_id, "status": "processing"})


@router.get("/audio_status/{task_id}")
async def get_audio_status(task_id: str):
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="Task not found")
    
    status = task_status[task_id]
    
    if status["status"] == "completed":
        return JSONResponse(content={
            "status": "completed",
            "audio_url": status["audio_url"]
        })
    elif status["status"] == "failed":
        return JSONResponse(content={
            "status": "failed",
            "error": status["error"]
        })
    else:
        return JSONResponse(content={
            "status": "processing"
        })
    
    
