"""
schema.py
"""

from typing import Literal, List

from pydantic import BaseModel, Field

class Summary(BaseModel):
    """Summary."""

    summary: str

class PodcastInfo(BaseModel):
    """Summary."""

    title: str
    host_name: str


class DialogueItem(BaseModel):
    """A single dialogue item."""

    speaker: Literal["Host (Jane)", "Guest"]
    text: str


class ShortDialogue(BaseModel):
    """The dialogue between the host and guest."""

    name_of_guest: str
    dialogue: List[DialogueItem] = Field(
        ..., description="A list of dialogue items, typically between 11 to 17 items"
    )
