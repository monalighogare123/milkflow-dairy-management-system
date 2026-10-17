import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import os

from dotenv import load_dotenv

from alembic import context

from app.core.database import Base, engine
from app.models.collection_center import CollectionCenter
from app.models.farmer import Farmer
from app.models.collection import Collection
from app.models.quality import Quality
from app.models.payment import Payment
from app.models.user import User


load_dotenv()


target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""

    url = os.getenv("DATABASE_URL")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""

    with engine.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()