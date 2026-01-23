from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class MenuItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    image_url: Optional[str] = None
    rating: float = Field(default=0.0, ge=0, le=5)
    available: bool = True


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    available: Optional[bool] = None


class MenuItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: str
    price: float
    image_url: Optional[str]
    rating: float
    available: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True