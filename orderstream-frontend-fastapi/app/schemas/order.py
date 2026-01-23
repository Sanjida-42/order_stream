from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from enum import Enum


class OrderStatusEnum(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    preparing = "preparing"
    ready = "ready"
    out_for_delivery = "out_for_delivery"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentMethodEnum(str, Enum):
    cash_on_delivery = "cash_on_delivery"


class PaymentStatusEnum(str, Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"


class OrderItem(BaseModel):
    menuItemId: int
    name: str
    quantity: int = Field(..., ge=1)
    price: float = Field(..., gt=0)


class OrderCreate(BaseModel):
    items: List[OrderItem]
    subtotal: float = Field(..., gt=0)
    deliveryAddress: str = Field(..., min_length=5)
    phone: str = Field(..., min_length=5)
    notes: Optional[str] = None
    couponCode: Optional[str] = None


class OrderUpdate(BaseModel):
    deliveryAddress: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatusEnum
    notes: Optional[str] = None


class PaymentStatusUpdate(BaseModel):
    payment_status: PaymentStatusEnum


class OrderResponse(BaseModel):
    id: int
    userId: int
    items: List[dict]
    subtotal: float
    delivery_fee: float
    discount_amount: float
    totalPrice: float
    coupon_code: Optional[str]
    deliveryAddress: str
    phone: str
    notes: Optional[str]
    status: str
    payment_method: str
    payment_status: str
    createdAt: datetime
    updatedAt: Optional[datetime]
    delivered_at: Optional[datetime]

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    """For admin order list with user info"""
    id: int
    user_id: int
    user_name: str
    user_email: str
    items: List[dict]
    total_price: float
    status: str
    payment_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class OrderStatusHistoryResponse(BaseModel):
    """Order status change history"""
    id: int
    old_status: Optional[str]
    new_status: str
    changed_by_name: Optional[str]
    notes: Optional[str]
    changed_at: datetime
    
    class Config:
        from_attributes = True