from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, menu, orders

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OrderStream API", version="2.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(menu.router, prefix="/api")
app.include_router(orders.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "OK"}

@app.get("/")
def root():
    return {"message": "OrderStream API with FastAPI + PostgreSQL"}