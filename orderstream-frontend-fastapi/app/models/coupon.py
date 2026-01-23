from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum


class DiscountType(str, enum.Enum):
    percentage = "percentage"
    fixed_amount = "fixed_amount"


class Coupon(Base):
    """Discount coupons for orders"""
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)
    
    # Discount details
    discount_type = Column(Enum(DiscountType), nullable=False)
    discount_value = Column(Float, nullable=False)  # Percentage (e.g., 10) or fixed amount (e.g., 5.00)
    
    # Limits
    min_order_amount = Column(Float, default=0, nullable=False)
    max_discount_amount = Column(Float, nullable=True)  # Cap for percentage discounts
    
    # Usage tracking
    usage_limit = Column(Integer, nullable=True)  # Max total uses, null = unlimited
    usage_limit_per_user = Column(Integer, default=1, nullable=False)  # Per user limit
    used_count = Column(Integer, default=0, nullable=False)
    
    # Validity
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
