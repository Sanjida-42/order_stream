import { useEffect, useState, useContext } from 'react';
import { orderAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [reviewModal, setReviewModal] = useState({ show: false, menuItemId: null, orderId: null });

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (user) {
                    const response = await orderAPI.getUserOrders();
                    setOrders(response.data);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const handleReviewClick = (menuItemId, orderId) => {
        setReviewModal({ show: true, menuItemId, orderId });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f1c40f',
            confirmed: '#3498db',
            preparing: '#9b59b6',
            ready: '#e67e22',
            out_for_delivery: '#1abc9c',
            delivered: '#2ecc71',
            cancelled: '#e74c3c'
        };
        return colors[status] || '#95a5a6';
    };

    if (loading) return <div>Loading...</div>;

    if (!orders.length) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>No orders found</h2>
                <p>Start ordering delicious food now!</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Your Orders</h1>
            <div style={styles.list}>
                {orders.map((order) => (
                    <div key={order._id || order.id} style={styles.card}>
                        <div style={styles.header}>
                            <span style={styles.orderId}>Order #{order._id || order.id}</span>
                            <span style={{
                                ...styles.status,
                                backgroundColor: getStatusColor(order.status)
                            }}>
                                {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        <div style={styles.date}>
                            {new Date(order.createdAt).toLocaleString()}
                        </div>

                        <div style={styles.items}>
                            {order.items.map((item, idx) => (
                                <div key={idx} style={styles.item}>
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                                    {order.status === 'delivered' && (
                                        <button
                                            onClick={() => handleReviewClick(item.menuItemId, order._id || order.id)}
                                            style={styles.reviewBtn}
                                        >
                                            Review
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={styles.footer}>
                            <div style={styles.row}>
                                <span>Subtotal:</span>
                                <span>৳{order.subtotal?.toFixed(2)}</span>
                            </div>
                            <div style={styles.row}>
                                <span>Delivery:</span>
                                <span>৳{order.deliveryFee?.toFixed(2)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div style={{ ...styles.row, color: '#28a745' }}>
                                    <span>Discount:</span>
                                    <span>-৳{order.discountAmount?.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ ...styles.row, fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}>
                                <span>Total:</span>
                                <span>৳{order.totalPrice.toFixed(2)}</span>
                            </div>

                            {/* Order Status History */}
                            {order.statusHistory && order.statusHistory.length > 0 && (
                                <div style={styles.historyContainer}>
                                    <div style={styles.historyTitle}>Order Updates</div>
                                    {order.statusHistory.map((h, i) => (
                                        <div key={i} style={styles.historyItem}>
                                            <div style={styles.historyDot}></div>
                                            <div style={styles.historyContent}>
                                                <div style={styles.historyStatus}>{h.newStatus.replace('_', ' ').toUpperCase()}</div>
                                                <div style={styles.historyTime}>{new Date(h.changedAt).toLocaleString()}</div>
                                                {h.notes && <div style={styles.historyNotes}>{h.notes}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {reviewModal.show && (
                <ReviewForm
                    menuItemId={reviewModal.menuItemId}
                    orderId={reviewModal.orderId}
                    onReviewSubmitted={() => setReviewModal({ show: false, menuItemId: null, orderId: null })}
                    onClose={() => setReviewModal({ show: false, menuItemId: null, orderId: null })}
                />
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
    },
    title: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333'
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    card: {
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    orderId: {
        fontWeight: 'bold',
        fontSize: '18px'
    },
    status: {
        padding: '5px 10px',
        borderRadius: '15px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    date: {
        color: '#666',
        fontSize: '14px',
        marginBottom: '20px'
    },
    items: {
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee',
        padding: '15px 0',
        marginBottom: '15px'
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        color: '#444'
    },
    reviewBtn: {
        padding: '4px 8px',
        fontSize: '12px',
        marginLeft: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    footer: {
        marginTop: '10px'
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '5px'
    },
    historyContainer: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    historyTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '12px',
        color: '#666'
    },
    historyItem: {
        display: 'flex',
        gap: '12px',
        borderLeft: '2px solid #ddd',
        paddingLeft: '15px',
        paddingBottom: '15px',
        position: 'relative'
    },
    historyDot: {
        position: 'absolute',
        left: '-7px',
        top: '0',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: '#007bff'
    },
    historyContent: {
        flex: 1
    },
    historyStatus: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#333'
    },
    historyTime: {
        fontSize: '11px',
        color: '#999'
    },
    historyNotes: {
        fontSize: '12px',
        color: '#666',
        marginTop: '4px',
        fontStyle: 'italic'
    }
};

export default Orders;