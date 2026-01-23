import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { orderAPI, couponAPI } from '../services/api';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
        useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState({
        deliveryAddress: user?.address || '',
        phone: user?.phone || '',
        notes: ''
    });

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const subtotal = getTotalPrice();
    const deliveryFee = 60.00;
    const total = subtotal + deliveryFee - couponDiscount;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        if (!user) {
            alert('Please login to apply coupon');
            return;
        }

        setCouponLoading(true);
        setCouponMessage('');

        try {
            const response = await couponAPI.validate(couponCode, subtotal);
            const result = response.data;

            if (result.valid) {
                setCouponDiscount(result.discount_amount);
                setAppliedCoupon(couponCode.toUpperCase());
                setCouponMessage(result.message);
            } else {
                setCouponDiscount(0);
                setAppliedCoupon(null);
                setCouponMessage(result.message);
            }
        } catch (error) {
            setCouponMessage('Failed to validate coupon');
            setCouponDiscount(0);
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setCouponCode('');
        setCouponDiscount(0);
        setAppliedCoupon(null);
        setCouponMessage('');
    };

    const handlePlaceOrder = async () => {
        if (!user) {
            alert('Please login to place an order');
            navigate('/login');
            return;
        }

        if (!orderDetails.deliveryAddress || !orderDetails.phone) {
            alert('Please fill in delivery address and phone number');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                items: cart.map((item) => ({
                    menuItemId: item._id || item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal: subtotal,
                deliveryAddress: orderDetails.deliveryAddress,
                phone: orderDetails.phone,
                notes: orderDetails.notes || null,
                couponCode: appliedCoupon || null
            };

            await orderAPI.createOrder(orderData);
            alert('Order placed successfully! Payment: Cash on Delivery');
            clearCart();
            navigate('/orders');
        } catch (error) {
            console.error('Order error:', error);
            alert(
                'Failed to place order: ' +
                (error.response?.data?.detail || error.message)
            );
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div style={styles.emptyCart}>
                <h2>Your cart is empty</h2>
                <p>Add some delicious items from our menu!</p>
                <button onClick={() => navigate('/menu')} style={styles.browseButton}>
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Your Cart</h1>

            <div style={styles.layout}>
                {/* Cart Items */}
                <div style={styles.itemsSection}>
                    {cart.map((item) => (
                        <div key={item._id || item.id} style={styles.cartItem}>
                            <img src={item.imageUrl} alt={item.name} style={styles.image} />
                            <div style={styles.itemDetails}>
                                <h3 style={styles.itemName}>{item.name}</h3>
                                <p style={styles.itemPrice}>৳{item.price.toFixed(2)} each</p>
                                <div style={styles.quantityControls}>
                                    <button
                                        onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                                        style={styles.quantityButton}
                                    >
                                        -
                                    </button>
                                    <span style={styles.quantity}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                                        style={styles.quantityButton}
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => removeFromCart(item._id || item.id)}
                                        style={styles.removeButton}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                            <div style={styles.itemTotal}>
                                ৳{(item.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div style={styles.summarySection}>
                    <div style={styles.summaryCard}>
                        <h3 style={styles.summaryTitle}>Order Summary</h3>

                        <div style={styles.summaryRow}>
                            <span>Subtotal:</span>
                            <span>৳{subtotal.toFixed(2)}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span>Delivery Fee:</span>
                            <span>৳{deliveryFee.toFixed(2)}</span>
                        </div>

                        {couponDiscount > 0 && (
                            <div style={{ ...styles.summaryRow, color: '#28a745' }}>
                                <span>Discount ({appliedCoupon}):</span>
                                <span>-৳{couponDiscount.toFixed(2)}</span>
                            </div>
                        )}

                        <hr style={styles.divider} />
                        <div style={styles.totalRow}>
                            <span>Total:</span>
                            <span>৳{total.toFixed(2)}</span>
                        </div>

                        {/* Coupon Section */}
                        <div style={styles.couponSection}>
                            <h4 style={styles.sectionTitle}>Have a Coupon?</h4>
                            <div style={styles.couponInput}>
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    style={styles.input}
                                    disabled={!!appliedCoupon}
                                />
                                {appliedCoupon ? (
                                    <button onClick={removeCoupon} style={styles.removeCouponButton}>
                                        Remove
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading}
                                        style={styles.applyButton}
                                    >
                                        {couponLoading ? '...' : 'Apply'}
                                    </button>
                                )}
                            </div>
                            {couponMessage && (
                                <p style={{
                                    fontSize: '13px',
                                    marginTop: '8px',
                                    color: couponDiscount > 0 ? '#28a745' : '#dc3545'
                                }}>
                                    {couponMessage}
                                </p>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div style={styles.paymentSection}>
                            <h4 style={styles.sectionTitle}>Payment Method</h4>
                            <div style={styles.paymentOption}>
                                <span>💵</span>
                                <span>Cash on Delivery</span>
                                <span style={styles.checkmark}>✓</span>
                            </div>
                        </div>

                        {/* Delivery Details */}
                        <div style={styles.deliverySection}>
                            <h4 style={styles.sectionTitle}>Delivery Details</h4>
                            <input
                                type="text"
                                placeholder="Delivery Address *"
                                value={orderDetails.deliveryAddress}
                                onChange={(e) =>
                                    setOrderDetails({
                                        ...orderDetails,
                                        deliveryAddress: e.target.value
                                    })
                                }
                                style={styles.input}
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number *"
                                value={orderDetails.phone}
                                onChange={(e) =>
                                    setOrderDetails({ ...orderDetails, phone: e.target.value })
                                }
                                style={styles.input}
                            />
                            <textarea
                                placeholder="Order notes (optional)"
                                value={orderDetails.notes}
                                onChange={(e) =>
                                    setOrderDetails({ ...orderDetails, notes: e.target.value })
                                }
                                style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
                            />
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            style={{
                                ...styles.placeOrderButton,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Placing Order...' : `Place Order - ৳${total.toFixed(2)}`}
                        </button>
                    </div>
                </div>
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
    layout: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px'
    },
    itemsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    cartItem: {
        display: 'flex',
        gap: '20px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    image: {
        width: '120px',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '8px'
    },
    itemDetails: {
        flex: 1
    },
    itemName: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#333'
    },
    itemPrice: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '15px'
    },
    quantityControls: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    quantityButton: {
        width: '35px',
        height: '35px',
        backgroundColor: '#f0f0f0',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '18px',
        fontWeight: 'bold'
    },
    quantity: {
        fontSize: '16px',
        fontWeight: '600',
        minWidth: '30px',
        textAlign: 'center'
    },
    removeButton: {
        marginLeft: 'auto',
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    itemTotal: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#28a745'
    },
    summarySection: {
        height: 'fit-content',
        position: 'sticky',
        top: '20px'
    },
    summaryCard: {
        padding: '25px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    summaryTitle: {
        fontSize: '22px',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#333'
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '12px',
        fontSize: '16px',
        color: '#666'
    },
    divider: {
        border: 'none',
        borderTop: '1px solid #ddd',
        margin: '15px 0'
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '25px'
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#333'
    },
    couponSection: {
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee'
    },
    couponInput: {
        display: 'flex',
        gap: '10px'
    },
    applyButton: {
        padding: '12px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '600'
    },
    removeCouponButton: {
        padding: '12px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '600'
    },
    paymentSection: {
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee'
    },
    paymentOption: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#e8f5e9',
        borderRadius: '8px',
        border: '2px solid #28a745'
    },
    checkmark: {
        marginLeft: 'auto',
        color: '#28a745',
        fontWeight: 'bold'
    },
    deliverySection: {
        marginBottom: '20px'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '14px',
        marginBottom: '12px',
        boxSizing: 'border-box'
    },
    placeOrderButton: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    emptyCart: {
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
    }
};

export default Cart;