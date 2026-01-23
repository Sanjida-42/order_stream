import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLayout = () => {
    const { user, logout } = useAdminAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const navItems = [
        { path: '/', icon: '📊', label: 'Dashboard' },
        { path: '/orders', icon: '📦', label: 'Orders' },
        { path: '/menu', icon: '🍕', label: 'Menu Items' },
        { path: '/users', icon: '👥', label: 'Users' },
        { path: '/coupons', icon: '🎟️', label: 'Coupons' },
        { path: '/reviews', icon: '⭐', label: 'Reviews' },
    ];

    return (
        <div className="admin-layout">
            {/* Mobile Header */}
            <div className="mobile-header">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    ☰
                </button>
                <div className="mobile-logo">
                    <span>🍕</span> OrderStream
                </div>
                <div style={{ width: '24px' }}></div> {/* Spacer for balance */}
            </div>

            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span style={{ fontSize: '28px' }}>🍕</span>
                        <h1>OrderStream</h1>
                    </div>
                    <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
                        ×
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Main Menu</div>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">Account</div>
                        <div className="nav-item" style={{ cursor: 'default' }}>
                            <span className="nav-icon">👤</span>
                            <div>
                                <div style={{ fontWeight: 600 }}>{user?.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {user?.role?.toUpperCase()}
                                </div>
                            </div>
                        </div>
                        <div className="nav-item" onClick={handleLogout}>
                            <span className="nav-icon">🚪</span>
                            Logout
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Main Content */}
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
