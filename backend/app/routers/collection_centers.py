from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.collection_center import CollectionCenter


router = APIRouter(
    prefix="/collection-centers",
    tags=["Collection Centers"]
)


@router.get("/")
def get_collection_centers(
    db: Session = Depends(get_db)
):
    centers = db.query(CollectionCenter).all()

    return centers


@router.post("/")
def create_collection_center(
    name: str,
    location: str,
    db: Session = Depends(get_db)
):
    center = CollectionCenter(
        name=name,
        location=location
    )

    db.add(center)
    db.commit()
    db.refresh(center)

    return center