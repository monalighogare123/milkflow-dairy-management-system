from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Collection(Base):
    __tablename__ = "collections"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    farmer_id: Mapped[int] = mapped_column(
        ForeignKey("farmers.id"),
        nullable=False
    )

    weight: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    collection_time: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )