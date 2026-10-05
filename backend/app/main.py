from fastapi import FastAPI

from app.core.database import Base, engine
from app.models.collection_center import CollectionCenter
from app.routers.collection_centers import router as collection_center_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Milk Dairy Weighing & Quality Monitoring System",
    description="Backend API for the milk dairy management system",
    version="1.0.0"
)


app.include_router(collection_center_router)


@app.get("/")
def root():
    return {
        "message": "Milk Dairy API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Milk Dairy API is healthy"
    }