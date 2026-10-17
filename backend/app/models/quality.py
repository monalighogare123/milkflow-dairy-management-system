
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Quality(Base):
    __tablename__ = "quality_records"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    collection_id: Mapped[int] = mapped_column(
        ForeignKey("collections.id"),
        unique=True,
        nullable=False
    )

    fat: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    snf: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    clr: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    protein: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    temperature: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )