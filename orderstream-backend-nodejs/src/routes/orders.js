import express from 'express';
import { createOrder, getUserOrders } from '../controllers/orderController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', auth, createOrder);
router.get('/user', auth, getUserOrders);

export default router;