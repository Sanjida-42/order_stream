"""Admin User Management API"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime
from typing import Optional, List

from app.database import get_db
from app.models.user import User, UserRole
from app.models.order import Order
from app.utils.rbac import get_admin_user, get_staff_user
from app.utils.security import get_password_hash
from app.schemas.user import (
    UserAdminResponse, UserStatusUpdate, UserRoleUpdate, StaffCreate
)

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])


def serialize_user_admin(user: User, db: Session) -> dict:
    """Serialize user with order stats for admin"""
    # Get order stats
    total_orders = db.query(func.count(Order.id)).filter(
        Order.user_id == user.id
    ).scalar() or 0
    
    total_spent = db.query(func.sum(Order.total_price)).filter(
        Order.user_id == user.id
    ).scalar() or 0
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "address": user.address,
        "role": user.role.value,
        "profileImageUrl": user.profile_image_url,
        "isActive": user.is_active,
        "isVerified": user.is_verified,
        "lastLogin": user.last_login.isoformat() if user.last_login else None,
        "failedLoginAttempts": user.failed_login_attempts,
        "lockedUntil": user.locked_until.isoformat() if user.locked_until else None,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
        "totalOrders": total_orders,
        "totalSpent": float(total_spent)
    }


@router.get("/")
async def get_all_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    status_filter: Optional[str] = Query(None, alias="status", description="active, inactive, locked"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Get all users with filters and pagination"""
    query = db.query(User)
    
    # Apply filters
    if role:
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            pass
    
    if status_filter:
        if status_filter == "active":
            query = query.filter(User.is_active == True)
        elif status_filter == "inactive":
            query = query.filter(User.is_active == False)
        elif status_filter == "locked":
            query = query.filter(User.locked_until != None)
    
    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )
    
    total = query.count()
    
    offset = (page - 1) * limit
    users = query.order_by(desc(User.created_at)).offset(offset).limit(limit).all()
    
    return {
        "users": [serialize_user_admin(user, db) for user in users],
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }


@router.get("/stats")
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Get user statistics"""
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    customers = db.query(func.count(User.id)).filter(
        User.role == UserRole.customer
    ).scalar() or 0
    
    staff = db.query(func.count(User.id)).filter(
        User.role == UserRole.staff
    ).scalar() or 0
    
    admins = db.query(func.count(User.id)).filter(
        User.role == UserRole.admin
    ).scalar() or 0
    
    active = db.query(func.count(User.id)).filter(
        User.is_active == True
    ).scalar() or 0
    
    return {
        "total": total_users,
        "customers": customers,
        "staff": staff,
        "admins": admins,
        "active": active,
        "inactive": total_users - active
    }


@router.get("/{user_id}")
async def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Get detailed user information with order history"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_data = serialize_user_admin(user, db)
    
    # Get recent orders
    recent_orders = db.query(Order).filter(
        Order.user_id == user_id
    ).order_by(desc(Order.created_at)).limit(10).all()
    
    user_data["recentOrders"] = [
        {
            "id": order.id,
            "totalPrice": order.total_price,
            "status": order.status.value,
            "createdAt": order.created_at.isoformat() if order.created_at else None
        }
        for order in recent_orders
    ]
    
    return user_data


@router.patch("/{user_id}/status")
async def update_user_status(
    user_id: int,
    status_update: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Update user account status (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deactivation
    if user.id == current_user.id and status_update.is_active == False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    if status_update.is_active is not None:
        user.is_active = status_update.is_active
        # Unlock if activating
        if status_update.is_active:
            user.locked_until = None
            user.failed_login_attempts = 0
    
    if status_update.is_verified is not None:
        user.is_verified = status_update.is_verified
    
    db.commit()
    db.refresh(user)
    
    return serialize_user_admin(user, db)


@router.patch("/{user_id}/role")
async def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Update user role (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent changing own role
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    user.role = UserRole(role_update.role.value)
    db.commit()
    db.refresh(user)
    
    return serialize_user_admin(user, db)


@router.post("/staff", status_code=status.HTTP_201_CREATED)
async def create_staff_account(
    staff_data: StaffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Create new staff or admin account (admin only)"""
    # Check for existing email
    existing = db.query(User).filter(User.email == staff_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Hash password
    hashed_password = get_password_hash(staff_data.password)
    
    new_user = User(
        name=staff_data.name,
        email=staff_data.email,
        phone=staff_data.phone,
        password=hashed_password,
        role=UserRole(staff_data.role.value),
        is_active=True,
        is_verified=True  # Staff accounts are pre-verified
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return serialize_user_admin(new_user, db)


@router.post("/{user_id}/unlock")
async def unlock_user_account(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Unlock a locked user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.locked_until = None
    user.failed_login_attempts = 0
    db.commit()
    db.refresh(user)
    
    return {"message": "User account unlocked successfully"}


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user())
):
    """Delete a user account permanently (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting self
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()
    return None
