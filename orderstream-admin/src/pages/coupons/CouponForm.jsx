import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

const CouponForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: 0,
        max_discount_amount: '',
        usage_limit: '',
        usage_limit_per_user: 1,
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit) fetchCoupon();
    }, [id]);

    const fetchCoupon = async () => {
        try {
            const response = await adminApi.getCoupon(id);
            const c = response.data;
            setFormData({
                code: c.code || '',
                description: c.description || '',
                discount_type: c.discountType || 'percentage',
                discount_value: c.discountValue || '',
                min_order_amount: c.minOrderAmount || 0,
                max_discount_amount: c.maxDiscountAmount || '',
                usage_limit: c.usageLimit || '',
                usage_limit_per_user: c.usageLimitPerUser || 1,
                is_active: c.isActive !== false
            });
        } catch (error) {
            console.error('Failed to fetch coupon:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = {
                ...formData,
                discount_value: parseFloat(formData.discount_value),
                min_order_amount: parseFloat(formData.min_order_amount) || 0,
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
                usage_limit_per_user: parseInt(formData.usage_limit_per_user) || 1
            };

            if (isEdit) {
                await adminApi.updateCoupon(id, data);
            } else {
                await adminApi.createCoupon(data);
            }
            navigate('/coupons');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save coupon');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/coupons')}>← Back</button>
                    <h1 className="page-title">{isEdit ? 'Edit Coupon' : 'Create Coupon'}</h1>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Coupon Code *</label>
                        <input
                            className="form-input"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="SUMMER20"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                            className="form-input"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="20% off summer sale"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Discount Type *</label>
                            <select
                                className="form-input form-select"
                                value={formData.discount_type}
                                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed_amount">Fixed Amount (৳)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Discount Value *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-input"
                                value={formData.discount_value}
                                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Min Order Amount (৳)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-input"
                                value={formData.min_order_amount}
                                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Discount (৳)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-input"
                                value={formData.max_discount_amount}
                                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                placeholder="For percentage discounts"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Total Usage Limit</label>
                            <input
                                type="number"
                                min="1"
                                className="form-input"
                                value={formData.usage_limit}
                                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                placeholder="Unlimited"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Per User Limit</label>
                            <input
                                type="number"
                                min="1"
                                className="form-input"
                                value={formData.usage_limit_per_user}
                                onChange={(e) => setFormData({ ...formData, usage_limit_per_user: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span className="form-label" style={{ marginBottom: 0 }}>Active</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/coupons')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CouponForm;
