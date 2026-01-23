import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', page: 1 });
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchOrders();

        // WebSocket for real-time updates
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws/admin/orders';
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_ORDER') {
                console.log('New order received:', data);
                fetchOrders(); // Refresh list instantly
            }
        };

        socket.onerror = (error) => console.error('WebSocket Error:', error);

        return () => {
            socket.close();
        };
    }, [filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getOrders(filters);
            setOrders(response.data.orders);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await adminApi.updateOrderStatus(orderId, { status: newStatus });
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to update status');
        }
    };

    const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

    if (loading && orders.length === 0) {
        return <div className="spinner"></div>;
    }

    return (
        <div>
            <div className="admin-header">
                <h1 className="page-title">Orders ({total})</h1>
                <div className="header-actions">
                    <select
                        className="form-input form-select"
                        style={{ width: 'auto' }}
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                        <option value="">All Status</option>
                        {statusOptions.map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                        ))}
                    </select>
                    <button className="btn btn-secondary" onClick={fetchOrders}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>
                                    <Link to={`/orders/${order.id}`} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                                        #{order.id}
                                    </Link>
                                </td>
                                <td>
                                    <div>{order.userName}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.userEmail}</div>
                                </td>
                                <td>
                                    <div style={{ maxHeight: '60px', overflowY: 'auto', fontSize: '13px' }}>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} style={{ borderBottom: idx < order.items.length - 1 ? '1px solid #eee' : 'none', padding: '2px 0' }}>
                                                {item.quantity}x {item.name}
                                            </div>
                                        )) || '0 items'}
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>৳{order.totalPrice?.toFixed(2)}</td>
                                <td>
                                    <span className={`badge ${order.status}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${order.paymentStatus}`}>
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <select
                                            className="form-input form-select"
                                            style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            disabled={order.status === 'delivered' || order.status === 'cancelled'}
                                        >
                                            {statusOptions.map(s => (
                                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                        <Link to={`/orders/${order.id}`} className="btn btn-sm btn-primary">
                                            Details
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {orders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        No orders found
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersList;
