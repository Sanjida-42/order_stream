"""Admin Coupon Management API"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import Optional, List

from app.database import get_db
from app.models.user import User
from app.models.coupon import Coupon, DiscountType
from app.models.coupon_usage import CouponUsage
from app.utils.rbac import get_admin_user, get_staff_user
from app.schemas.coupon import CouponCreate, CouponUpdate, CouponResponse

router = APIRouter(prefix="/admin/coupons", tags=["Admin Coupons"])


def serialize_coupon(coupon: Coupon) -> dict:
    """Convert Coupon to dict"""
    return {
        "id": coupon.id,
        "code": coupon.code,
        "description": coupon.description,
        "discountType": coupon.discount_type.value,
        "discountValue": coupon.discount_value,
        "minOrderAmount": coupon.min_order_amount,
        "maxDiscountAmount": coupon.max_discount_amount,
        "usageLimit": coupon.usage_limit,
        "usageLimitPerUser": coupon.usage_limit_per_user,
        "usedCount": coupon.used_count,
        "startDate": coupon.start_date.isoformat() if coupon.start_date else None,
        "endDate": coupon.end_date.isoformat() if coupon.end_date else None,
        "isActive": coupon.is_active,
        "createdAt": coupon.created_at.isoformat() if coupon.created_at else None,
        "updatedAt": coupon.updated_at.isoformat() if coupon.updated_at else None
    }


@router.get("/")
async def get_all_coupons(
    active_only: bool = Query(False, description="Show only active coupons"),
    search: Optional[str] = Query(None, description="Search by code"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Get all coupons with filters"""
    query = db.query(Coupon)
    
    if active_only:
        query = query.filter(Coupon.is_active == True)
    
    if search:
        query = query.filter(Coupon.code.ilike(f"%{search}%"))
    
    total = query.count()
    
    offset = (page - 1) * limit
    coupons = query.order_by(desc(Coupon.created_at)).offset(offset).limit(limit).all()
    
    return {
        "coupons": [serialize_coupon(c) for c in coupons],
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }


@router.get("/{coupon_id}")
async def get_coupon_detail(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Get coupon details with usage history"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )
    
    coupon_data = serialize_coupon(coupon)
    
    # Get usage history
    usage = db.query(CouponUsage).filter(
        CouponUsage.coupon_id == coupon_id
    ).order_by(desc(CouponUsage.used_at)).limit(20).all()
    
    coupon_data["usageHistory"] = [
        {
            "userId": u.user_id,
            "orderId": u.order_id,
            "usedAt": u.used_at.isoformat() if u.used_at else None
        }
        for u in usage
    ]
    
    return coupon_data


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_coupon(
    coupon_data: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Create new coupon (admin only)"""
    # Check for duplicate code
    existing = db.query(Coupon).filter(
        Coupon.code == coupon_data.code.upper()
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon with this code already exists"
        )
    
    # Validate discount value
    if coupon_data.discount_type == "percentage" and coupon_data.discount_value > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Percentage discount cannot exceed 100%"
        )
    
    new_coupon = Coupon(
        code=coupon_data.code.upper(),
        description=coupon_data.description,
        discount_type=DiscountType(coupon_data.discount_type.value),
        discount_value=coupon_data.discount_value,
        min_order_amount=coupon_data.min_order_amount,
        max_discount_amount=coupon_data.max_discount_amount,
        usage_limit=coupon_data.usage_limit,
        usage_limit_per_user=coupon_data.usage_limit_per_user,
        start_date=coupon_data.start_date,
        end_date=coupon_data.end_date,
        is_active=coupon_data.is_active
    )
    
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    
    return serialize_coupon(new_coupon)


@router.put("/{coupon_id}")
async def update_coupon(
    coupon_id: int,
    coupon_data: CouponUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Update coupon (admin only)"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )
    
    # Check for duplicate code if changing
    if coupon_data.code and coupon_data.code.upper() != coupon.code:
        existing = db.query(Coupon).filter(
            Coupon.code == coupon_data.code.upper(),
            Coupon.id != coupon_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coupon with this code already exists"
            )
        coupon.code = coupon_data.code.upper()
    
    if coupon_data.description is not None:
        coupon.description = coupon_data.description
    if coupon_data.discount_type is not None:
        coupon.discount_type = DiscountType(coupon_data.discount_type.value)
    if coupon_data.discount_value is not None:
        coupon.discount_value = coupon_data.discount_value
    if coupon_data.min_order_amount is not None:
        coupon.min_order_amount = coupon_data.min_order_amount
    if coupon_data.max_discount_amount is not None:
        coupon.max_discount_amount = coupon_data.max_discount_amount
    if coupon_data.usage_limit is not None:
        coupon.usage_limit = coupon_data.usage_limit
    if coupon_data.usage_limit_per_user is not None:
        coupon.usage_limit_per_user = coupon_data.usage_limit_per_user
    if coupon_data.start_date is not None:
        coupon.start_date = coupon_data.start_date
    if coupon_data.end_date is not None:
        coupon.end_date = coupon_data.end_date
    if coupon_data.is_active is not None:
        coupon.is_active = coupon_data.is_active
    
    db.commit()
    db.refresh(coupon)
    
    return serialize_coupon(coupon)


@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Delete coupon (admin only)"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )
    
    # Delete usage history first
    db.query(CouponUsage).filter(CouponUsage.coupon_id == coupon_id).delete()
    
    db.delete(coupon)
    db.commit()
    
    return {"message": "Coupon deleted successfully"}


@router.patch("/{coupon_id}/toggle")
async def toggle_coupon_status(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Toggle coupon active status"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )
    
    coupon.is_active = not coupon.is_active
    db.commit()
    db.refresh(coupon)
    
    return serialize_coupon(coupon)
