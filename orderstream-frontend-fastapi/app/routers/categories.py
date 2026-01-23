"""Categories API for customer frontend"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.category import Category
from app.models.menu_item import MenuItem

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/")
async def get_categories(db: Session = Depends(get_db)):
    """Get all active categories with item counts"""
    categories = db.query(Category).filter(
        Category.is_active == True
    ).order_by(Category.display_order).all()
    
    result = []
    for cat in categories:
        # Count available items in this category
        item_count = db.query(func.count(MenuItem.id)).filter(
            MenuItem.category == cat.name,
            MenuItem.available == True
        ).scalar() or 0
        
        result.append({
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "imageUrl": cat.image_url,
            "itemCount": item_count
        })
    
    return result
