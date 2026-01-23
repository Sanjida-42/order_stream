import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

const CouponsList = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getCoupons({});
            setCoupons(response.data.coupons);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await adminApi.toggleCoupon(id);
            fetchCoupons();
        } catch (error) {
            alert('Failed to toggle coupon');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this coupon?')) return;
        try {
            await adminApi.deleteCoupon(id);
            fetchCoupons();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to delete');
        }
    };

    if (loading) return <div className="spinner"></div>;

    return (
        <div>
            <div className="admin-header">
                <h1 className="page-title">Coupons</h1>
                <Link to="/coupons/new" className="btn btn-primary">
                    + Create Coupon
                </Link>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Description</th>
                            <th>Discount</th>
                            <th>Min Order</th>
                            <th>Usage</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon) => (
                            <tr key={coupon.id}>
                                <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{coupon.code}</td>
                                <td>{coupon.description}</td>
                                <td>
                                    {coupon.discountType === 'percentage'
                                        ? `${coupon.discountValue}%`
                                        : `৳${coupon.discountValue}`}
                                </td>
                                <td>৳{coupon.minOrderAmount}</td>
                                <td>
                                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                                </td>
                                <td>
                                    <span className={`badge ${coupon.isActive ? 'delivered' : 'cancelled'}`}>
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className={`btn btn-sm ${coupon.isActive ? 'btn-secondary' : 'btn-primary'}`}
                                            onClick={() => handleToggle(coupon.id)}
                                        >
                                            {coupon.isActive ? 'Disable' : 'Enable'}
                                        </button>
                                        <Link to={`/coupons/${coupon.id}/edit`} className="btn btn-sm btn-secondary">
                                            Edit
                                        </Link>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(coupon.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {coupons.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        No coupons found. Create your first coupon!
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponsList;
