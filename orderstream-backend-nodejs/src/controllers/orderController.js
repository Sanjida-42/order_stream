import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

export const createOrder = async (req, res) => {
    try {
        const { items, totalPrice, deliveryAddress, phone } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const ids = items.map(i => i.menuItemId);
        const validItems = await MenuItem.find({ _id: { $in: ids } });

        if (validItems.length !== items.length) {
            return res.status(400).json({ message: 'Invalid items in cart' });
        }

        const order = await Order.create({
            userId: req.user.id,
            items,
            totalPrice,
            deliveryAddress,
            phone
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};