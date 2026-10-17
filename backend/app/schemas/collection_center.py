from pydantic import BaseModel


class CollectionCenterCreate(BaseModel):
    name: str
    location: str


class CollectionCenterResponse(BaseModel):
    id: int
    name: str
    location: str
    is_active: bool

    class Config:
        from_attributes = True