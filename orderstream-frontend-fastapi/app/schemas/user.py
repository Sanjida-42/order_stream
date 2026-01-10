from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str

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
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True