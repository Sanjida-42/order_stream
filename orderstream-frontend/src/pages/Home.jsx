import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <h1 style={styles.title}>Welcome to OrderStream</h1>
                <p style={styles.subtitle}>
                    Your favorite food, delivered fresh and fast
                </p>
                <Link to="/menu">
                    <button style={styles.ctaButton}>Browse Menu</button>
                </Link>
            </div>

            <div style={styles.features}>
                <div style={styles.featureCard}>
                    <div style={styles.icon}>🍕</div>
                    <h3>Wide Selection</h3>
                    <p>Choose from our extensive menu of delicious dishes</p>
                </div>
                <div style={styles.featureCard}>
                    <div style={styles.icon}>⚡</div>
                    <h3>Fast Delivery</h3>
                    <p>Get your food delivered hot and fresh in minutes</p>
                </div>
                <div style={styles.featureCard}>
                    <div style={styles.icon}>🎯</div>
                    <h3>Easy Tracking</h3>
                    <p>Track your order in real-time from kitchen to doorstep</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        flex: 1,
        padding: '40px 20px'
    },
    hero: {
        textAlign: 'center',
        marginBottom: '60px'
    },
    title: {
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#333'
    },
    subtitle: {
        fontSize: '20px',
        color: '#666',
        marginBottom: '30px'
    },
    ctaButton: {
        padding: '15px 40px',
        fontSize: '18px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600'
    },
    features: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        maxWidth: '1000px',
        margin: '0 auto'
    },
    featureCard: {
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    icon: {
        fontSize: '48px',
        marginBottom: '15px'
    }
};

export default Home;