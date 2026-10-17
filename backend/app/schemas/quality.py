
from datetime import datetime

from pydantic import BaseModel, Field


class QualityCreate(BaseModel):
    collection_id: int = Field(gt=0)
    fat: float = Field(ge=0)
    snf: float = Field(ge=0)
    clr: float = Field(ge=0)
    protein: float | None = Field(default=None, ge=0)
    temperature: float | None = None


class QualityResponse(BaseModel):
    id: int
    collection_id: int
    fat: float
    snf: float
    clr: float
    protein: float | None
    temperature: float | None
    created_at: datetime

    class Config:
        from_attributes = True