from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.order import Order, PaymentMethod, PaymentStatus
from app.models.menu_item import MenuItem
from app.models.user import User
from app.models.coupon import Coupon, DiscountType
from app.models.coupon_usage import CouponUsage
from app.models.order_history import OrderStatusHistory
from app.schemas.order import OrderCreate
from app.utils.dependencies import get_current_user
from app.utils.websocket import manager
import asyncio

router = APIRouter(prefix="/orders", tags=["Orders"])

DELIVERY_FEE = 60.00


def serialize_order(order: Order) -> dict:
    """Convert Order to dict with MongoDB-like field names"""
    return {
        "_id": str(order.id),
        "userId": order.user_id,
        "items": order.items,
        "subtotal": order.subtotal,
        "deliveryFee": order.delivery_fee,
        "discountAmount": order.discount_amount,
        "totalPrice": order.total_price,
        "couponCode": order.coupon_code,
        "deliveryAddress": order.delivery_address,
        "phone": order.phone,
        "notes": order.notes,
        "status": order.status.value,
        "paymentMethod": order.payment_method.value,
        "paymentStatus": order.payment_status.value,
        "createdAt": order.created_at.isoformat() if order.created_at else None,
        "updatedAt": order.updated_at.isoformat() if order.updated_at else None,
        "deliveredAt": order.delivered_at.isoformat() if order.delivered_at else None,
        "statusHistory": [
            {
                "oldStatus": h.old_status,
                "newStatus": h.new_status,
                "changedAt": h.changed_at.isoformat(),
                "notes": h.notes
            } for h in order.status_history
        ]
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
    
    # Verify menu items exist and calculate subtotal
    subtotal = 0
    items_data = []
    for item in order_data.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item.menuItemId).first()
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item {item.menuItemId} not found"
            )
        if not menu_item.available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{menu_item.name} is not available"
            )
        
        item_total = menu_item.price * item.quantity
        subtotal += item_total
        
        items_data.append({
            "menuItemId": item.menuItemId,
            "name": menu_item.name,
            "quantity": item.quantity,
            "price": menu_item.price,
            "itemTotal": item_total
        })
    
    # Apply coupon if provided
    discount_amount = 0
    coupon_code = None
    
    if order_data.couponCode:
        coupon = db.query(Coupon).filter(
            Coupon.code == order_data.couponCode.upper()
        ).first()
        
        if coupon and coupon.is_active:
            # Check validity
            now = datetime.utcnow()
            valid = True
            
            if coupon.start_date and now < coupon.start_date:
                valid = False
            if coupon.end_date and now > coupon.end_date:
                valid = False
            if subtotal < coupon.min_order_amount:
                valid = False
            if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
                valid = False
            
            # Check per-user limit
            user_usage = db.query(func.count(CouponUsage.id)).filter(
                CouponUsage.coupon_id == coupon.id,
                CouponUsage.user_id == current_user.id
            ).scalar() or 0
            
            if user_usage >= coupon.usage_limit_per_user:
                valid = False
            
            if valid:
                # Calculate discount
                if coupon.discount_type == DiscountType.percentage:
                    discount_amount = subtotal * (coupon.discount_value / 100)
                    if coupon.max_discount_amount:
                        discount_amount = min(discount_amount, coupon.max_discount_amount)
                else:
                    discount_amount = min(coupon.discount_value, subtotal)
                
                discount_amount = round(discount_amount, 2)
                coupon_code = coupon.code
    
    # Calculate total
    total_price = subtotal + DELIVERY_FEE - discount_amount
    total_price = round(max(total_price, 0), 2)
    
    # Create order
    new_order = Order(
        user_id=current_user.id,
        items=items_data,
        subtotal=round(subtotal, 2),
        delivery_fee=DELIVERY_FEE,
        discount_amount=discount_amount,
        total_price=total_price,
        coupon_code=coupon_code,
        delivery_address=order_data.deliveryAddress,
        phone=order_data.phone,
        notes=order_data.notes,
        payment_method=PaymentMethod.cash_on_delivery,
        payment_status=PaymentStatus.pending
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Record coupon usage if applied
    if coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == coupon_code).first()
        if coupon:
            usage = CouponUsage(
                coupon_id=coupon.id,
                user_id=current_user.id,
                order_id=new_order.id
            )
            db.add(usage)
            coupon.used_count += 1
            db.commit()
    
    # Create initial status history
    history = OrderStatusHistory(
        order_id=new_order.id,
        old_status=None,
        new_status=new_order.status.value,
        changed_by_id=None,
        notes="Order placed by customer"
    )
    db.add(history)
    db.commit()
    
    # Notify admins via WebSocket
    asyncio.create_task(manager.broadcast({
        "type": "NEW_ORDER",
        "orderId": new_order.id,
        "customerName": current_user.name
    }))
    
    return serialize_order(new_order)


@router.get("/user")
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(Order).filter(
        Order.user_id == current_user.id
    ).order_by(Order.created_at.desc()).all()
    
    return [serialize_order(order) for order in orders]


@router.get("/{order_id}")
def get_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return serialize_order(order)