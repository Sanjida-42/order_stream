from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class UserRoleEnum(str, Enum):
    customer = "customer"
    staff = "staff"
    admin = "admin"


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=5)
    address: Optional[str] = None
    profile_image_url: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    address: Optional[str]
    role: str
    profile_image_url: Optional[str]

    class Config:
        from_attributes = True


class Token(BaseModel):
    token: str
    user: UserResponse


class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    address: Optional[str]
    role: str
    profile_image_url: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime]
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


# Admin User Management Schemas
class UserAdminResponse(BaseModel):
    """Extended user info for admin panel"""
    id: int
    name: str
    email: str
    phone: str
    address: Optional[str]
    role: str
    profile_image_url: Optional[str]
    is_active: bool
    is_verified: bool
    last_login: Optional[datetime]
    failed_login_attempts: int
    locked_until: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    total_orders: Optional[int] = 0
    total_spent: Optional[float] = 0.0

    class Config:
        from_attributes = True


class UserStatusUpdate(BaseModel):
    """Update user account status"""
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class UserRoleUpdate(BaseModel):
    """Update user role (admin only)"""
    role: UserRoleEnum


class StaffCreate(BaseModel):
    """Create staff or admin account"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    role: UserRoleEnum = UserRoleEnum.staff


class PasswordReset(BaseModel):
    """Password reset request"""
    current_password: str
    new_password: str = Field(..., min_length=6)


class UserProfileUpdate(BaseModel):
    """Update user profile details"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=5)
    address: Optional[str] = None
    profile_image_url: Optional[str] = None
