from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.menu_item import MenuItem
from app.schemas.menu_item import MenuItemResponse

router = APIRouter(prefix="/menu", tags=["Menu"])

def serialize_menu_item(item: MenuItem) -> dict:
    """Convert MenuItem to dict with _id for MongoDB compatibility"""
    return {
        "_id": str(item.id),
        "name": item.name,
        "description": item.description,
        "category": item.category,
        "price": item.price,
        "imageUrl": item.image_url,
        "rating": item.rating,
        "available": item.available,
        "createdAt": item.created_at.isoformat() if item.created_at else None,
        "updatedAt": item.updated_at.isoformat() if item.updated_at else None
    }

@router.get("/")
def get_menu(db: Session = Depends(get_db)):
    items = db.query(MenuItem).filter(MenuItem.available == True).all()
    return [serialize_menu_item(item) for item in items]