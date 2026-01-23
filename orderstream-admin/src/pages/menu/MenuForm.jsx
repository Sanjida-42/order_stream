import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

const MenuForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Main Course',
        price: '',
        image_url: '',
        available: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = ['Starter', 'Main Course', 'Dessert', 'Drinks'];

    useEffect(() => {
        if (isEdit) {
            fetchItem();
        }
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await adminApi.getMenuItem(id);
            const item = response.data;
            setFormData({
                name: item.name || '',
                description: item.description || '',
                category: item.category || 'Main Course',
                price: item.price || '',
                image_url: item.imageUrl || '',
                available: item.available !== false
            });
        } catch (error) {
            console.error('Failed to fetch item:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = { ...formData, price: parseFloat(formData.price) };
            if (isEdit) {
                await adminApi.updateMenuItem(id, data);
            } else {
                await adminApi.createMenuItem(data);
            }
            navigate('/menu');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/menu')}>
                        ← Back
                    </button>
                    <h1 className="page-title">{isEdit ? 'Edit Menu Item' : 'Add Menu Item'}</h1>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select
                            className="form-input form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Price (৳) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-input"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Image URL</label>
                        <input
                            type="url"
                            className="form-input"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.available}
                                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span className="form-label" style={{ marginBottom: 0 }}>Available for ordering</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (isEdit ? 'Update Item' : 'Create Item')}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/menu')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuForm;
