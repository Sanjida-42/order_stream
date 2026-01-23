from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class DiscountTypeEnum(str, Enum):
    percentage = "percentage"
    fixed_amount = "fixed_amount"


class CouponBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=50, description="Unique coupon code")
    description: Optional[str] = Field(None, max_length=255)
    discount_type: DiscountTypeEnum
    discount_value: float = Field(..., gt=0)
    min_order_amount: float = Field(default=0, ge=0)
    max_discount_amount: Optional[float] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, ge=1)
    usage_limit_per_user: int = Field(default=1, ge=1)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True


class CouponCreate(CouponBase):
    pass


class CouponUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=3, max_length=50)
    description: Optional[str] = Field(None, max_length=255)
    discount_type: Optional[DiscountTypeEnum] = None
    discount_value: Optional[float] = Field(None, gt=0)
    min_order_amount: Optional[float] = Field(None, ge=0)
    max_discount_amount: Optional[float] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, ge=1)
    usage_limit_per_user: Optional[int] = Field(None, ge=1)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class CouponResponse(CouponBase):
    id: int
    used_count: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class CouponValidate(BaseModel):
    """Request to validate a coupon"""
    code: str
    order_subtotal: float = Field(..., gt=0)


class CouponValidateResponse(BaseModel):
    """Response after validating a coupon"""
    valid: bool
    coupon: Optional[CouponResponse] = None
    discount_amount: float = 0
    message: str
