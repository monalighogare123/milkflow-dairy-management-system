
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.routers.auth import get_current_user
from app.core.database import get_db
from app.models.collection import Collection
from app.models.quality import Quality
from app.schemas.quality import QualityCreate, QualityResponse


router = APIRouter(
    prefix="/quality",
    tags=["Milk Quality"],
    dependencies=[Depends(get_current_user)]
)


@router.post("/", response_model=QualityResponse)
def create_quality(
    quality_data: QualityCreate,
    db: Session = Depends(get_db)
):
    # Check whether the collection exists
    collection = db.query(Collection).filter(
        Collection.id == quality_data.collection_id
    ).first()

    if collection is None:
        raise HTTPException(
            status_code=404,
            detail="Milk collection not found"
        )

    # Check whether quality was already recorded
    existing_quality = db.query(Quality).filter(
        Quality.collection_id == quality_data.collection_id
    ).first()

    if existing_quality is not None:
        raise HTTPException(
            status_code=409,
            detail="Quality record already exists for this collection"
        )

    # Create the quality record
    quality = Quality(
        collection_id=quality_data.collection_id,
        fat=quality_data.fat,
        snf=quality_data.snf,
        clr=quality_data.clr,
        protein=quality_data.protein,
        temperature=quality_data.temperature
    )

    db.add(quality)
    db.commit()
    db.refresh(quality)

    return quality


@router.get("/", response_model=list[QualityResponse])
def get_quality_records(db: Session = Depends(get_db)):
    records = db.query(Quality).all()
    return records


@router.get("/{quality_id}", response_model=QualityResponse)
def get_quality_by_id(
    quality_id: int,
    db: Session = Depends(get_db)
):
    quality = db.query(Quality).filter(
        Quality.id == quality_id
    ).first()

    if quality is None:
        raise HTTPException(
            status_code=404,
            detail="Quality record not found"
        )

    return quality