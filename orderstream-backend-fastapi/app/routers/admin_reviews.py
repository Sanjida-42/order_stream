"""Admin Reviews Moderation API"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.database import get_db
from app.models.review import Review
from app.models.user import User
from app.models.menu_item import MenuItem
from app.utils.rbac import require_role
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/admin/reviews", tags=["Admin Reviews"])


@router.get("/")
async def get_all_reviews(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None, description="pending, approved, rejected"),
    menu_item_id: Optional[int] = None,
    current_user: User = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Get all reviews with filtering for moderation"""
    query = db.query(Review)
    
    if status == "pending":
        query = query.filter(Review.is_approved == False, Review.comment != None) # Simple logic for pending
    elif status == "approved":
        query = query.filter(Review.is_approved == True)
    
    if menu_item_id:
        query = query.filter(Review.menu_item_id == menu_item_id)
        
    total = query.count()
    reviews = query.order_by(desc(Review.created_at)).offset((page-1)*limit).limit(limit).all()
    
    result = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        item = db.query(MenuItem).filter(MenuItem.id == r.menu_item_id).first()
        result.append({
            "id": r.id,
            "userId": r.user_id,
            "userName": user.name if user else "Unknown",
            "menuItemId": r.menu_item_id,
            "menuItemName": item.name if item else "Unknown",
            "rating": r.rating,
            "title": r.title,
            "comment": r.comment,
            "isApproved": r.is_approved,
            "isVerifiedPurchase": r.is_verified_purchase,
            "createdAt": r.created_at.isoformat() if r.created_at else None
        })
        
    return {
        "reviews": result,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.patch("/{review_id}/approve")
async def approve_review(
    review_id: int,
    approve: bool = True,
    current_user: User = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Approve or reject a review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    review.is_approved = approve
    db.commit()
    
    # Update menu item rating after approval change
    from app.routers.reviews import update_menu_item_rating
    await update_menu_item_rating(review.menu_item_id, db)
    
    return {"message": f"Review {'approved' if approve else 'hidden'}"}


@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Hard delete a review (Admin only)"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    menu_item_id = review.menu_item_id
    db.delete(review)
    db.commit()
    
    # Update menu item rating
    from app.routers.reviews import update_menu_item_rating
    await update_menu_item_rating(menu_item_id, db)
    
    return {"message": "Review deleted successfully"}
