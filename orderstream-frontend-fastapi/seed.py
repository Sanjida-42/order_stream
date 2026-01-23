"""Database seeding script with sample data for OrderStream"""
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.menu_item import MenuItem
from app.models.category import Category
from app.models.coupon import Coupon, DiscountType
from app.models.user import User, UserRole
from app.models.order import Order
from app.models.review import Review
from app.models.order_history import OrderStatusHistory
from app.models.coupon_usage import CouponUsage
from app.utils.security import get_password_hash

# Create tables (Drop first to ensure schema updates)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Categories
categories = [
    {"name": "Starter", "description": "Appetizers and small bites to start your meal", "display_order": 1},
    {"name": "Main Course", "description": "Hearty main dishes to satisfy your hunger", "display_order": 2},
    {"name": "Dessert", "description": "Sweet treats to end your meal", "display_order": 3},
    {"name": "Drinks", "description": "Refreshing beverages", "display_order": 4},
]

# Menu items
menu_items = [
    {
        "name": "Margherita Pizza",
        "description": "Classic pizza with tomato sauce, mozzarella, and fresh basil",
        "category": "Main Course",
        "price": 12.99,
        "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500",
        "rating": 4.5,
        "available": True
    },
    {
        "name": "Caesar Salad",
        "description": "Fresh romaine lettuce with caesar dressing and croutons",
        "category": "Starter",
        "price": 8.99,
        "image_url": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500",
        "rating": 4.2,
        "available": True
    },
    {
        "name": "Grilled Chicken",
        "description": "Juicy grilled chicken breast with herbs and spices",
        "category": "Main Course",
        "price": 15.99,
        "image_url": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500",
        "rating": 4.7,
        "available": True
    },
    {
        "name": "Chocolate Lava Cake",
        "description": "Warm chocolate cake with molten center and vanilla ice cream",
        "category": "Dessert",
        "price": 6.99,
        "image_url": "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500",
        "rating": 4.8,
        "available": True
    },
    {
        "name": "Fresh Orange Juice",
        "description": "Freshly squeezed orange juice",
        "category": "Drinks",
        "price": 4.99,
        "image_url": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500",
        "rating": 4.3,
        "available": True
    },
    {
        "name": "Beef Burger",
        "description": "Juicy beef patty with cheese, lettuce, and tomato",
        "category": "Main Course",
        "price": 11.99,
        "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
        "rating": 4.6,
        "available": True
    },
    {
        "name": "Garlic Bread",
        "description": "Toasted bread with garlic butter and herbs",
        "category": "Starter",
        "price": 5.99,
        "image_url": "https://images.unsplash.com/photo-1573140401552-388e30b30bb8?w=500",
        "rating": 4.4,
        "available": True
    },
    {
        "name": "Iced Coffee",
        "description": "Cold brewed coffee with ice and milk",
        "category": "Drinks",
        "price": 4.49,
        "image_url": "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500",
        "rating": 4.5,
        "available": True
    },
    {
        "name": "Spaghetti Carbonara",
        "description": "Creamy pasta with bacon, egg, and parmesan",
        "category": "Main Course",
        "price": 13.99,
        "image_url": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500",
        "rating": 4.6,
        "available": True
    },
    {
        "name": "Tiramisu",
        "description": "Classic Italian dessert with coffee and mascarpone",
        "category": "Dessert",
        "price": 7.99,
        "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500",
        "rating": 4.9,
        "available": True
    }
]

# Sample coupons
coupons = [
    {
        "code": "WELCOME10",
        "description": "10% off for new customers",
        "discount_type": DiscountType.percentage,
        "discount_value": 10,
        "min_order_amount": 15,
        "max_discount_amount": 10,
        "usage_limit": 100,
        "usage_limit_per_user": 1,
        "is_active": True
    },
    {
        "code": "SAVE5",
        "description": "$5 off your order",
        "discount_type": DiscountType.fixed_amount,
        "discount_value": 5,
        "min_order_amount": 20,
        "usage_limit": None,
        "usage_limit_per_user": 2,
        "is_active": True
    },
    {
        "code": "SUMMER20",
        "description": "20% summer discount",
        "discount_type": DiscountType.percentage,
        "discount_value": 20,
        "min_order_amount": 30,
        "max_discount_amount": 15,
        "usage_limit": 50,
        "usage_limit_per_user": 1,
        "is_active": True
    }
]


def seed_database():
    db: Session = SessionLocal()
    
    try:
        # Clear existing data
        db.query(MenuItem).delete()
        db.query(Category).delete()
        db.query(Coupon).delete()
        db.commit()
        print("✅ Cleared existing data")
        
        # Seed categories
        for cat_data in categories:
            category = Category(**cat_data)
            db.add(category)
        db.commit()
        print(f"✅ Seeded {len(categories)} categories")
        
        # Seed menu items
        for item_data in menu_items:
            menu_item = MenuItem(**item_data)
            db.add(menu_item)
        db.commit()
        print(f"✅ Seeded {len(menu_items)} menu items")
        
        # Seed coupons
        for coupon_data in coupons:
            coupon = Coupon(**coupon_data)
            db.add(coupon)
        db.commit()
        print(f"✅ Seeded {len(coupons)} coupons")
        
        # Create admin user if not exists
        admin_email = "admin@orderstream.com"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if not existing_admin:
            admin_user = User(
                name="Admin User",
                email=admin_email,
                password=get_password_hash("admin123"),
                phone="+1234567890",
                address="Admin Office",
                role=UserRole.admin,
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Created admin user (admin@orderstream.com / admin123)")
        else:
            print("ℹ️ Admin user already exists")
        
        # Create staff user if not exists
        staff_email = "staff@orderstream.com"
        existing_staff = db.query(User).filter(User.email == staff_email).first()
        
        if not existing_staff:
            staff_user = User(
                name="Staff User",
                email=staff_email,
                password=get_password_hash("staff123"),
                phone="+1234567891",
                address="Kitchen",
                role=UserRole.staff,
                is_active=True,
                is_verified=True
            )
            db.add(staff_user)
            db.commit()
            print("✅ Created staff user (staff@orderstream.com / staff123)")
        else:
            print("ℹ️ Staff user already exists")
        
        print("\n🎉 Database seeding completed successfully!")
        print("\n📋 Available coupon codes:")
        for c in coupons:
            print(f"   - {c['code']}: {c['description']}")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()