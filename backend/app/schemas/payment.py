
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    collection_id: int = Field(gt=0)
    rate_per_kg: Decimal = Field(gt=0, max_digits=10, decimal_places=2)


class PaymentResponse(BaseModel):
    id: int
    collection_id: int
    rate_per_kg: Decimal
    total_amount: Decimal
    created_at: datetime

    class Config:
        from_attributes = True