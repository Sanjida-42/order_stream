import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await adminApi.getDashboardStats(7);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="spinner"></div>;
    }

    const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444'];

    return (
        <div>
            <div className="admin-header">
                <h1 className="page-title">Dashboard</h1>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={fetchDashboardStats}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">📦</div>
                    <div className="stat-value">{stats?.stats?.total_orders || 0}</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">💰</div>
                    <div className="stat-value">৳{(stats?.stats?.total_revenue || 0).toFixed(2)}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon yellow">⏳</div>
                    <div className="stat-value">{stats?.stats?.pending_orders || 0}</div>
                    <div className="stat-label">Pending Orders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">👥</div>
                    <div className="stat-value">{stats?.stats?.active_customers || 0}</div>
                    <div className="stat-label">Active Customers</div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                {/* Revenue Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Revenue (Last 7 Days)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats?.revenue_chart || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                                labelStyle={{ color: '#f1f5f9' }}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Orders by Status */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Orders by Status</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats?.orders_by_status || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="count"
                                nameKey="status"
                                label={({ status, count }) => `${status}: ${count}`}
                            >
                                {(stats?.orders_by_status || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Recent Orders</h3>
                    <Link to="/orders" className="btn btn-sm btn-secondary">
                        View All →
                    </Link>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(stats?.recent_orders || []).map((order) => (
                            <tr key={order.id}>
                                <td>
                                    <Link to={`/orders/${order.id}`} style={{ color: 'var(--accent-primary)' }}>
                                        #{order.id}
                                    </Link>
                                </td>
                                <td>{order.user_name}</td>
                                <td>{order.items_count} items</td>
                                <td style={{ fontWeight: 600 }}>৳{order.total_price.toFixed(2)}</td>
                                <td>
                                    <span className={`badge ${order.status}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${order.payment_status}`}>
                                        {order.payment_status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
