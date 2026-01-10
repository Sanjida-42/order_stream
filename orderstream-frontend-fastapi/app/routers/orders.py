from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.order import Order
from app.models.menu_item import MenuItem
from app.models.user import User
from app.schemas.order import OrderCreate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

def serialize_order(order: Order) -> dict:
    """Convert Order to dict with MongoDB-like field names"""
    return {
        "_id": str(order.id),
        "userId": order.user_id,
        "items": order.items,
        "totalPrice": order.total_price,
        "deliveryAddress": order.delivery_address,
        "phone": order.phone,
        "status": order.status.value,
        "createdAt": order.created_at.isoformat() if order.created_at else None,
        "updatedAt": order.updated_at.isoformat() if order.updated_at else None
    }

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate items
    if not order_data.items or len(order_data.items) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Verify menu items exist
    menu_item_ids = [item.menuItemId for item in order_data.items]
    valid_items = db.query(MenuItem).filter(MenuItem.id.in_(menu_item_ids)).all()
    
    if len(valid_items) != len(menu_item_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid items in cart"
        )
    
    # Convert items to dict for JSON storage
    items_data = [
        {
            "menuItemId": item.menuItemId,
            "name": item.name,
            "quantity": item.quantity,
            "price": item.price
        }
        for item in order_data.items
    ]
    
    # Create order
    new_order = Order(
        user_id=current_user.id,
        items=items_data,
        total_price=order_data.totalPrice,
        delivery_address=order_data.deliveryAddress,
        phone=order_data.phone
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    return serialize_order(new_order)

@router.get("/user")
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return [serialize_order(order) for order in orders]