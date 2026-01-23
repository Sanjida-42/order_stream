import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';

const ReviewsList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', page: 1 });
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, [filters]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getAdminReviews(filters);
            setReviews(response.data.reviews);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (reviewId, approve) => {
        try {
            await adminApi.approveReview(reviewId, approve);
            fetchReviews();
        } catch (error) {
            alert('Failed to update review status');
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm('Delete this review permanently?')) return;
        try {
            await adminApi.deleteAdminReview(reviewId);
            fetchReviews();
        } catch (error) {
            alert('Failed to delete review');
        }
    };

    if (loading && reviews.length === 0) return <div className="spinner"></div>;

    return (
        <div>
            <div className="admin-header">
                <h1 className="page-title">Review Moderation ({total})</h1>
                <div className="header-actions">
                    <select
                        className="form-input form-select"
                        style={{ width: 'auto' }}
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                        <option value="">All Reviews</option>
                        <option value="pending">Pending Only</option>
                        <option value="approved">Approved Only</option>
                    </select>
                    <button className="btn btn-secondary" onClick={fetchReviews}>🔄 Refresh</button>
                </div>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Item</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review.id}>
                                <td>#{review.id}</td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{review.userName}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {review.isVerifiedPurchase ? '✅ Verified' : 'Standard'}
                                    </div>
                                </td>
                                <td>{review.menuItemName}</td>
                                <td>
                                    <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{review.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                                        {review.comment}
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${review.isApproved ? 'delivered' : 'pending'}`}>
                                        {review.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {!review.isApproved ? (
                                            <button className="btn btn-sm btn-primary" onClick={() => handleApprove(review.id, true)}>
                                                Approve
                                            </button>
                                        ) : (
                                            <button className="btn btn-sm btn-secondary" onClick={() => handleApprove(review.id, false)}>
                                                Hide
                                            </button>
                                        )}
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(review.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reviews.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        No reviews found for moderation.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsList;
