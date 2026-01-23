"""Customer Coupon Validation API"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.coupon import Coupon, DiscountType
from app.models.coupon_usage import CouponUsage
from app.utils.dependencies import get_current_user
from app.schemas.coupon import CouponValidate, CouponValidateResponse

router = APIRouter(prefix="/coupons", tags=["Coupons"])


@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(
    validation_data: CouponValidate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validate a coupon code and calculate discount"""
    code = validation_data.code.upper().strip()
    subtotal = validation_data.order_subtotal
    
    # Find coupon
    coupon = db.query(Coupon).filter(Coupon.code == code).first()
    
    if not coupon:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message="Invalid coupon code"
        )
    
    # Check if active
    if not coupon.is_active:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message="This coupon is no longer active"
        )
    
    # Check date validity
    now = datetime.utcnow()
    if coupon.start_date and now < coupon.start_date:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message="This coupon is not yet valid"
        )
    
    if coupon.end_date and now > coupon.end_date:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message="This coupon has expired"
        )
    
    # Check minimum order amount
    if subtotal < coupon.min_order_amount:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message=f"Minimum order amount is ৳{coupon.min_order_amount:.2f}"
        )
    
    # Check total usage limit
    if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message="This coupon has reached its usage limit"
        )
    
    # Check per-user usage limit
    user_usage_count = db.query(func.count(CouponUsage.id)).filter(
        CouponUsage.coupon_id == coupon.id,
        CouponUsage.user_id == current_user.id
    ).scalar() or 0
    
    if user_usage_count >= coupon.usage_limit_per_user:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message="You have already used this coupon"
        )
    
    # Calculate discount
    if coupon.discount_type == DiscountType.percentage:
        discount = subtotal * (coupon.discount_value / 100)
        # Apply max discount cap if set
        if coupon.max_discount_amount and discount > coupon.max_discount_amount:
            discount = coupon.max_discount_amount
    else:  # fixed_amount
        discount = min(coupon.discount_value, subtotal)
    
    # Round to 2 decimal places
    discount = round(discount, 2)
    
    return CouponValidateResponse(
        valid=True,
        coupon=None,  # Don't expose full coupon details
        discount_amount=discount,
        message=f"Coupon applied! You save ৳{discount:.2f}"
    )


@router.get("/my")
async def get_user_coupons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get available coupons for the current user"""
    now = datetime.utcnow()
    
    # Get active coupons
    coupons = db.query(Coupon).filter(
        Coupon.is_active == True,
        (Coupon.start_date == None) | (Coupon.start_date <= now),
        (Coupon.end_date == None) | (Coupon.end_date >= now),
        (Coupon.usage_limit == None) | (Coupon.used_count < Coupon.usage_limit)
    ).all()
    
    available_coupons = []
    for coupon in coupons:
        # Check if user hasn't exceeded their limit
        user_usage = db.query(func.count(CouponUsage.id)).filter(
            CouponUsage.coupon_id == coupon.id,
            CouponUsage.user_id == current_user.id
        ).scalar() or 0
        
        if user_usage < coupon.usage_limit_per_user:
            available_coupons.append({
                "code": coupon.code,
                "description": coupon.description,
                "discountType": coupon.discount_type.value,
                "discountValue": coupon.discount_value,
                "minOrderAmount": coupon.min_order_amount,
                "maxDiscountAmount": coupon.max_discount_amount,
                "endDate": coupon.end_date.isoformat() if coupon.end_date else None
            })
    
    return available_coupons
