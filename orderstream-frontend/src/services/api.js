import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
    uploadProfileImage: (formData) => api.post('/auth/profile/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
};

// Menu API
export const menuAPI = {
    getAllItems: () => api.get('/menu'),
    getItemById: (id) => api.get(`/menu/${id}`)
};

// Order API
export const orderAPI = {
    createOrder: (orderData) => api.post('/orders', orderData),
    getUserOrders: () => api.get('/orders/user'),
    getOrder: (id) => api.get(`/orders/${id}`)
};

// Coupon API
export const couponAPI = {
    validate: (code, orderSubtotal) => api.post('/coupons/validate', { code, order_subtotal: orderSubtotal }),
    getAvailable: () => api.get('/coupons/my')
};

// Reviews API
export const reviewAPI = {
    getItemReviews: (menuItemId, page = 1) => api.get(`/reviews/menu/${menuItemId}?page=${page}`),
    createReview: (data) => api.post('/reviews', data),
    updateReview: (id, data) => api.put(`/reviews/${id}`, data),
    deleteReview: (id) => api.delete(`/reviews/${id}`)
};

// Categories API
export const categoryAPI = {
    getAll: () => api.get('/categories')
};

export default api;