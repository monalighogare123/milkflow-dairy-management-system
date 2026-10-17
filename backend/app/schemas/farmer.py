from datetime import datetime

from pydantic import BaseModel


class FarmerCreate(BaseModel):
    farmer_code: str
    name: str
    mobile: str
    address: str | None = None
    milk_type: str
    center_id: int


class FarmerResponse(BaseModel):
    id: int
    farmer_code: str
    name: str
    mobile: str
    address: str | None
    milk_type: str
    center_id: int
    created_at: datetime

    class Config:
        from_attributes = True