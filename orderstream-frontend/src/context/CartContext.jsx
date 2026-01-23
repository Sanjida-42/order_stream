import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cart, setCart] = useState([]);

    // Load cart when user changes
    useEffect(() => {
        if (user) {
            const savedCart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]');
            setCart(savedCart);
        } else {
            setCart([]);
        }
    }, [user]);

    const updateCart = (newCart) => {
        setCart(newCart);
        if (user) {
            localStorage.setItem(`cart_${user.id}`, JSON.stringify(newCart));
        }
    };

    const addToCart = (item, quantityToAdd = 1) => {
        const itemId = item.id || item._id;
        const existingItem = cart.find(cartItem => (cartItem.id || cartItem._id) === itemId);

        if (existingItem) {
            updateCart(
                cart.map(cartItem =>
                    (cartItem.id || cartItem._id) === itemId
                        ? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
                        : cartItem
                )
            );
        } else {
            updateCart([...cart, { ...item, id: itemId, quantity: quantityToAdd }]);
        }
    };

    const removeFromCart = (itemId) => {
        updateCart(cart.filter(item => (item.id || item._id) !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCart(
                cart.map(item =>
                    (item.id || item._id) === itemId ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = () => {
        updateCart([]);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalPrice,
                getTotalItems
            }}
        >
            {children}
        </CartContext.Provider>
    );
};