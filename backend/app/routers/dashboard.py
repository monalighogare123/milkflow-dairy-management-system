import csv
import io

from fastapi.responses import StreamingResponse


from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.farmer import Farmer
from app.models.collection import Collection
from app.models.payment import Payment

from app.routers.auth import get_current_user
from app.core.database import get_db
from calendar import monthrange
from datetime import date

from fastapi import HTTPException

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ==================================================
# 1. DASHBOARD STATISTICS
# ==================================================

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Total registered farmers
    total_farmers = (
        db.query(func.count(Farmer.id)).scalar() or 0
    )

    # Total milk collected
    total_milk_collected = (
        db.query(
            func.coalesce(func.sum(Collection.weight), 0)
        ).scalar() or 0
    )

    # Milk collected today
    today_milk_collected = (
        db.query(
            func.coalesce(func.sum(Collection.weight), 0)
        )
        .filter(
            func.date(Collection.collection_time) == date.today()
        )
        .scalar() or 0
    )

    # Total collection records
    total_collections = (
        db.query(func.count(Collection.id)).scalar() or 0
    )

    # Total payment records
    total_payments = (
        db.query(func.count(Payment.id)).scalar() or 0
    )

    # Total payment amount
    total_payment_amount = (
        db.query(
            func.coalesce(func.sum(Payment.total_amount), 0)
        ).scalar() or 0
    )

    return {
        "total_farmers": int(total_farmers),
        "total_milk_collected": float(total_milk_collected),
        "today_milk_collected": float(today_milk_collected),
        "total_collections": int(total_collections),
        "total_payments": int(total_payments),
        "total_payment_amount": float(total_payment_amount),
    }


# ==================================================
# 2. DAILY REPORT
# ==================================================

@router.get("/daily")
def get_daily_report(
    report_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # If no date is provided, use today's date
    selected_date = report_date or date.today()

    # Total milk collected on the selected date
    total_milk_collected = (
        db.query(
            func.coalesce(func.sum(Collection.weight), 0)
        )
        .filter(
            func.date(Collection.collection_time) == selected_date
        )
        .scalar() or 0
    )

    # Number of collection records on the selected date
    total_collections = (
        db.query(func.count(Collection.id))
        .filter(
            func.date(Collection.collection_time) == selected_date
        )
        .scalar() or 0
    )

    # Number of payment records created on the selected date
    total_payments = (
        db.query(func.count(Payment.id))
        .filter(
            func.date(Payment.created_at) == selected_date
        )
        .scalar() or 0
    )

    # Total amount of payments created on the selected date
    total_payment_amount = (
        db.query(
            func.coalesce(func.sum(Payment.total_amount), 0)
        )
        .filter(
            func.date(Payment.created_at) == selected_date
        )
        .scalar() or 0
    )

    return {
        "report_date": selected_date.isoformat(),
        "total_milk_collected": float(total_milk_collected),
        "total_collections": int(total_collections),
        "total_payments": int(total_payments),
        "total_payment_amount": float(total_payment_amount),
    }

@router.get("/monthly")
def get_monthly_report(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Step 1: Validate the year and month
    if year < 2000 or year > 2100:
        raise HTTPException(
            status_code=400,
            detail="Year must be between 2000 and 2100"
        )

    if month < 1 or month > 12:
        raise HTTPException(
            status_code=400,
            detail="Month must be between 1 and 12"
        )

    # Step 2: Calculate the first and last day of the month
    first_day = date(year, month, 1)
    last_day = date(year, month, monthrange(year, month)[1])

    # Step 3: Calculate total milk collected
    total_milk_collected = (
        db.query(
            func.coalesce(func.sum(Collection.weight), 0)
        )
        .filter(
            func.date(Collection.collection_time) >= first_day,
            func.date(Collection.collection_time) <= last_day
        )
        .scalar() or 0
    )

    # Step 4: Count collection records
    total_collections = (
        db.query(func.count(Collection.id))
        .filter(
            func.date(Collection.collection_time) >= first_day,
            func.date(Collection.collection_time) <= last_day
        )
        .scalar() or 0
    )

    # Step 5: Count payments recorded during the month
    total_payments = (
        db.query(func.count(Payment.id))
        .filter(
            func.date(Payment.created_at) >= first_day,
            func.date(Payment.created_at) <= last_day
        )
        .scalar() or 0
    )

    # Step 6: Total amount of payments recorded during the month
    total_payment_amount = (
        db.query(
            func.coalesce(func.sum(Payment.total_amount), 0)
        )
        .filter(
            func.date(Payment.created_at) >= first_day,
            func.date(Payment.created_at) <= last_day
        )
        .scalar() or 0
    )

    # Step 7: Return report data
    return {
        "year": year,
        "month": month,
        "total_milk_collected": float(total_milk_collected),
        "total_collections": int(total_collections),
        "total_payments": int(total_payments),
        "total_payment_amount": float(total_payment_amount)
    }


@router.get("/farmer-wise")
def get_farmer_wise_report(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get all farmers with their total milk and collection count
    farmer_rows = (
        db.query(
            Farmer.id.label("farmer_id"),
            Farmer.name.label("farmer_name"),
            Farmer.farmer_code.label("farmer_code"),
            func.coalesce(
                func.sum(Collection.weight), 0
            ).label("total_milk"),
            func.count(Collection.id).label("total_collections")
        )
        .outerjoin(
            Collection,
            Collection.farmer_id == Farmer.id
        )
        .group_by(
            Farmer.id,
            Farmer.name,
            Farmer.farmer_code
        )
        .order_by(Farmer.name)
        .all()
    )

    # Calculate payment totals separately to avoid duplicate sums
    payment_rows = (
        db.query(
            Collection.farmer_id.label("farmer_id"),
            func.coalesce(
                func.sum(Payment.total_amount), 0
            ).label("total_payment")
        )
        .join(
            Collection,
            Payment.collection_id == Collection.id
        )
        .group_by(Collection.farmer_id)
        .all()
    )

    payment_by_farmer = {
        row.farmer_id: float(row.total_payment)
        for row in payment_rows
    }

    # Combine the results
    results = []

    for row in farmer_rows:
        results.append({
            "farmer_id": row.farmer_id,
            "farmer_name": row.farmer_name,
            "farmer_code": row.farmer_code,
            "total_milk_collected": float(row.total_milk),
            "total_collections": int(row.total_collections),
            "total_payment_amount": payment_by_farmer.get(
                row.farmer_id, 0.0
            )
        })

    return {
        "total_farmers": len(results),
        "farmers": results
    }


@router.get("/export/collections")
def export_collections_csv(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Create an in-memory CSV file
    output = io.StringIO()
    writer = csv.writer(output)

    # Write the column headings
    writer.writerow([
        "Collection ID",
        "Farmer ID",
        "Farmer Name",
        "Weight (kg)",
        "Collection Date"
    ])

    # Fetch collection records and their farmer names
    rows = (
        db.query(
            Collection.id,
            Farmer.id,
            Farmer.name,
            Collection.weight,
            Collection.collection_time
        )
        .join(
            Farmer,
            Collection.farmer_id == Farmer.id
        )
        .order_by(Collection.collection_time.desc())
        .all()
    )

    # Write each database record to the CSV
    for row in rows:
        writer.writerow([
            row[0],
            row[1],
            row[2],
            row[3],
            row[4].isoformat() if row[4] else ""
        ])

    # Prepare the file for download
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                'attachment; filename="milk_collections.csv"'
        }
    )

@router.get("/chart-data")
def get_chart_data(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 1. Get today's date
    today = date.today()

    # 2. Calculate the date six days ago
    start_date = today - timedelta(days=6)

    # 3. Get milk totals grouped by collection date
    results = (
        db.query(
            func.date(Collection.collection_time).label("collection_date"),
            func.sum(Collection.weight).label("total_milk"),
        )
        .filter(
            Collection.collection_time >= start_date,
            Collection.collection_time < today + timedelta(days=1),
        )
        .group_by(func.date(Collection.collection_time))
        .all()
    )

    # 4. Convert database results into a dictionary
    milk_by_date = {
        str(row.collection_date): float(row.total_milk or 0)
        for row in results
    }

    # 5. Prepare all seven days, including days with zero collections
    chart_data = []

    for day_offset in range(7):
        current_date = start_date + timedelta(days=day_offset)
        date_key = current_date.isoformat()

        chart_data.append(
            {
                "date": date_key,
                "day": current_date.strftime("%a"),
                "milk": round(milk_by_date.get(date_key, 0), 2),
            }
        )

    # 6. Return data to the frontend
    return chart_data
