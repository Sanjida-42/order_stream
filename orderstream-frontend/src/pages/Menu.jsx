import { useState, useEffect, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { menuAPI, categoryAPI } from '../services/api';
import StarRating from '../components/StarRating';
import ProductDetailModal from '../components/ProductDetailModal';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [itemsRes, catsRes] = await Promise.all([
                menuAPI.getAllItems(),
                categoryAPI.getAll()
            ]);

            const itemsData = itemsRes.data.items || itemsRes.data;
            setItems(itemsData);

            const allCats = [{ id: 0, name: 'All' }, ...catsRes.data];
            setCategories(allCats);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Auto-refresh menu every 10 seconds for real-time updates
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleAddToCart = (e, item) => {
        e.stopPropagation(); // Prevent opening modal
        if (!user) {
            alert('Please login to order items');
            navigate('/login');
            return;
        }
        addToCart(item);
        alert(`${item.name} added to cart!`);
    };

    const handleProductClick = (item) => {
        setSelectedProduct(item);
    };

    const filteredItems = selectedCategory === 'All'
        ? items
        : items.filter(item => item.category === selectedCategory);

    // Group items by category for layout
    const itemsByCategory = {};
    if (selectedCategory === 'All') {
        filteredItems.forEach(item => {
            const cat = item.category || 'Other';
            if (!itemsByCategory[cat]) itemsByCategory[cat] = [];
            itemsByCategory[cat].push(item);
        });
    } else {
        itemsByCategory[selectedCategory] = filteredItems;
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading delicious menu...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Our Menu</h1>

            {/* Category Filter */}
            <div style={styles.categories}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        style={{
                            ...styles.categoryBtn,
                            backgroundColor: selectedCategory === cat.name ? '#007bff' : '#f0f0f0',
                            color: selectedCategory === cat.name ? 'white' : '#333'
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Menu Items */}
            {Object.keys(itemsByCategory).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No items found in this category.
                </div>
            ) : (
                Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                    <div key={category} style={styles.section}>
                        <h2 style={styles.sectionTitle}>{category}</h2>
                        <div style={styles.grid}>
                            {categoryItems.map(item => (
                                <div
                                    key={item._id || item.id}
                                    style={styles.card}
                                    onClick={() => handleProductClick(item)}
                                >
                                    <div style={styles.imageContainer}>
                                        <img src={item.imageUrl} alt={item.name} style={styles.image} />
                                        {!item.available && (
                                            <div style={styles.unavailableOverlay}>Sold Out</div>
                                        )}
                                    </div>
                                    <div style={styles.cardContent}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <h3 style={styles.itemName}>{item.name}</h3>
                                            <span style={styles.price}>৳{item.price.toFixed(2)}</span>
                                        </div>
                                        <p style={styles.description}>{item.description}</p>

                                        <div style={styles.ratingContainer}>
                                            <StarRating rating={item.rating || 0} size={16} />
                                            <span style={styles.ratingText}>
                                                {item.rating ? item.rating.toFixed(1) : 'New'}
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => handleAddToCart(e, item)}
                                            disabled={!item.available}
                                            style={{
                                                ...styles.addButton,
                                                backgroundColor: item.available ? '#28a745' : '#ccc',
                                                cursor: item.available ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {item.available ? 'Add to Cart' : 'Unavailable'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {selectedProduct && (
                <ProductDetailModal
                    item={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    title: {
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '36px',
        color: '#333',
    },
    categories: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '40px',
        flexWrap: 'wrap',
    },
    categoryBtn: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },
    section: {
        marginBottom: '40px'
    },
    sectionTitle: {
        fontSize: '24px',
        marginBottom: '20px',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px',
        color: '#444'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px',
    },
    card: {
        border: '1px solid #ddd',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        cursor: 'pointer'
    },
    imageContainer: {
        position: 'relative',
        height: '200px',
        backgroundColor: '#f8f9fa'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    unavailableOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '20px',
        color: '#dc3545'
    },
    cardContent: {
        padding: '20px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    itemName: {
        fontSize: '18px',
        margin: '0 0 10px 0',
        color: '#333',
    },
    price: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#007bff',
    },
    description: {
        color: '#666',
        fontSize: '14px',
        marginBottom: '10px',
        flex: 1,
        lineHeight: '1.4'
    },
    ratingContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '15px'
    },
    ratingText: {
        fontSize: '14px',
        color: '#666',
        fontWeight: '500'
    },
    addButton: {
        width: '100%',
        padding: '10px',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        fontSize: '16px',
        fontWeight: '600',
    },
};

export default Menu;