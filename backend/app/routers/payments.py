
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.routers.auth import get_current_user
from app.core.database import get_db
from app.models.collection import Collection
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentResponse


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
    dependencies=[Depends(get_current_user)]
)


@router.post("/", response_model=PaymentResponse)
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db)
):
    # Step 1: Find the milk collection
    collection = db.query(Collection).filter(
        Collection.id == payment_data.collection_id
    ).first()

    if collection is None:
        raise HTTPException(
            status_code=404,
            detail="Milk collection not found"
        )

    # Step 2: Prevent duplicate payment records
    existing_payment = db.query(Payment).filter(
        Payment.collection_id == payment_data.collection_id
    ).first()

    if existing_payment is not None:
        raise HTTPException(
            status_code=409,
            detail="Payment already exists for this collection"
        )

    # Step 3: Convert the weight to Decimal
    weight = Decimal(str(collection.weight))

    # Step 4: Calculate the total amount
    rate = payment_data.rate_per_kg

    total_amount = (weight * rate).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP
    )

    # Step 5: Create the payment record
    payment = Payment(
        collection_id=collection.id,
        rate_per_kg=rate,
        total_amount=total_amount,
        created_at=datetime.utcnow()
    )

    # Step 6: Save it in PostgreSQL
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment


@router.get("/", response_model=list[PaymentResponse])
def get_payments(db: Session = Depends(get_db)):
    payments = db.query(Payment).all()
    return payments


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment_by_id(
    payment_id: int,
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(
        Payment.id == payment_id
    ).first()

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return payment