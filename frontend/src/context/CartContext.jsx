import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { checkmarkCircleOutline, alertCircleOutline, trashOutline, bagHandleOutline, callOutline, chatbubblesOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Duración de 3 segundos
  }, []);

  // Cargar carrito desde la base de datos si el usuario está logueado
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

  const addToCart = async (producto) => {
    if (!user) {
      return { success: false, message: 'Debes iniciar sesión para comprar.' };
    }

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

      const data = await response.json();

      if (response.ok) {
        await fetchCart(user.id); // Recargar carrito desde DB
        return { success: true, message: 'Producto añadido correctamente.' };
      } else {
        return { success: false, message: data.message || 'Error al añadir al carrito.' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión con el servidor.' };
    }
  };

  const removeFromCart = async (productoId) => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:8000/api/carrito/${user.id}/${productoId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchCart(user.id);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productoId, amount) => {
    if (!user) return;

    const currentItem = cart.find(item => item.id === productoId);
    if (!currentItem) return;

    const nuevaCantidad = currentItem.cantidad + amount;
    if (nuevaCantidad < 1) return;

    try {
      const response = await fetch(`http://localhost:8000/api/carrito/${user.id}/${productoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: nuevaCantidad })
      });

      if (response.ok) {
        fetchCart(user.id);
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Error de red' };
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:8000/api/carrito/${user.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setCart([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const cartItemCount = cart.reduce((total, item) => total + item.cantidad, 0);
  const cartTotal = cart.reduce((total, item) => total + (Number(item.precio) * item.cantidad), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartItemCount,
      cartTotal,
      refreshCart: () => user && fetchCart(user.id)
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
