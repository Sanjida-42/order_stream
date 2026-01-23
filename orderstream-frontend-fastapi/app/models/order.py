from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    preparing = "preparing"
    ready = "ready"
    out_for_delivery = "out_for_delivery"
    delivered = "delivered"
    cancelled = "cancelled"

class PaymentMethod(str, enum.Enum):
    cash_on_delivery = "cash_on_delivery"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    items = Column(JSON, nullable=False)  # Store as JSON array
    
    # Pricing
    subtotal = Column(Float, nullable=False)
    delivery_fee = Column(Float, default=2.99, nullable=False)
    discount_amount = Column(Float, default=0, nullable=False)
    total_price = Column(Float, nullable=False)
    coupon_code = Column(String, nullable=True)
    
    # Delivery
    delivery_address = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    
    # Status
    status = Column(Enum(OrderStatus), default=OrderStatus.pending, nullable=False)
    
    # Payment
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.cash_on_delivery, nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.pending, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    delivered_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")