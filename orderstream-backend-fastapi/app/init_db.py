"""Database initialization and idempotent seeding logic for OrderStream"""
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.menu_item import MenuItem
from app.models.category import Category
from app.models.coupon import Coupon, DiscountType
from app.models.user import User, UserRole
from app.utils.security import get_password_hash

# Default Data
categories_data = [
    {"name": "Starter", "description": "Appetizers and small bites to start your meal", "display_order": 1},
    {"name": "Main Course", "description": "Hearty main dishes to satisfy your hunger", "display_order": 2},
    {"name": "Dessert", "description": "Sweet treats to end your meal", "display_order": 3},
    {"name": "Drinks", "description": "Refreshing beverages", "display_order": 4},
]

menu_items_data = [
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
    }
]

coupons_data = [
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
    }
]

def init_db():
    print("🚀 Initializing database...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 1. Seed Categories
        for cat_data in categories_data:
            exists = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not exists:
                category = Category(**cat_data)
                db.add(category)
                print(f"✅ Added category: {cat_data['name']}")
        db.commit()

        # 2. Seed Menu Items
        for item_data in menu_items_data:
            exists = db.query(MenuItem).filter(MenuItem.name == item_data["name"]).first()
            if not exists:
                category_name = item_data.pop("category")
                category = db.query(Category).filter(Category.name == category_name).first()
                if category:
                    menu_item = MenuItem(**item_data, category_id=category.id)
                    db.add(menu_item)
                    print(f"✅ Added menu item: {item_data['name']}")
                item_data["category"] = category_name # Restore for next run if needed
        db.commit()

        # 3. Seed Coupons
        for coupon_data in coupons_data:
            exists = db.query(Coupon).filter(Coupon.code == coupon_data["code"]).first()
            if not exists:
                coupon = Coupon(**coupon_data)
                db.add(coupon)
                print(f"✅ Added coupon: {coupon_data['code']}")
        db.commit()

        # 4. Create default admin if not exists
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
            print(f"✅ Created admin user: {admin_email}")
        
        # 5. Create default staff if not exists
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
            print(f"✅ Created staff user: {staff_email}")
            
        db.commit()
        print("🎉 Database initialization complete!")
        
    except Exception as e:
        print(f"❌ Error during database initialization: {e}")
        db.rollback()
    finally:
        db.close()
