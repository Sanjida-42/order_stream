import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

const MenuList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');

    const categories = ['All', 'Starter', 'Main Course', 'Dessert', 'Drinks'];

    useEffect(() => {
        fetchItems();
    }, [category]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = category && category !== 'All' ? { category } : {};
            const response = await adminApi.getMenuItems(params);
            setItems(response.data.items);
        } catch (error) {
            console.error('Failed to fetch menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id, available) => {
        try {
            await adminApi.toggleAvailability(id, !available);
            fetchItems();
        } catch (error) {
            alert('Failed to update availability');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await adminApi.deleteMenuItem(id);
            fetchItems();
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to delete item');
        }
    };

    if (loading && items.length === 0) return <div className="spinner"></div>;

    return (
        <div>
            <div className="admin-header">
                <h1 className="page-title">Menu Items</h1>
                <div className="header-actions">
                    <select
                        className="form-input form-select"
                        style={{ width: 'auto' }}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Link to="/menu/new" className="btn btn-primary">
                        + Add Item
                    </Link>
                </div>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Rating</th>
                            <th>Available</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                </td>
                                <td style={{ fontWeight: 600 }}>{item.name}</td>
                                <td>{item.category}</td>
                                <td>৳{item.price?.toFixed(2)}</td>
                                <td>⭐ {item.rating?.toFixed(1)}</td>
                                <td>
                                    <button
                                        className={`btn btn-sm ${item.available ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => handleToggle(item.id, item.available)}
                                    >
                                        {item.available ? 'Available' : 'Unavailable'}
                                    </button>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <Link to={`/menu/${item.id}/edit`} className="btn btn-sm btn-secondary">
                                            Edit
                                        </Link>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MenuList;
