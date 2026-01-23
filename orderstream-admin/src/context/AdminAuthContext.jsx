import { createContext, useState, useEffect, useContext } from 'react';
import { adminApi } from '../services/adminApi';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const response = await adminApi.getProfile();
            const userData = response.data;

            // Only allow admin/staff
            if (userData.role === 'admin' || userData.role === 'staff') {
                setUser(userData);
            } else {
                localStorage.removeItem('adminToken');
            }
        } catch (error) {
            console.error('Load user error:', error);
            localStorage.removeItem('adminToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await adminApi.login(credentials);
        const { token, user: userData } = response.data;

        // Check if user has admin/staff role
        if (userData.role !== 'admin' && userData.role !== 'staff') {
            throw new Error('Access denied. Admin or staff role required.');
        }

        localStorage.setItem('adminToken', token);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setUser(null);
    };

    return (
        <AdminAuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
