from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    title: Optional[str] = Field(None, max_length=100)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    menu_item_id: int
    order_id: Optional[int] = None  # Optional link to specific order


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=100)
    comment: Optional[str] = None


class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    menu_item_id: int
    order_id: Optional[int]
    is_verified_purchase: bool
    is_approved: bool
    helpful_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Include user name for display
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class ReviewSummary(BaseModel):
    """Summary statistics for menu item reviews"""
    average_rating: float
    total_reviews: int
    rating_distribution: dict  # {1: count, 2: count, ...}
