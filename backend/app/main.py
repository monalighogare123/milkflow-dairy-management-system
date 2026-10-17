
from fastapi import FastAPI

from app.routers.collection_centers import router as collection_center_router
from app.routers.farmers import router as farmer_router
from app.routers.collections import router as collection_router
from app.routers.quality import router as quality_router
from app.routers.payments import router as payment_router
from app.routers.reports import router as reports_router
from app.routers.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.routers import dashboard


app = FastAPI(
    title="Milk Dairy Weighing & Quality Monitoring System",
    description="Backend API for the milk dairy management system",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(collection_center_router)
app.include_router(farmer_router)
app.include_router(collection_router)
app.include_router(quality_router)
app.include_router(payment_router)
app.include_router(reports_router)
app.include_router(auth_router)
app.include_router(dashboard.router)


from app.routers.payments import router as payment_router

@app.get("/")
def root():
    return {"message": "Milk Dairy API is running"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Milk Dairy API is healthy"
    }