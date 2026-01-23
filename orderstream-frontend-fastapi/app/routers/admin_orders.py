"""Admin Order Management API"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from datetime import datetime
from typing import Optional, List

from app.database import get_db
from app.models.user import User
from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.order_history import OrderStatusHistory
from app.utils.rbac import get_staff_user
from app.schemas.order import (
    OrderStatusUpdate, PaymentStatusUpdate,
    OrderListResponse, OrderStatusHistoryResponse
)

router = APIRouter(prefix="/admin/orders", tags=["Admin Orders"])


def serialize_order_admin(order: Order, user: User) -> dict:
    """Convert Order to dict for admin response"""
    return {
        "_id": str(order.id),
        "id": order.id,
        "userId": order.user_id,
        "userName": user.name if user else "Unknown",
        "userEmail": user.email if user else "",
        "userPhone": user.phone if user else "",
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
        "deliveredAt": order.delivered_at.isoformat() if order.delivered_at else None
    }


@router.get("/")
async def get_all_orders(
    status: Optional[str] = Query(None, description="Filter by status"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status"),
    search: Optional[str] = Query(None, description="Search by order ID or customer name"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="asc or desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Get all orders with filters and pagination"""
    query = db.query(Order)
    
    # Apply filters
    if status:
        try:
            status_enum = OrderStatus(status)
            query = query.filter(Order.status == status_enum)
        except ValueError:
            pass
    
    if payment_status:
        try:
            ps_enum = PaymentStatus(payment_status)
            query = query.filter(Order.payment_status == ps_enum)
        except ValueError:
            pass
    
    if search:
        # Search by order ID or join with user for name search
        try:
            order_id = int(search)
            query = query.filter(Order.id == order_id)
        except ValueError:
            # Search by user name
            user_ids = db.query(User.id).filter(
                User.name.ilike(f"%{search}%")
            ).subquery()
            query = query.filter(Order.user_id.in_(user_ids))
    
    # Get total count
    total = query.count()
    
    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(desc(getattr(Order, sort_by, Order.created_at)))
    else:
        query = query.order_by(getattr(Order, sort_by, Order.created_at))
    
    # Apply pagination
    offset = (page - 1) * limit
    orders = query.offset(offset).limit(limit).all()
    
    # Build response with user info
    result = []
    for order in orders:
        user = db.query(User).filter(User.id == order.user_id).first()
        result.append(serialize_order_admin(order, user))
    
    return {
        "orders": result,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }


@router.get("/{order_id}")
async def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Get detailed order information"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    user = db.query(User).filter(User.id == order.user_id).first()
    
    # Get status history
    history = db.query(OrderStatusHistory).filter(
        OrderStatusHistory.order_id == order_id
    ).order_by(OrderStatusHistory.changed_at).all()
    
    history_response = []
    for h in history:
        changer = db.query(User).filter(User.id == h.changed_by_id).first() if h.changed_by_id else None
        history_response.append({
            "id": h.id,
            "oldStatus": h.old_status,
            "newStatus": h.new_status,
            "changedByName": changer.name if changer else "System",
            "notes": h.notes,
            "changedAt": h.changed_at.isoformat() if h.changed_at else None
        })
    
    order_data = serialize_order_admin(order, user)
    order_data["statusHistory"] = history_response
    
    return order_data


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Update order status with history tracking"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    old_status = order.status.value
    new_status = status_update.status.value
    
    # Validate status transition
    # Admins can jump statuses, but cannot change terminal statuses (delivered/cancelled)
    if old_status in ["delivered", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot change status of a {old_status} order"
        )
    
    if new_status == old_status:
        return serialize_order_admin(order, user)
    
    # Update order status
    order.status = OrderStatus(new_status)
    
    # Set delivered_at timestamp
    if new_status == "delivered":
        order.delivered_at = datetime.utcnow()
        # Auto-mark as paid for COD
        order.payment_status = PaymentStatus.paid
    
    # Create status history entry
    history = OrderStatusHistory(
        order_id=order_id,
        old_status=old_status,
        new_status=new_status,
        changed_by_id=current_user.id,
        notes=status_update.notes
    )
    db.add(history)
    
    db.commit()
    db.refresh(order)
    
    user = db.query(User).filter(User.id == order.user_id).first()
    return serialize_order_admin(order, user)


@router.put("/{order_id}/payment")
async def update_payment_status(
    order_id: int,
    payment_update: PaymentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Update order payment status"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order.payment_status = PaymentStatus(payment_update.payment_status.value)
    db.commit()
    db.refresh(order)
    
    user = db.query(User).filter(User.id == order.user_id).first()
    return serialize_order_admin(order, user)


@router.post("/bulk-update")
async def bulk_update_orders(
    order_ids: List[int],
    action: str = Query(..., description="Action: confirm, prepare, ready, deliver, cancel"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Bulk update order statuses"""
    action_to_status = {
        "confirm": OrderStatus.confirmed,
        "prepare": OrderStatus.preparing,
        "ready": OrderStatus.ready,
        "deliver": OrderStatus.delivered,
        "cancel": OrderStatus.cancelled
    }
    
    if action not in action_to_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action. Valid actions: {list(action_to_status.keys())}"
        )
    
    new_status = action_to_status[action]
    updated_count = 0
    
    for order_id in order_ids:
        order = db.query(Order).filter(Order.id == order_id).first()
        if order and order.status != OrderStatus.delivered and order.status != OrderStatus.cancelled:
            old_status = order.status.value
            order.status = new_status
            
            if new_status == OrderStatus.delivered:
                order.delivered_at = datetime.utcnow()
                order.payment_status = PaymentStatus.paid
            
            # Create history entry
            history = OrderStatusHistory(
                order_id=order_id,
                old_status=old_status,
                new_status=new_status.value,
                changed_by_id=current_user.id,
                notes=f"Bulk update: {action}"
            )
            db.add(history)
            updated_count += 1
    
    db.commit()
    
    return {
        "message": f"Successfully updated {updated_count} orders",
        "updatedCount": updated_count
    }
