import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrdersList from './pages/orders/OrdersList';
import OrderDetail from './pages/orders/OrderDetail';
import MenuList from './pages/menu/MenuList';
import MenuForm from './pages/menu/MenuForm';
import UsersList from './pages/users/UsersList';
import CouponsList from './pages/coupons/CouponsList';
import CouponForm from './pages/coupons/CouponForm';
import ReviewsList from './pages/reviews/ReviewsList';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAdminAuth();

    if (loading) {
        return <div className="spinner"></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'admin' && user.role !== 'staff') {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function AppRoutes() {
    const { user } = useAdminAuth();

    return (
        <Routes>
            <Route path="/login" element={
                user ? <Navigate to="/" replace /> : <Login />
            } />

            <Route path="/" element={
                <ProtectedRoute>
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<OrdersList />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="menu" element={<MenuList />} />
                <Route path="menu/new" element={<MenuForm />} />
                <Route path="menu/:id/edit" element={<MenuForm />} />
                <Route path="users" element={<UsersList />} />
                <Route path="coupons" element={<CouponsList />} />
                <Route path="coupons/new" element={<CouponForm />} />
                <Route path="coupons/:id/edit" element={<CouponForm />} />
                <Route path="reviews" element={<ReviewsList />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AdminAuthProvider>
                <AppRoutes />
            </AdminAuthProvider>
        </Router>
    );
}

export default App;
