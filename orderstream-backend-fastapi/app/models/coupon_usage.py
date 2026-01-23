from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class CouponUsage(Base):
    """Track coupon usage per user"""
    __tablename__ = "coupon_usage"

    id = Column(Integer, primary_key=True, index=True)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    used_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    coupon = relationship("Coupon")
    user = relationship("User")
    order = relationship("Order")
