
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.routers.auth import get_current_user, require_roles
from app.core.database import get_db
from app.models.farmer import Farmer
from app.schemas.farmer import FarmerCreate, FarmerResponse
from app.routers.auth import require_roles


router = APIRouter(
    prefix="/farmers",
    tags=["Farmers"],
    dependencies=[Depends(get_current_user)]
)


# Get all farmers
@router.get("/", response_model=list[FarmerResponse])
def get_farmers(db: Session = Depends(get_db)):
    farmers = db.query(Farmer).all()
    return farmers


# Create a new farmer
@router.post("/", response_model=FarmerResponse)
def create_farmer(
    farmer_data: FarmerCreate,
    db: Session = Depends(get_db)
):
    farmer = Farmer(
        farmer_code=farmer_data.farmer_code,
        name=farmer_data.name,
        mobile=farmer_data.mobile,
        address=farmer_data.address,
        milk_type=farmer_data.milk_type,
        center_id=farmer_data.center_id
    )

    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    return farmer


# Delete a farmer (admin only)
@router.delete(
    "/{farmer_id}",
    dependencies=[Depends(require_roles("admin"))]
)
def delete_farmer(
    farmer_id: int,
    db: Session = Depends(get_db)
):
    farmer = db.query(Farmer).filter(
        Farmer.id == farmer_id
    ).first()

    if farmer is None:
        raise HTTPException(
            status_code=404,
            detail="Farmer not found"
        )

    db.delete(farmer)
    db.commit()

    return {
        "message": "Farmer deleted successfully",
        "farmer_id": farmer_id
    }
