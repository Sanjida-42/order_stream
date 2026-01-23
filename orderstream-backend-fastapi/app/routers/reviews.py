"""Customer Reviews API - For submitting and viewing reviews"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.review import Review
from app.models.order import Order, OrderStatus
from app.models.menu_item import MenuItem
from app.utils.dependencies import get_current_user
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse, ReviewSummary

router = APIRouter(prefix="/reviews", tags=["Reviews"])


def serialize_review(review: Review, user: User) -> dict:
    """Convert Review to dict with user info"""
    return {
        "id": review.id,
        "userId": review.user_id,
        "userName": user.name if user else "Anonymous",
        "menuItemId": review.menu_item_id,
        "orderId": review.order_id,
        "rating": review.rating,
        "title": review.title,
        "comment": review.comment,
        "isVerifiedPurchase": review.is_verified_purchase,
        "helpfulCount": review.helpful_count,
        "createdAt": review.created_at.isoformat() if review.created_at else None,
        "updatedAt": review.updated_at.isoformat() if review.updated_at else None
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a review for a menu item"""
    # Check if menu item exists
    menu_item = db.query(MenuItem).filter(MenuItem.id == review_data.menu_item_id).first()
    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    # Check if user already reviewed this item
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.menu_item_id == review_data.menu_item_id
    ).first()
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this item"
        )
    
    # Check if user has ordered this item (for verified purchase badge)
    is_verified = False
    if review_data.order_id:
        order = db.query(Order).filter(
            Order.id == review_data.order_id,
            Order.user_id == current_user.id,
            Order.status == OrderStatus.delivered
        ).first()
        if order:
            # Check if item was in this order
            for item in order.items:
                if str(item.get('menuItemId')) == str(review_data.menu_item_id):
                    is_verified = True
                    break
    else:
        # Check if user has ever ordered this item
        user_orders = db.query(Order).filter(
            Order.user_id == current_user.id,
            Order.status == OrderStatus.delivered
        ).all()
        for order in user_orders:
            for item in order.items:
                if str(item.get('menuItemId')) == str(review_data.menu_item_id):
                    is_verified = True
                    break
            if is_verified:
                break
    
    new_review = Review(
        user_id=current_user.id,
        menu_item_id=review_data.menu_item_id,
        order_id=review_data.order_id,
        rating=review_data.rating,
        title=review_data.title,
        comment=review_data.comment,
        is_verified_purchase=is_verified
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Update menu item average rating
    await update_menu_item_rating(review_data.menu_item_id, db)
    
    return serialize_review(new_review, current_user)


@router.get("/menu/{menu_item_id}")
async def get_menu_item_reviews(
    menu_item_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    sort_by: str = Query("recent", description="recent, helpful, rating_high, rating_low"),
    db: Session = Depends(get_db)
):
    """Get all reviews for a menu item"""
    query = db.query(Review).filter(
        Review.menu_item_id == menu_item_id,
        Review.is_approved == True
    )
    
    # Apply sorting
    if sort_by == "helpful":
        query = query.order_by(desc(Review.helpful_count))
    elif sort_by == "rating_high":
        query = query.order_by(desc(Review.rating))
    elif sort_by == "rating_low":
        query = query.order_by(Review.rating)
    else:  # recent
        query = query.order_by(desc(Review.created_at))
    
    total = query.count()
    
    offset = (page - 1) * limit
    reviews = query.offset(offset).limit(limit).all()
    
    result = []
    for review in reviews:
        user = db.query(User).filter(User.id == review.user_id).first()
        result.append(serialize_review(review, user))
    
    # Get rating summary
    summary = await get_review_summary(menu_item_id, db)
    
    return {
        "reviews": result,
        "summary": summary,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }


@router.get("/summary/{menu_item_id}")
async def get_review_summary(
    menu_item_id: int,
    db: Session = Depends(get_db)
):
    """Get review summary for a menu item"""
    reviews = db.query(Review).filter(
        Review.menu_item_id == menu_item_id,
        Review.is_approved == True
    ).all()
    
    if not reviews:
        return {
            "averageRating": 0,
            "totalReviews": 0,
            "ratingDistribution": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
        }
    
    total = len(reviews)
    avg_rating = sum(r.rating for r in reviews) / total
    
    distribution = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
    for review in reviews:
        distribution[str(review.rating)] += 1
    
    return {
        "averageRating": round(avg_rating, 1),
        "totalReviews": total,
        "ratingDistribution": distribution
    }


@router.put("/{review_id}")
async def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update own review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own reviews"
        )
    
    if review_data.rating is not None:
        review.rating = review_data.rating
    if review_data.title is not None:
        review.title = review_data.title
    if review_data.comment is not None:
        review.comment = review_data.comment
    
    db.commit()
    db.refresh(review)
    
    # Update menu item average rating
    await update_menu_item_rating(review.menu_item_id, db)
    
    return serialize_review(review, current_user)


@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete own review"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews"
        )
    
    menu_item_id = review.menu_item_id
    
    db.delete(review)
    db.commit()
    
    # Update menu item average rating
    await update_menu_item_rating(menu_item_id, db)
    
    return {"message": "Review deleted successfully"}


@router.post("/{review_id}/helpful")
async def mark_review_helpful(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a review as helpful"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Simple increment (in production, track per-user to prevent spam)
    review.helpful_count += 1
    db.commit()
    db.refresh(review)
    
    user = db.query(User).filter(User.id == review.user_id).first()
    return serialize_review(review, user)


async def update_menu_item_rating(menu_item_id: int, db: Session):
    """Recalculate and update menu item's average rating"""
    reviews = db.query(Review).filter(
        Review.menu_item_id == menu_item_id,
        Review.is_approved == True
    ).all()
    
    menu_item = db.query(MenuItem).filter(MenuItem.id == menu_item_id).first()
    if menu_item:
        if reviews:
            avg_rating = sum(r.rating for r in reviews) / len(reviews)
            menu_item.rating = round(avg_rating, 1)
        else:
            menu_item.rating = 0.0
        db.commit()
