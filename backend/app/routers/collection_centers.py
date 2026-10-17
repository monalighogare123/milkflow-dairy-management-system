from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.routers.auth import get_current_user

from app.core.database import get_db
from app.models.collection_center import CollectionCenter
from app.schemas.collection_center import (
    CollectionCenterCreate,
    CollectionCenterResponse
)


router = APIRouter(
    prefix="/collection-centers",
    tags=["Collection Centers"],
    dependencies=[Depends(get_current_user)]
)


@router.get(
    "/",
    response_model=list[CollectionCenterResponse]
)
def get_collection_centers(
    db: Session = Depends(get_db)
):
    centers = db.query(CollectionCenter).all()

    return centers


@router.post(
    "/",
    response_model=CollectionCenterResponse
)
def create_collection_center(
    center_data: CollectionCenterCreate,
    db: Session = Depends(get_db)
):
    center = CollectionCenter(
        name=center_data.name,
        location=center_data.location
    )

    db.add(center)
    db.commit()
    db.refresh(center)

    return center