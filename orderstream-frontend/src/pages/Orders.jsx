import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const response = await orderAPI.getUserOrders();
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#ffc107',
            preparing: '#17a2b8',
            ready: '#28a745',
            delivered: '#6c757d'
        };
        return colors[status] || '#6c757d';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳',
            preparing: '👨‍🍳',
            ready: '✅',
            delivered: '🚚'
        };
        return icons[status] || '📦';
    };

    if (loading) {
        return <div className="spinner"></div>;
    }

    if (error) {
        return (
            <div style={styles.error}>
                <p>{error}</p>
                <button onClick={fetchOrders} style={styles.retryButton}>
                    Retry
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div style={styles.emptyOrders}>
                <h2>No orders yet</h2>
                <p>Start ordering from our delicious menu!</p>
                <button onClick={() => navigate('/menu')} style={styles.browseButton}>
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Your Orders</h1>

            <div style={styles.ordersGrid}>
                {orders.map((order) => (
                    <div key={order._id} style={styles.orderCard}>
                        {/* Order Header */}
                        <div style={styles.orderHeader}>
                            <div>
                                <h3 style={styles.orderId}>
                                    Order #{order._id.slice(-6).toUpperCase()}
                                </h3>
                                <p style={styles.orderDate}>
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div
                                style={{
                                    ...styles.statusBadge,
                                    backgroundColor: getStatusColor(order.status)
                                }}
                            >
                                <span style={styles.statusIcon}>
                                    {getStatusIcon(order.status)}
                                </span>
                                <span style={styles.statusText}>
                                    {order.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div style={styles.itemsSection}>
                            <h4 style={styles.sectionTitle}>Items:</h4>
                            {order.items.map((item, index) => (
                                <div key={index} style={styles.orderItem}>
                                    <span style={styles.itemInfo}>
                                        {item.name} × {item.quantity}
                                    </span>
                                    <span style={styles.itemPrice}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Order Details */}
                        <div style={styles.detailsSection}>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>📍 Delivery Address:</span>
                                <span style={styles.detailValue}>{order.deliveryAddress}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>📞 Phone:</span>
                                <span style={styles.detailValue}>{order.phone}</span>
                            </div>
                        </div>

                        {/* Order Total */}
                        <div style={styles.totalSection}>
                            <span style={styles.totalLabel}>Total Amount:</span>
                            <span style={styles.totalAmount}>
                                ${order.totalPrice.toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        flex: 1,
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    title: {
        fontSize: '36px',
        fontWeight: 'bold',
        marginBottom: '30px',
        color: '#333'
    },
    ordersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
        gap: '25px'
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '25px',
        transition: 'box-shadow 0.3s'
    },
    orderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #f0f0f0'
    },
    orderId: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#333',
        marginBottom: '5px'
    },
    orderDate: {
        fontSize: '14px',
        color: '#666'
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '20px',
        color: 'white'
    },
    statusIcon: {
        fontSize: '18px'
    },
    statusText: {
        fontSize: '13px',
        fontWeight: '700',
        letterSpacing: '0.5px'
    },
    itemsSection: {
        marginBottom: '20px'
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#333'
    },
    orderItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0'
    },
    itemInfo: {
        fontSize: '15px',
        color: '#555'
    },
    itemPrice: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#28a745'
    },
    detailsSection: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px'
    },
    detailLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#555'
    },
    detailValue: {
        fontSize: '14px',
        color: '#333',
        textAlign: 'right',
        maxWidth: '60%'
    },
    totalSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '15px',
        borderTop: '2px solid #f0f0f0'
    },
    totalLabel: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#333'
    },
    totalAmount: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#28a745'
    },
    emptyOrders: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '50px',
        textAlign: 'center'
    },
    browseButton: {
        marginTop: '20px',
        padding: '12px 30px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer'
    },
    error: {
        textAlign: 'center',
        marginTop: '50px'
    },
    retryButton: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    }
};

export default Orders;