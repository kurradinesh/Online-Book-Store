import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { refreshCart, setIsCartOpen } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.wishlist.get();
        if (res.data) {
          setWishlistItems(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      } finally {
        setLoading(false);
      }
    } else {
      const saved = localStorage.getItem('guest_wishlist');
      setWishlistItems(saved ? JSON.parse(saved) : []);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const addToWishlist = async (book) => {
    if (isAuthenticated) {
      await api.wishlist.add(book.id);
      await fetchWishlist();
    } else {
      setWishlistItems(prev => {
        if (prev.some(item => item.productId === book.id)) return prev;
        const updated = [
          ...prev,
          {
            id: Date.now(),
            productId: book.id,
            productName: book.title,
            productAuthor: book.author,
            productPrice: book.price,
            productImage: book.imageUrl,
            productCategory: book.genre,
          }
        ];
        localStorage.setItem('guest_wishlist', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const removeFromWishlist = async (wishlistId, productId) => {
    if (isAuthenticated) {
      await api.wishlist.remove(wishlistId);
      await fetchWishlist();
    } else {
      setWishlistItems(prev => {
        const updated = prev.filter(item => item.productId !== productId && item.id !== wishlistId);
        localStorage.setItem('guest_wishlist', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const moveToCart = async (wishlistItem) => {
    if (isAuthenticated) {
      await api.wishlist.moveToCart(wishlistItem.id);
      await fetchWishlist();
      await refreshCart();
      setIsCartOpen(true);
    } else {
      // In guest mode, add to guest cart and remove from guest wishlist
      removeFromWishlist(wishlistItem.id, wishlistItem.productId);
      const savedCart = localStorage.getItem('guest_cart');
      const cart = savedCart ? JSON.parse(savedCart) : [];
      cart.push({
        id: Date.now(),
        productId: wishlistItem.productId,
        productName: wishlistItem.productName,
        productAuthor: wishlistItem.productAuthor,
        productPrice: wishlistItem.productPrice,
        productImage: wishlistItem.productImage,
        productCategory: wishlistItem.productCategory,
        quantity: 1
      });
      localStorage.setItem('guest_cart', JSON.stringify(cart));
      await refreshCart();
      setIsCartOpen(true);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistCount: wishlistItems.length,
      loading,
      addToWishlist,
      removeFromWishlist,
      moveToCart,
      isInWishlist,
      refreshWishlist: fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
