const MenuCard = ({ item, onAddToCart }) => {
    return (
        <div style={styles.card}>
            <img src={item.imageUrl} alt={item.name} style={styles.image} />
            <div style={styles.content}>
                <h3 style={styles.name}>{item.name}</h3>
                <p style={styles.description}>{item.description}</p>
                <div style={styles.footer}>
                    <div>
                        <p style={styles.price}>${item.price.toFixed(2)}</p>
                        <p style={styles.rating}>⭐ {item.rating} / 5</p>
                    </div>
                    <button onClick={() => onAddToCart(item)} style={styles.button}>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    card: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        cursor: 'pointer'
    },
    image: {
        width: '100%',
        height: '200px',
        objectFit: 'cover'
    },
    content: {
        padding: '15px'
    },
    name: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#333'
    },
    description: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '15px',
        height: '40px',
        overflow: 'hidden'
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    price: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#28a745',
        marginBottom: '5px'
    },
    rating: {
        fontSize: '14px',
        color: '#ff9800'
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600'
    }
};

export default MenuCard;