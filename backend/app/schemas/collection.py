from datetime import datetime

from pydantic import BaseModel


class CollectionCreate(BaseModel):
    farmer_id: int
    weight: float


class CollectionResponse(BaseModel):
    id: int
    farmer_id: int
    weight: float
    collection_time: datetime
    created_at: datetime

    class Config:
        from_attributes = True