from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.init_db import init_db
from app.utils.websocket import manager
from fastapi import WebSocket, WebSocketDisconnect
import os

# Import all routers
from app.routers import auth, menu, orders
from app.routers import reviews, coupons, categories
from app.routers import admin_dashboard, admin_orders, admin_menu, admin_users, admin_coupons, admin_reviews

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database on startup
    init_db()
    yield
    # Clean up (if needed) on shutdown

# Create upload directory if not exists
os.makedirs("uploads/profiles", exist_ok=True)

app = FastAPI(
    title="OrderStream API",
    version="2.0.0",
    description="Digital Restaurant Order Management System API",
    lifespan=lifespan
)

# Mount uploads directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS configuration - Allow both frontend and admin panel
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Customer frontend
        "http://localhost:5174",  # Admin panel
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Customer-facing routers
app.include_router(auth.router, prefix="/api")
app.include_router(menu.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(coupons.router, prefix="/api")
app.include_router(categories.router, prefix="/api")

# Admin routers
app.include_router(admin_dashboard.router, prefix="/api")
app.include_router(admin_orders.router, prefix="/api")
app.include_router(admin_menu.router, prefix="/api")
app.include_router(admin_users.router, prefix="/api")
app.include_router(admin_coupons.router, prefix="/api")
app.include_router(admin_reviews.router, prefix="/api")


@app.websocket("/ws/admin/orders")
async def admin_orders_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


@app.get("/api/health")
def health_check():
    return {"status": "OK", "version": "2.0.0"}


@app.get("/")
def root():
    return {
        "message": "OrderStream API with FastAPI + PostgreSQL",
        "version": "2.0.0",
        "docs": "/docs"
    }