
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.routers.auth import get_current_user
from app.core.database import get_db
from app.models.farmer import Farmer
from app.models.collection import Collection
from app.models.quality import Quality
from app.models.payment import Payment


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/farmers/{farmer_id}/history")
def get_farmer_history(
    farmer_id: int,
    db: Session = Depends(get_db)
):
    # Check whether the farmer exists
    farmer = db.query(Farmer).filter(
        Farmer.id == farmer_id
    ).first()

    if farmer is None:
        raise HTTPException(
            status_code=404,
            detail="Farmer not found"
        )

    # Get the farmer's collections with optional quality/payment data
    records = (
        db.query(Collection, Quality, Payment)
        .outerjoin(
            Quality,
            Quality.collection_id == Collection.id
        )
        .outerjoin(
            Payment,
            Payment.collection_id == Collection.id
        )
        .filter(Collection.farmer_id == farmer_id)
        .order_by(Collection.collection_time.desc())
        .all()
    )

    history = []

    for collection, quality, payment in records:
        history.append({
            "collection_id": collection.id,
            "farmer_id": farmer.id,
            "farmer_name": farmer.name,
            "collection_time": collection.collection_time,
            "weight_kg": collection.weight,
            "quality": (
                {
                    "fat": quality.fat,
                    "snf": quality.snf,
                    "clr": quality.clr,
                    "protein": quality.protein,
                    "temperature": quality.temperature
                }
                if quality else None
            ),
            "payment": (
                {
                    "rate_per_kg": payment.rate_per_kg,
                    "total_amount": payment.total_amount
                }
                if payment else None
            )
        })

    return history


@router.get("/farmers/{farmer_id}/summary")
def get_farmer_summary(
    farmer_id: int,
    db: Session = Depends(get_db)
):
    # Check whether the farmer exists
    farmer = db.query(Farmer).filter(
        Farmer.id == farmer_id
    ).first()

    if farmer is None:
        raise HTTPException(
            status_code=404,
            detail="Farmer not found"
        )

    # Calculate total milk collected
    total_milk = (
        db.query(func.coalesce(func.sum(Collection.weight), 0))
        .filter(Collection.farmer_id == farmer_id)
        .scalar()
    )

    # Count collection records
    collection_count = (
        db.query(func.count(Collection.id))
        .filter(Collection.farmer_id == farmer_id)
        .scalar()
    )

    # Add up the recorded calculated payments
    total_payment = (
        db.query(func.coalesce(func.sum(Payment.total_amount), 0))
        .join(
            Collection,
            Payment.collection_id == Collection.id
        )
        .filter(Collection.farmer_id == farmer_id)
        .scalar()
    )

    return {
        "farmer_id": farmer.id,
        "farmer_code": farmer.farmer_code,
        "farmer_name": farmer.name,
        "total_collections": collection_count,
        "total_milk_kg": total_milk,
        "total_calculated_payment": total_payment
    }