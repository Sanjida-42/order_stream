"""Admin Menu Management API"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import Optional, List

from app.database import get_db
from app.models.user import User
from app.models.menu_item import MenuItem
from app.models.category import Category
from app.utils.rbac import get_staff_user, get_admin_user
from app.schemas.menu_item import MenuItemCreate, MenuItemResponse
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/admin/menu", tags=["Admin Menu"])


def serialize_menu_item(item: MenuItem) -> dict:
    """Convert MenuItem to dict"""
    return {
        "_id": str(item.id),
        "id": item.id,
        "name": item.name,
        "description": item.description,
        "category": item.category,
        "price": item.price,
        "imageUrl": item.image_url,
        "rating": item.rating,
        "reviewCount": 0,  # Will be calculated from reviews
        "available": item.available,
        "createdAt": item.created_at.isoformat() if item.created_at else None,
        "updatedAt": item.updated_at.isoformat() if item.updated_at else None
    }


@router.get("/")
async def get_all_menu_items(
    category: Optional[str] = None,
    available: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Get all menu items for admin (including unavailable)"""
    query = db.query(MenuItem)
    
    if category:
        query = query.filter(MenuItem.category == category)
    
    if available is not None:
        query = query.filter(MenuItem.available == available)
    
    if search:
        query = query.filter(MenuItem.name.ilike(f"%{search}%"))
    
    total = query.count()
    
    offset = (page - 1) * limit
    items = query.order_by(MenuItem.name).offset(offset).limit(limit).all()
    
    return {
        "items": [serialize_menu_item(item) for item in items],
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }


@router.get("/{item_id}")
async def get_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Get single menu item details"""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    return serialize_menu_item(item)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_menu_item(
    item_data: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Create new menu item (admin only)"""
    # Check for duplicate name
    existing = db.query(MenuItem).filter(MenuItem.name == item_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Menu item with this name already exists"
        )
    
    new_item = MenuItem(
        name=item_data.name,
        description=item_data.description,
        category=item_data.category,
        price=item_data.price,
        image_url=item_data.image_url,
        rating=item_data.rating,
        available=item_data.available
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return serialize_menu_item(new_item)


@router.put("/{item_id}")
async def update_menu_item(
    item_id: int,
    item_data: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Update menu item (admin only)"""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    # Check for duplicate name (excluding current item)
    existing = db.query(MenuItem).filter(
        MenuItem.name == item_data.name,
        MenuItem.id != item_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Menu item with this name already exists"
        )
    
    item.name = item_data.name
    item.description = item_data.description
    item.category = item_data.category
    item.price = item_data.price
    item.image_url = item_data.image_url
    item.available = item_data.available
    
    db.commit()
    db.refresh(item)
    
    return serialize_menu_item(item)


@router.delete("/{item_id}")
async def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Delete menu item (admin only)"""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    db.delete(item)
    db.commit()
    
    return {"message": "Menu item deleted successfully"}


@router.patch("/{item_id}/availability")
async def toggle_availability(
    item_id: int,
    available: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Toggle menu item availability (staff can do this)"""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    item.available = available
    db.commit()
    db.refresh(item)
    
    return serialize_menu_item(item)


# Category endpoints
@router.get("/categories/all")
async def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Get all categories"""
    categories = db.query(Category).order_by(Category.display_order).all()
    
    # Count items per category
    result = []
    for cat in categories:
        item_count = db.query(MenuItem).filter(MenuItem.category == cat.name).count()
        result.append({
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "imageUrl": cat.image_url,
            "displayOrder": cat.display_order,
            "isActive": cat.is_active,
            "itemCount": item_count
        })
    
    return result


@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Create new category"""
    existing = db.query(Category).filter(Category.name == category_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    new_cat = Category(
        name=category_data.name,
        description=category_data.description,
        image_url=category_data.image_url,
        display_order=category_data.display_order,
        is_active=category_data.is_active
    )
    
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    
    return {
        "id": new_cat.id,
        "name": new_cat.name,
        "description": new_cat.description,
        "displayOrder": new_cat.display_order,
        "isActive": new_cat.is_active
    }


@router.put("/categories/{category_id}")
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Update category"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    if category_data.name is not None:
        category.name = category_data.name
    if category_data.description is not None:
        category.description = category_data.description
    if category_data.image_url is not None:
        category.image_url = category_data.image_url
    if category_data.display_order is not None:
        category.display_order = category_data.display_order
    if category_data.is_active is not None:
        category.is_active = category_data.is_active
    
    db.commit()
    db.refresh(category)
    
    return {
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "displayOrder": category.display_order,
        "isActive": category.is_active
    }


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Delete category"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has items
    item_count = db.query(MenuItem).filter(MenuItem.category == category.name).count()
    if item_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category with {item_count} menu items"
        )
    
    db.delete(category)
    db.commit()
    
    return {"message": "Category deleted successfully"}
