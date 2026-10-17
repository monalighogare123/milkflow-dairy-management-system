from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    farmer_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    mobile: Mapped[str] = mapped_column(
        String(15),
        nullable=False
    )

    address: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    milk_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    center_id: Mapped[int] = mapped_column(
        ForeignKey("collection_centers.id"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )