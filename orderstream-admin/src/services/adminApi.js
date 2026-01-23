import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const adminApi = {
    // Auth
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),

    // Dashboard
    getDashboardStats: (days = 7) => api.get(`/admin/dashboard/stats?days=${days}`),

    // Orders
    getOrders: (params) => api.get('/admin/orders', { params }),
    getOrder: (id) => api.get(`/admin/orders/${id}`),
    updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
    updatePaymentStatus: (id, data) => api.put(`/admin/orders/${id}/payment`, data),
    bulkUpdateOrders: (orderIds, action) =>
        api.post('/admin/orders/bulk-update', orderIds, { params: { action } }),

    // Menu
    getMenuItems: (params) => api.get('/admin/menu', { params }),
    getMenuItem: (id) => api.get(`/admin/menu/${id}`),
    createMenuItem: (data) => api.post('/admin/menu', data),
    updateMenuItem: (id, data) => api.put(`/admin/menu/${id}`, data),
    deleteMenuItem: (id) => api.delete(`/admin/menu/${id}`),
    toggleAvailability: (id, available) =>
        api.patch(`/admin/menu/${id}/availability?available=${available}`),
    getCategories: () => api.get('/admin/menu/categories/all'),

    // Users
    getUsers: (params) => api.get('/admin/users', { params }),
    getUserStats: () => api.get('/admin/users/stats'),
    getUser: (id) => api.get(`/admin/users/${id}`),
    updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
    updateUserRole: (id, data) => api.patch(`/admin/users/${id}/role`, data),
    createStaff: (data) => api.post('/admin/users/staff', data),
    unlockUser: (id) => api.post(`/admin/users/${id}/unlock`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // Coupons
    getCoupons: (params) => api.get('/admin/coupons', { params }),
    getCoupon: (id) => api.get(`/admin/coupons/${id}`),
    createCoupon: (data) => api.post('/admin/coupons', data),
    updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
    deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
    toggleCoupon: (id) => api.patch(`/admin/coupons/${id}/toggle`),

    // Reviews
    getAdminReviews: (params) => api.get('/admin/reviews', { params }),
    approveReview: (id, approve = true) => api.patch(`/admin/reviews/${id}/approve?approve=${approve}`),
    deleteAdminReview: (id) => api.delete(`/admin/reviews/${id}`),
};

export default api;
