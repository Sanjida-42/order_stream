const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <p>&copy; 2025 OrderStream. All rights reserved.</p>
                <p>Made with ❤️ for food lovers</p>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#333',
        color: 'white',
        padding: '20px 0',
        marginTop: 'auto',
        textAlign: 'center'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto'
    }
};

export default Footer;