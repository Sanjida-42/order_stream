from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class OrderStatusHistory(Base):
    """Track order status changes for audit trail"""
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    old_status = Column(String(50), nullable=True)  # Null for initial creation
    new_status = Column(String(50), nullable=False)
    
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin/Staff who changed
    notes = Column(Text, nullable=True)
    
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="status_history")
    changed_by = relationship("User")
