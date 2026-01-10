import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: String,
        category: { type: String, required: true },
        price: { type: Number, required: true },
        imageUrl: String,
        rating: { type: Number, default: 0 },
        available: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);
