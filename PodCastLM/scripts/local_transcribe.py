#!/usr/bin/env python3
"""
Utility script to transcribe an audio file with Whisper and print nicely
formatted segments along with the full merged text.
"""
from __future__ import annotations

import argparse
import os
import re
from pathlib import Path
from typing import Iterable, Optional

from backend.services import TranscriptionService


def _format_timestamp(seconds: float) -> str:
    minutes, secs = divmod(max(seconds, 0.0), 60)
    hours, minutes = divmod(int(minutes), 60)
    return f"{hours:02d}:{minutes:02d}:{secs:05.2f}"


def _print_segments(segments: Iterable[dict]) -> str:
    """Return the concatenated transcript while printing each segment."""
    collected = []
    print("=== 逐段转写（含时间戳） ===\n")
    for idx, segment in enumerate(segments, start=1):
        text = (segment.get("text") or "").strip()
        if not text:
            continue
        start_ts = _format_timestamp(segment.get("start", 0.0))
        end_ts = _format_timestamp(segment.get("end", 0.0))
        print(f"[{idx:03d}] {start_ts} → {end_ts}\n{text}\n")
        collected.append(text)
    return "\n".join(collected).strip()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcribe audio with Whisper and输出更易读的结果。"
    )
    parser.add_argument("audio_path", type=Path, help="要转写的音频文件路径")
    parser.add_argument(
        "--model",
        default=os.getenv("WHISPER_MODEL_NAME", "base"),
        help="Whisper 模型名称，默认读取 WHISPER_MODEL_NAME 或 base。",
    )
    parser.add_argument(
        "--language",
        default=None,
        help="指定语种（例如 zh/ja/en）。默认自动检测。",
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=0.0,
        help="采样温度，默认 0，可提升鲁棒性可适当调高。",
    )
    parser.add_argument(
        "--task",
        choices=("transcribe", "translate"),
        default="transcribe",
        help="Whisper 任务类型，默认为转写（transcribe）。",
    )
    parser.add_argument(
        "--initial-prompt",
        default=None,
        help="可选的初始提示词，用于提供上下文或格式要求。",
    )
    parser.add_argument(
        "--no-condition",
        action="store_true",
        help="关闭对先前文本的条件约束，有助于避免重复但可能丢失上下文。",
    )
    parser.add_argument(
        "--output-file",
        type=Path,
        default=None,
        help="若提供，将把合并后的全文另存到该文件。",
    )
    return parser.parse_args()


def _write_output(text: str, path: Optional[Path]) -> None:
    if not path:
        return
    final_path = path.expanduser().resolve()
    final_path.write_text(text, encoding="utf-8")
    print(f"\n已写入全文到: {final_path}")


def _format_full_text(text: str) -> str:
    """Normalize whitespace and insert line breaks for better readability."""
    cleaned = re.sub(r"\s+", " ", text.strip())
    if not cleaned:
        return ""
    cleaned = re.sub(r"([。！？!?；;])", r"\1\n", cleaned)
    lines = [line.strip() for line in cleaned.splitlines() if line.strip()]
    return "\n\n".join(lines)


def main() -> None:
    args = parse_args()
    audio_path = args.audio_path.expanduser().resolve()
    if not audio_path.exists():
        raise SystemExit(f"音频文件不存在: {audio_path}")

    service = TranscriptionService(
        model_name=args.model,
        task=args.task,
        temperature=args.temperature,
        initial_prompt=args.initial_prompt,
        condition_on_previous_text=not args.no_condition,
    )
    print(f"加载 Whisper 模型：{service.model_name}")
    result = service.transcribe_local_file(audio_path, language=args.language)

    segments = result.segments
    merged_text = result.text
    if not merged_text:
        merged_text = _print_segments(segments)
    else:
        _print_segments(segments)

    formatted_text = _format_full_text(merged_text or "")

    print("\n=== 合并全文 ===\n")
    print(formatted_text or "(无可用文本)")
    _write_output(formatted_text, args.output_file)


if __name__ == "__main__":
    main()
