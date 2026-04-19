import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchCart(); else setItems([]);
  }, [user]);

  const fetchCart = async () => {
    try { setLoading(true); const { data } = await cartAPI.get(); setItems(data); }
    catch {}
    finally { setLoading(false); }
  };

  const addToCart = async (productId, quantity = 1, selectedVariants = null) => {
    await cartAPI.add({ product_id: productId, quantity, selected_variants: selectedVariants });
    await fetchCart();
  };

  const updateItem = async (itemId, quantity) => {
    await cartAPI.update(itemId, quantity);
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await cartAPI.remove(itemId);
    setItems(p => p.filter(i => i.id !== itemId));
  };

  const clearCart = async () => {
    try { await cartAPI.clear(); } catch {}
    setItems([]);
  };

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, updateItem, removeItem, clearCart, total, count, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
