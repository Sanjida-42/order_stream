"""Role-Based Access Control (RBAC) utilities for admin/staff routes"""
from functools import wraps
from fastapi import HTTPException, status
from app.models.user import UserRole


def require_role(allowed_roles: list):
    """
    Dependency to enforce role-based access control.
    
    Usage:
        @router.get("/admin/users")
        async def get_users(
            db: Session = Depends(get_db),
            current_user: User = Depends(require_role(['admin']))
        ):
            ...
    """
    from app.utils.dependencies import get_current_user
    from fastapi import Depends
    
    async def role_checker(current_user = Depends(get_current_user)):
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {allowed_roles}"
            )
        
        if not current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )
            
        return current_user
    
    return role_checker


def get_admin_user():
    """Dependency for admin-only routes"""
    return require_role(['admin'])


def get_staff_user():
    """Dependency for staff and admin routes"""
    return require_role(['admin', 'staff'])


def get_any_authenticated_user():
    """Dependency for any authenticated user"""
    return require_role(['admin', 'staff', 'customer'])
