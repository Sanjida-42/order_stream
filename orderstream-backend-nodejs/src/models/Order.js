import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true }
            }
        ],
        totalPrice: { type: Number, required: true },
        deliveryAddress: { type: String, required: true },
        phone: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'preparing', 'ready', 'delivered'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

export default mongoose.model('Order', orderSchema);