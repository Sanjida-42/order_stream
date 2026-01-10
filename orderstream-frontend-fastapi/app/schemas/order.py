from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class OrderItem(BaseModel):
    menuItemId: int
    name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    items: List[OrderItem]
    totalPrice: float
    deliveryAddress: str
    phone: str

class OrderResponse(BaseModel):
    id: int
    userId: int
    items: List[dict]
    totalPrice: float
    deliveryAddress: str
    phone: str
    status: str
    createdAt: datetime
    updatedAt: Optional[datetime]

    class Config:
        from_attributes = True