import { useState, useEffect, useContext } from 'react';
import { menuAPI } from '../services/api';
import { CartContext } from '../context/CartContext';
import MenuCard from '../components/MenuCard';

const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [error, setError] = useState('');
    const { addToCart } = useContext(CartContext);

    const categories = ['All', 'Starter', 'Main Course', 'Dessert', 'Drinks'];

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const response = await menuAPI.getAllItems();
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error fetching menu:', error);
            setError('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems =
        selectedCategory === 'All'
            ? menuItems
            : menuItems.filter((item) => item.category === selectedCategory);

    const handleAddToCart = (item) => {
        addToCart(item);
        alert(`${item.name} added to cart!`);
    };

    if (loading) {
        return <div className="spinner"></div>;
    }

    if (error) {
        return (
            <div style={styles.error}>
                <p>{error}</p>
                <button onClick={fetchMenuItems} style={styles.retryButton}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Our Menu</h1>

            {/* Category Filter */}
            <div style={styles.categoryContainer}>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                            ...styles.categoryButton,
                            ...(selectedCategory === category ? styles.activeCategory : {})
                        }}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Menu Items Grid */}
            {filteredItems.length === 0 ? (
                <p style={styles.noItems}>No items found in this category</p>
            ) : (
                <div style={styles.grid}>
                    {filteredItems.map((item) => (
                        <MenuCard key={item._id} item={item} onAddToCart={handleAddToCart} />
                    ))}
                </div>
            )}
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
        textAlign: 'center',
        color: '#333'
    },
    categoryContainer: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '40px'
    },
    categoryButton: {
        padding: '10px 24px',
        backgroundColor: '#f0f0f0',
        color: '#333',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '500',
        transition: 'all 0.3s'
    },
    activeCategory: {
        backgroundColor: '#007bff',
        color: 'white'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '25px'
    },
    noItems: {
        textAlign: 'center',
        fontSize: '18px',
        color: '#666',
        marginTop: '50px'
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

export default Menu;