import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const response = await adminApi.getOrder(id);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await adminApi.updateOrderStatus(id, { status: newStatus });
            fetchOrder();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to update status');
        }
    };

    const handlePaymentChange = async (status) => {
        try {
            await adminApi.updatePaymentStatus(id, { payment_status: status });
            fetchOrder();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to update payment');
        }
    };

    if (loading) return <div className="spinner"></div>;
    if (!order) return <div>Order not found</div>;

    const statusOptions = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

    return (
        <div>
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/orders')}>
                        ← Back
                    </button>
                    <h1 className="page-title">Order #{order.id}</h1>
                    <span className={`badge ${order.status}`}>{order.status.replace('_', ' ')}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Order Details */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Order Items</h3>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                                    <td>৳{item.price?.toFixed(2)}</td>
                                    <td>{item.quantity}</td>
                                    <td>৳{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Subtotal:</span>
                            <span>৳{order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Delivery Fee:</span>
                            <span>৳{order.deliveryFee?.toFixed(2)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--accent-success)' }}>
                                <span>Discount ({order.couponCode}):</span>
                                <span>-৳{order.discountAmount?.toFixed(2) || '0.00'}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                            <span>Total:</span>
                            <span>৳{order.totalPrice?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Customer & Actions */}
                <div>
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <h3 className="card-title" style={{ marginBottom: '16px' }}>Customer</h3>
                        <p style={{ marginBottom: '8px' }}><strong>Name:</strong> {order.userName}</p>
                        <p style={{ marginBottom: '8px' }}><strong>Email:</strong> {order.userEmail}</p>
                        <p style={{ marginBottom: '8px' }}><strong>Phone:</strong> {order.phone}</p>
                        <p><strong>Address:</strong> {order.deliveryAddress}</p>
                        {order.notes && (
                            <p style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                                <strong>Notes:</strong> {order.notes}
                            </p>
                        )}
                    </div>

                    <div className="card" style={{ marginBottom: '20px' }}>
                        <h3 className="card-title" style={{ marginBottom: '16px' }}>Update Status</h3>
                        <select
                            className="form-input form-select"
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={order.status === 'delivered' || order.status === 'cancelled'}
                        >
                            {statusOptions.map(s => (
                                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: '16px' }}>Payment</h3>
                        <p style={{ marginBottom: '8px' }}><strong>Method:</strong> Cash on Delivery</p>
                        <p style={{ marginBottom: '16px' }}>
                            <strong>Status:</strong>{' '}
                            <span className={`badge ${order.paymentStatus}`}>{order.paymentStatus}</span>
                        </p>
                        {order.paymentStatus === 'pending' && order.status !== 'cancelled' && (
                            <button className="btn btn-primary" onClick={() => handlePaymentChange('paid')}>
                                Mark as Paid
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Status History */}
            {order.statusHistory?.length > 0 && (
                <div className="card" style={{ marginTop: '24px' }}>
                    <h3 className="card-title" style={{ marginBottom: '16px' }}>Status History</h3>
                    <div>
                        {order.statusHistory.map((h, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '13px', minWidth: '150px' }}>
                                    {new Date(h.changedAt).toLocaleString()}
                                </span>
                                <span>
                                    {h.oldStatus ? `${h.oldStatus} → ` : ''}{h.newStatus}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>by {h.changedByName}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
