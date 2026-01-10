import MenuItem from '../models/MenuItem.js';

export const getMenu = async (req, res) => {
    try {
        const items = await MenuItem.find({ available: true });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
