import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import './Toast.css';

const CartContext = createContext();

/* ─────────────────────────────────────────────
   Global Toast Component (rendered at root)
   ───────────────────────────────────────────── */
const ToastContainer = ({ toasts }) => (
  <div className="ts-container">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`ts-toast ts-${t.type} ${t.leaving ? 'ts-leaving' : ''}`}
      >
        <div className="ts-icon-wrap">
          {t.type === 'success' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          )}
          {t.type === 'error' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          {t.type === 'warning' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          )}
          {t.type === 'info' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          )}
        </div>
        <span className="ts-message">{t.message}</span>
      </div>
    ))}
  </div>
);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const toastIdRef = useRef(0);

  /* ── Toast System ── */
  const showToast = useCallback((message, type = 'success', duration = 1500) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type, duration, leaving: false }]);

    // Start leave animation before removal
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    }, duration - 350);

    // Remove from DOM
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  /* ── Fetch Cart ── */
  const fetchCart = useCallback(async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/carrito/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Error fetching cart from DB:', error);
    }
  }, []);

  // Escuchar cambios en el localStorage para el usuario (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      setUser(currentUser);
    };

    window.addEventListener('storage', handleStorageChange);
    // Verificar cada vez que el componente se monta o el usuario cambia localmente
    const checkUser = setInterval(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkUser);
    };
  }, [user]);

  // Si hay usuario, cargar su carrito de la DB
  useEffect(() => {
    if (user && user.id && !user.empresa) { // Solo para clientes
      fetchCart(user.id);
    } else {
      setCart([]);
    }
  }, [user, fetchCart]);

  /* ── Add to Cart ── */
  const addToCart = async (producto) => {
    if (!user) {
      return { success: false, message: 'Debes iniciar sesión para comprar.' };
    }

    // Optimistic update — instant UI
    setCart(prev => {
      const existing = prev.find(item => item.id === producto.id);
      if (existing) {
        return prev.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        descuento: producto.descuento || 0,
        imagen: producto.imagen,
        marca: producto.marca,
        cantidad: 1,
        stock_disponible: producto.stock
      }];
    });
    showToast('Producto añadido al carrito', 'success');

    // Background sync with server
    try {
      const response = await fetch('http://localhost:8000/api/carrito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          producto_id: producto.id,
          cantidad: 1
        })
      });

      if (response.ok) {
        return { success: true };
      } else {
        const data = await response.json();
        // Rollback on failure
        await fetchCart(user.id);
        showToast(data.message || 'Error al añadir al carrito', 'error');
        return { success: false, message: data.message || 'Error al añadir al carrito.' };
      }
    } catch (error) {
      await fetchCart(user.id);
      showToast('Error de conexión con el servidor', 'error');
      return { success: false, message: 'Error de conexión con el servidor.' };
    }
  };

  /* ── Remove from Cart ── */
  const removeFromCart = async (productoId) => {
    if (!user) return { success: false };

    // Optimistic — remove instantly
    const prevCart = [...cart];
    setCart(prev => prev.filter(item => item.id !== productoId));
    showToast('Producto eliminado del carrito', 'info');

    try {
      const response = await fetch(`http://localhost:8000/api/carrito/${user.id}/${productoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        setCart(prevCart); // Rollback
        showToast('No se pudo eliminar', 'error');
        return { success: false };
      }
      return { success: true };
    } catch (error) {
      setCart(prevCart); // Rollback
      showToast('Error de conexión', 'error');
      return { success: false };
    }
  };

  /* ── Update Quantity ── */
  const updateQuantity = async (productoId, amount) => {
    if (!user) return;

    const currentItem = cart.find(item => item.id === productoId);
    if (!currentItem) return;

    const nuevaCantidad = currentItem.cantidad + amount;
    if (nuevaCantidad < 1) return;

    // Optimistic — update instantly
    const prevCart = [...cart];
    setCart(prev =>
      prev.map(item =>
        item.id === productoId ? { ...item, cantidad: nuevaCantidad } : item
      )
    );

    try {
      const response = await fetch(`http://localhost:8000/api/carrito/${user.id}/${productoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: nuevaCantidad })
      });

      if (response.ok) {
        return { success: true };
      } else {
        const data = await response.json();
        setCart(prevCart); // Rollback
        showToast(data.message || 'Stock insuficiente', 'warning');
        return { success: false, message: data.message };
      }
    } catch (error) {
      setCart(prevCart); // Rollback
      showToast('Error de red', 'error');
      return { success: false, message: 'Error de red' };
    }
  };

  /* ── Clear Cart ── */
  const clearCart = async () => {
    if (!user) return;

    // Optimistic — clear instantly
    const prevCart = [...cart];
    setCart([]);
    showToast('Carrito vaciado', 'info');

    try {
      const response = await fetch(`http://localhost:8000/api/carrito/${user.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        setCart(prevCart); // Rollback
        showToast('Error al vaciar carrito', 'error');
      }
    } catch (error) {
      setCart(prevCart); // Rollback
      showToast('Error al vaciar carrito', 'error');
    }
  };

  const uniqueItemCount = cart.length;
  const cartItemCount = cart.reduce((total, item) => total + item.cantidad, 0);
  const cartTotal = cart.reduce((total, item) => {
    const itemDiscount = item.descuento || 0;
    const discountedPrice = Number(item.precio) * (1 - itemDiscount / 100);
    return total + (discountedPrice * item.cantidad);
  }, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartItemCount,
      uniqueItemCount,
      cartTotal,
      isCartOpen,
      setIsCartOpen,
      showToast,
      user,
      refreshCart: () => user && fetchCart(user.id)
    }}>
      {children}
      <ToastContainer toasts={toasts} />
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
