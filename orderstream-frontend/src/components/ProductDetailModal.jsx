import { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { reviewAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';

const ProductDetailModal = ({ item, onClose }) => {
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        if (item) {
            fetchReviews();
        }
    }, [item]);

    const fetchReviews = async () => {
        try {
            setLoadingReviews(true);
            const response = await reviewAPI.getItemReviews(item.id || item._id);
            setReviews(response.data.reviews || []);
            setSummary(response.data.summary);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    if (!item) return null;

    const handleAddToCart = () => {
        if (!user) {
            alert('Please login to order items');
            navigate('/login');
            return;
        }

        addToCart(item, quantity);
        onClose();
        alert(`${quantity}x ${item.name} added to cart!`);
    };

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewedOrderId, setReviewedOrderId] = useState(null);

    const handleWriteReview = async () => {
        if (!user) {
            alert('Please login to write a review');
            navigate('/login');
            return;
        }

        // Find if user has a delivered order for this item to get the orderId
        // This is optional since backend will verify regardless, but good for UI
        setShowReviewForm(true);
    };

    const handleReviewSubmitted = () => {
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews list
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={styles.closeBtn}>×</button>

                <div style={styles.content}>
                    <div style={styles.imageSection}>
                        <img src={item.imageUrl} alt={item.name} style={styles.image} />
                    </div>

                    <div style={styles.detailsSection}>
                        <div style={styles.badge}>{item.category}</div>
                        <h2 style={styles.title}>{item.name}</h2>

                        <div style={styles.ratingRow}>
                            <StarRating rating={summary?.averageRating || item.rating || 0} size={20} />
                            <span style={styles.ratingCount}>
                                ({summary?.totalReviews || 0} {summary?.totalReviews === 1 ? 'Review' : 'Reviews'})
                            </span>
                        </div>

                        <p style={styles.price}>৳{item.price.toFixed(2)}</p>

                        <p style={styles.description}>
                            {item.description}
                        </p>

                        {item.available ? (
                            <div style={styles.actions}>
                                <div style={styles.qtyControl}>
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}>-</button>
                                    <span style={styles.qty}>{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} style={styles.qtyBtn}>+</button>
                                </div>
                                <button onClick={handleAddToCart} style={styles.addBtn}>
                                    Add to Cart - ৳{(item.price * quantity).toFixed(2)}
                                </button>
                            </div>
                        ) : (
                            <div style={styles.unavailable}>
                                Currently Unavailable
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div style={styles.reviewsSection}>
                            <div style={styles.reviewsHeaderRow}>
                                <h3 style={styles.reviewsTitle}>Customer Reviews</h3>
                                <button onClick={handleWriteReview} style={styles.writeReviewBtn}>
                                    Write a Review
                                </button>
                            </div>

                            {loadingReviews ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>Loading reviews...</div>
                            ) : reviews.length > 0 ? (
                                <div style={styles.reviewsList}>
                                    {reviews.map(review => (
                                        <div key={review.id} style={styles.reviewCard}>
                                            <div style={styles.reviewHeader}>
                                                <span style={styles.reviewerName}>{review.userName}</span>
                                                <StarRating rating={review.rating} size={14} />
                                            </div>
                                            <div style={styles.reviewMeta}>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                                {review.isVerifiedPurchase && (
                                                    <span style={styles.verifiedBadge}>Verified Purchase</span>
                                                )}
                                            </div>
                                            <div style={styles.reviewTitle}>{review.title}</div>
                                            <p style={styles.reviewComment}>{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={styles.noReviews}>No reviews yet. Be the first to review!</div>
                            )}
                        </div>
                    </div>
                </div>

                {showReviewForm && (
                    <ReviewForm
                        menuItemId={item.id || item._id}
                        orderId={null} // Let backend find the order
                        onReviewSubmitted={handleReviewSubmitted}
                        onClose={() => setShowReviewForm(false)}
                    />
                )}
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '15px',
        maxWidth: '850px',
        width: '100%',
        maxHeight: '90vh',
        position: 'relative',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    },
    closeBtn: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        fontSize: '20px',
        cursor: 'pointer',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        display: 'flex',
        flexDirection: 'row',
        minHeight: '400px',
        '@media (max-width: 768px)': {
            flexDirection: 'column'
        }
    },
    imageSection: {
        flex: '1',
        minHeight: '300px',
        backgroundColor: '#f8f9fa',
        position: 'sticky',
        top: 0
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    detailsSection: {
        flex: '1.2',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'visible'
    },
    badge: {
        display: 'inline-block',
        padding: '4px 12px',
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '10px',
        width: 'fit-content'
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#1a1a1a'
    },
    ratingRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '15px'
    },
    ratingCount: {
        color: '#666',
        fontSize: '14px'
    },
    price: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#28a745',
        marginBottom: '15px'
    },
    description: {
        color: '#555',
        lineHeight: '1.6',
        marginBottom: '25px'
    },
    actions: {
        display: 'flex',
        gap: '15px',
        marginBottom: '30px'
    },
    qtyControl: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    qtyBtn: {
        width: '35px',
        height: '40px',
        border: 'none',
        backgroundColor: '#f8f9fa',
        cursor: 'pointer',
        fontSize: '18px',
        fontWeight: 'bold'
    },
    qty: {
        width: '40px',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    addBtn: {
        flex: 1,
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    unavailable: {
        padding: '15px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: '30px'
    },
    reviewsSection: {
        borderTop: '1px solid #eee',
        paddingTop: '30px'
    },
    reviewsHeaderRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    reviewsTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333'
    },
    writeReviewBtn: {
        padding: '8px 16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    reviewsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    reviewCard: {
        paddingBottom: '15px',
        borderBottom: '1px solid #f0f0f0'
    },
    reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px'
    },
    reviewerName: {
        fontWeight: '600',
        fontSize: '15px'
    },
    reviewMeta: {
        fontSize: '12px',
        color: '#999',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    reviewTitle: {
        fontWeight: 'bold',
        fontSize: '14px',
        marginBottom: '5px',
        color: '#333'
    },
    reviewComment: {
        fontSize: '14px',
        color: '#555',
        lineHeight: '1.4'
    },
    noReviews: {
        textAlign: 'center',
        color: '#999',
        padding: '20px',
        fontStyle: 'italic'
    },
    verifiedBadge: {
        color: '#28a745',
        fontWeight: '600',
        fontSize: '11px',
        backgroundColor: '#e8f5e9',
        padding: '2px 6px',
        borderRadius: '4px'
    }
};

export default ProductDetailModal;
