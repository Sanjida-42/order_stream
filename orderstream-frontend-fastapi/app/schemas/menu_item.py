from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str]
    category: str
    price: float
    image_url: Optional[str]
    rating: float = 0.0
    available: bool = True

class MenuItemCreate(MenuItemBase):
    pass

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
        # Map 'id' to '_id' for MongoDB compatibility
        json_schema_extra = {
            "example": {
                "_id": "1",
                "name": "Pizza",
                "category": "Main Course",
                "price": 12.99
            }
        }