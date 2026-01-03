import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './src/models/MenuItem.js';

dotenv.config();

const menuItems = [
    {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        category: 'Main Course',
        price: 12.99,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
        rating: 4.5,
        available: true
    },
    {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with caesar dressing and croutons',
        category: 'Starter',
        price: 8.99,
        imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500',
        rating: 4.2,
        available: true
    },
    {
        name: 'Grilled Chicken',
        description: 'Juicy grilled chicken breast with herbs and spices',
        category: 'Main Course',
        price: 15.99,
        imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500',
        rating: 4.7,
        available: true
    },
    {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center and vanilla ice cream',
        category: 'Dessert',
        price: 6.99,
        imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500',
        rating: 4.8,
        available: true
    },
    {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        category: 'Drinks',
        price: 4.99,
        imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
        rating: 4.3,
        available: true
    },
    {
        name: 'Beef Burger',
        description: 'Juicy beef patty with cheese, lettuce, and tomato',
        category: 'Main Course',
        price: 11.99,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        rating: 4.6,
        available: true
    },
    {
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter and herbs',
        category: 'Starter',
        price: 5.99,
        imageUrl: 'https://images.unsplash.com/photo-1573140401552-388e30b30bb8?w=500',
        rating: 4.4,
        available: true
    },
    {
        name: 'Iced Coffee',
        description: 'Cold brewed coffee with ice and milk',
        category: 'Drinks',
        price: 4.49,
        imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500',
        rating: 4.5,
        available: true
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' Connected to MongoDB');

        await MenuItem.deleteMany({});
        console.log('Cleared existing menu items');

        await MenuItem.insertMany(menuItems);
        console.log('Seeded 8 menu items successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedDB();