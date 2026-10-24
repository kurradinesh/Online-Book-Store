import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.cart.get();
        if (res.data) {
          setCartItems(res.data.items || []);
          setSubtotal(res.data.subtotal || 0);
        }
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage cart for guest
      const saved = localStorage.getItem('guest_cart');
      const items = saved ? JSON.parse(saved) : [];
      setCartItems(items);
      const sum = items.reduce((acc, it) => acc + (it.productPrice * it.quantity), 0);
      setSubtotal(sum);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (book, quantity = 1) => {
    if (isAuthenticated) {
      await api.cart.add(book.id, quantity);
      await fetchCart();
    } else {
      setCartItems(prev => {
        const existingIndex = prev.findIndex(item => item.productId === book.id);
        let updated;
        if (existingIndex > -1) {
          updated = [...prev];
          updated[existingIndex].quantity += quantity;
        } else {
          updated = [
            ...prev,
            {
              id: Date.now(),
              productId: book.id,
              productName: book.title,
              productAuthor: book.author,
              productPrice: book.price,
              productImage: book.imageUrl,
              productCategory: book.genre,
              quantity: quantity,
            }
          ];
        }
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        const sum = updated.reduce((acc, it) => acc + (it.productPrice * it.quantity), 0);
        setSubtotal(sum);
        return updated;
      });
    }
    setIsCartOpen(true);
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (isAuthenticated) {
      await api.cart.updateQuantity(cartItemId, newQuantity);
      await fetchCart();
    } else {
      setCartItems(prev => {
        let updated;
        if (newQuantity <= 0) {
          updated = prev.filter(item => item.id !== cartItemId);
        } else {
          updated = prev.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item);
        }
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        const sum = updated.reduce((acc, it) => acc + (it.productPrice * it.quantity), 0);
        setSubtotal(sum);
        return updated;
      });
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (isAuthenticated) {
      await api.cart.remove(cartItemId);
      await fetchCart();
    } else {
      setCartItems(prev => {
        const updated = prev.filter(item => item.id !== cartItemId);
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        const sum = updated.reduce((acc, it) => acc + (it.productPrice * it.quantity), 0);
        setSubtotal(sum);
        return updated;
      });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await api.cart.clear();
      await fetchCart();
    } else {
      localStorage.removeItem('guest_cart');
      setCartItems([]);
      setSubtotal(0);
    }
  };

  const totalCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      subtotal,
      totalCount,
      loading,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
