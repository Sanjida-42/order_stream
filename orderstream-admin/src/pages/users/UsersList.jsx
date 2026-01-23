import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ role: '', search: '' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', password: '', role: 'staff' });
    const [selectedUser, setSelectedUser] = useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [filters.role]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getUsers(filters);
            setUsers(response.data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminApi.getUserStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleStatusToggle = async (userId, isActive) => {
        try {
            await adminApi.updateUserStatus(userId, { is_active: !isActive });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to update status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await adminApi.deleteUser(userId);
            fetchUsers(); // Refresh list
            fetchStats(); // Update stats
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to delete user');
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            await adminApi.createStaff(newStaff);
            setShowCreateModal(false);
            setNewStaff({ name: '', email: '', phone: '', password: '', role: 'staff' });
            fetchUsers();
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to create staff');
        }
    };

    const handleViewDetails = async (userId) => {
        try {
            const response = await adminApi.getUser(userId);
            setSelectedUser(response.data);
        } catch (error) {
            alert('Failed to fetch user details');
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    if (loading && users.length === 0) return <div className="spinner"></div>;

    return (
        <div>
            <div className="admin-header">
                <h1 className="page-title">Users</h1>
                <div className="header-actions">
                    <select
                        className="form-input form-select"
                        style={{ width: 'auto' }}
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    >
                        <option value="">All Roles</option>
                        <option value="customer">Customers</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admins</option>
                    </select>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        + Add User
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="stats-grid" style={{ marginBottom: '24px' }}>
                    <div className="stat-card">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.customers}</div>
                        <div className="stat-label">Customers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.staff}</div>
                        <div className="stat-label">Staff</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.admins}</div>
                        <div className="stat-label">Admins</div>
                    </div>
                </div>
            )}

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Orders</th>
                            <th>Spent</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>#{user.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                            src={getImageUrl(user.profileImageUrl)}
                                            alt=""
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://ui-avatars.com/api/?name=' + user.name + '&background=random';
                                            }}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge ${user.role === 'admin' ? 'delivered' : user.role === 'staff' ? 'preparing' : 'pending'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{user.totalOrders}</td>
                                <td>৳{user.totalSpent?.toFixed(2)}</td>
                                <td>
                                    <span className={`badge ${user.isActive ? 'delivered' : 'cancelled'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleViewDetails(user.id)}
                                        >
                                            View
                                        </button>
                                        <button
                                            className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-primary'}`}
                                            onClick={() => handleStatusToggle(user.id, user.isActive)}
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteUser(user.id)}
                                            style={{ backgroundColor: '#dc3545' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">User Details</h3>
                            <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', padding: '20px 0' }}>
                            <div style={{ flex: '0 0 150px' }}>
                                <img
                                    src={getImageUrl(selectedUser.profileImageUrl)}
                                    alt={selectedUser.name}
                                    style={{ width: '150px', height: '150px', borderRadius: '12px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://ui-avatars.com/api/?name=' + selectedUser.name + '&background=random';
                                    }}
                                />
                            </div>
                            <div style={{ flex: '1', minWidth: '200px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{selectedUser.name}</div>
                                <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>#{selectedUser.id} • {selectedUser.role.toUpperCase()}</div>

                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', fontSize: '14px' }}>
                                    <b style={{ color: 'var(--text-muted)' }}>Email:</b> <span>{selectedUser.email}</span>
                                    <b style={{ color: 'var(--text-muted)' }}>Phone:</b> <span>{selectedUser.phone}</span>
                                    <b style={{ color: 'var(--text-muted)' }}>Address:</b> <span>{selectedUser.address || 'N/A'}</span>
                                    <b style={{ color: 'var(--text-muted)' }}>Joined:</b> <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                                    <b style={{ color: 'var(--text-muted)' }}>Last Login:</b> <span>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                            <h4 style={{ marginBottom: '16px' }}>Recent Orders</h4>
                            {selectedUser.recentOrders?.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="data-table" style={{ fontSize: '13px' }}>
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedUser.recentOrders.map(order => (
                                                <tr key={order.id}>
                                                    <td>#{order.id}</td>
                                                    <td>৳{order.totalPrice.toFixed(2)}</td>
                                                    <td><span className={`badge ${order.status}`}>{order.status}</span></td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>No orders found</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Staff Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Create User Account</h3>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateStaff}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    className="form-input"
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    className="form-input"
                                    value={newStaff.phone}
                                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={newStaff.password}
                                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-input form-select"
                                    value={newStaff.role}
                                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" className="btn btn-primary">Create</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersList;
