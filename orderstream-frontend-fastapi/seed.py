from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.menu_item import MenuItem

# Create tables
Base.metadata.create_all(bind=engine)

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
    }
]

def seed_database():
    db: Session = SessionLocal()
    
    try:
        # Clear existing data
        db.query(MenuItem).delete()
        db.commit()
        print("✅ Cleared existing menu items")
        
        # Insert menu items
        for item_data in menu_items:
            menu_item = MenuItem(**item_data)
            db.add(menu_item)
        
        db.commit()
        print(f"✅ Seeded {len(menu_items)} menu items successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()