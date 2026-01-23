"""Dashboard statistics schemas for admin panel"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class DashboardStats(BaseModel):
    """Main dashboard statistics"""
    total_orders: int
    total_revenue: float
    orders_today: int
    revenue_today: float
    pending_orders: int
    active_customers: int
    average_order_value: float


class RevenueByDay(BaseModel):
    """Revenue data for charts"""
    date: str
    revenue: float
    order_count: int


class OrdersByStatus(BaseModel):
    """Orders grouped by status"""
    status: str
    count: int


class TopSellingItem(BaseModel):
    """Top selling menu items"""
    id: int
    name: str
    category: str
    total_quantity: int
    total_revenue: float


class RecentOrder(BaseModel):
    """Recent order for dashboard display"""
    id: int
    user_name: str
    items_count: int
    total_price: float
    status: str
    payment_status: str
    created_at: datetime


class DashboardResponse(BaseModel):
    """Complete dashboard data response"""
    stats: DashboardStats
    revenue_chart: List[RevenueByDay]
    orders_by_status: List[OrdersByStatus]
    top_selling_items: List[TopSellingItem]
    recent_orders: List[RecentOrder]


class AnalyticsDateRange(BaseModel):
    """Date range for analytics"""
    start_date: datetime
    end_date: datetime


class CustomerAnalytics(BaseModel):
    """Customer analytics data"""
    total_customers: int
    new_customers_this_month: int
    returning_customers: int
    customer_retention_rate: float
    top_customers: List[dict]


class SalesAnalytics(BaseModel):
    """Sales analytics data"""
    total_sales: float
    average_order_value: float
    orders_per_day_average: float
    peak_hours: List[dict]
    sales_by_category: List[dict]
