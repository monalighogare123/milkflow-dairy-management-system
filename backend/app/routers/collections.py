from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.routers.auth import get_current_user
from app.core.database import get_db
from app.models.collection import Collection
from app.schemas.collection import (
    CollectionCreate,
    CollectionResponse
)


router = APIRouter(
    prefix="/collections",
    tags=["Collections"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/", response_model=list[CollectionResponse])
def get_collections(db: Session = Depends(get_db)):
    collections = db.query(Collection).all()

    return collections


@router.post("/", response_model=CollectionResponse)
def create_collection(
    collection_data: CollectionCreate,
    db: Session = Depends(get_db)
):
    collection = Collection(
        farmer_id=collection_data.farmer_id,
        weight=collection_data.weight
    )

    db.add(collection)
    db.commit()
    db.refresh(collection)

    return collection