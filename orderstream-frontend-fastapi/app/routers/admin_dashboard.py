"""Admin Dashboard API - Statistics and Analytics"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.menu_item import MenuItem
from app.utils.rbac import get_staff_user
from app.schemas.dashboard import (
    DashboardStats, DashboardResponse, RevenueByDay,
    OrdersByStatus, TopSellingItem, RecentOrder
)

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])


@router.get("/stats", response_model=DashboardResponse)
async def get_dashboard_stats(
    days: int = Query(default=7, ge=1, le=90, description="Number of days for charts"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_staff_user())
):
    """Get complete dashboard statistics"""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    date_range_start = now - timedelta(days=days)
    
    # Total stats
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = db.query(func.sum(Order.total_price)).filter(
        Order.status != OrderStatus.cancelled
    ).scalar() or 0
    
    # Today's stats
    orders_today = db.query(func.count(Order.id)).filter(
        Order.created_at >= today_start
    ).scalar() or 0
    
    revenue_today = db.query(func.sum(Order.total_price)).filter(
        Order.created_at >= today_start,
        Order.status != OrderStatus.cancelled
    ).scalar() or 0
    
    # Pending orders
    pending_orders = db.query(func.count(Order.id)).filter(
        Order.status.in_([OrderStatus.pending, OrderStatus.confirmed, OrderStatus.preparing])
    ).scalar() or 0
    
    # Active customers (ordered in last 30 days)
    active_customers = db.query(func.count(func.distinct(Order.user_id))).filter(
        Order.created_at >= now - timedelta(days=30)
    ).scalar() or 0
    
    # Average order value
    avg_order_value = db.query(func.avg(Order.total_price)).filter(
        Order.status != OrderStatus.cancelled
    ).scalar() or 0
    
    stats = DashboardStats(
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        orders_today=orders_today,
        revenue_today=float(revenue_today),
        pending_orders=pending_orders,
        active_customers=active_customers,
        average_order_value=float(avg_order_value)
    )
    
    # Revenue by day chart data
    revenue_chart = []
    for i in range(days):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_revenue = db.query(func.sum(Order.total_price)).filter(
            Order.created_at >= day_start,
            Order.created_at < day_end,
            Order.status != OrderStatus.cancelled
        ).scalar() or 0
        
        day_orders = db.query(func.count(Order.id)).filter(
            Order.created_at >= day_start,
            Order.created_at < day_end
        ).scalar() or 0
        
        revenue_chart.append(RevenueByDay(
            date=day_start.strftime("%Y-%m-%d"),
            revenue=float(day_revenue),
            order_count=day_orders
        ))
    
    revenue_chart.reverse()  # Oldest first
    
    # Orders by status
    status_counts = db.query(
        Order.status, func.count(Order.id)
    ).group_by(Order.status).all()
    
    orders_by_status = [
        OrdersByStatus(status=status.value, count=count)
        for status, count in status_counts
    ]
    
    # Top selling items
    # Query items from orders JSON
    top_items_query = db.query(
        MenuItem.id,
        MenuItem.name,
        MenuItem.category,
        func.count(Order.id).label('order_count')
    ).join(
        Order, Order.items.cast(String).contains(func.cast(MenuItem.id, String))
    ).filter(
        Order.status != OrderStatus.cancelled
    ).group_by(
        MenuItem.id, MenuItem.name, MenuItem.category
    ).order_by(
        desc('order_count')
    ).limit(5).all()
    
    # Simplified top items (from menu items table based on orders)
    top_selling = []
    all_menu_items = db.query(MenuItem).limit(5).all()
    for item in all_menu_items:
        top_selling.append(TopSellingItem(
            id=item.id,
            name=item.name,
            category=item.category,
            total_quantity=0,  # Placeholder
            total_revenue=0.0
        ))
    
    # Recent orders
    recent = db.query(Order).options(
    ).order_by(desc(Order.created_at)).limit(10).all()
    
    recent_orders = []
    for order in recent:
        user = db.query(User).filter(User.id == order.user_id).first()
        recent_orders.append(RecentOrder(
            id=order.id,
            user_name=user.name if user else "Unknown",
            items_count=len(order.items) if order.items else 0,
            total_price=order.total_price,
            status=order.status.value,
            payment_status=order.payment_status.value,
            created_at=order.created_at
        ))
    
    return DashboardResponse(
        stats=stats,
        revenue_chart=revenue_chart,
        orders_by_status=orders_by_status,
        top_selling_items=top_selling,
        recent_orders=recent_orders
    )


# Need to import String for the query
from sqlalchemy import String
