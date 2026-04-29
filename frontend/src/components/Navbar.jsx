import React, { useEffect, useState } from 'react';
import { IonIcon, useIonRouter } from '@ionic/react';
import { chevronDownOutline, cartOutline, personOutline, logOutOutline } from 'ionicons/icons';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const router = useIonRouter();
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);

  const { cartItemCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u);
    fetch('https://tecnostore-production.up.railway.app/api/categorias')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  const handleCategoryClick = (cat) => {
    router.push(`/productos?category=${encodeURIComponent(cat)}`);
    setShowDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.replace('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => router.push('/PantallaInicio')}>
        <img src="/Logo-TecnoStore.png" alt="TecnoStore Logo" className="navbar-logo-img" />
        <span className="navbar-brand">TecnoStore</span>
      </div>
      <div className="navbar-links">
        <button className="nav-link active">Inicio</button>
        <button className="nav-link" onClick={() => router.push('/productos')}>Productos</button>
        <div className="nav-link dropdown" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
          <button className="dropdown-toggle">
            Categorías <IonIcon icon={chevronDownOutline} className="dropdown-icon" />
          </button>
          {showDropdown && (
            <ul className="dropdown-menu">
              {categories.map(cat => (
                <li key={cat} onClick={() => handleCategoryClick(cat)} className="dropdown-item">{cat}</li>
              ))}
            </ul>
          )}
        </div>
        <button className="nav-link" onClick={() => router.push('/productos')}>Ofertas</button>
      </div>
      <div className="navbar-right">
        <div className="cart-btn" onClick={() => setIsCartOpen(true)}>
          <IonIcon icon={cartOutline} />
          {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
        </div>
        
        {user ? (
          <div className="avatar-btn" onClick={() => router.push('/perfil-proveedor')}>
            {user.avatar ? (
              <img src={`https://tecnostore-production.up.railway.app/avatars/${user.avatar}`} alt="Avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">{user.name?.charAt(0).toUpperCase() ?? '?'}</div>
            )}
            <span className="avatar-name">{user.name?.split(' ')[0] ?? 'Usuario'}</span>
          </div>
        ) : (
          <button className="login-btn" onClick={() => router.push('/login')}>Iniciar sesión</button>
        )}
        <button className="logout-btn" onClick={handleLogout}>Salir</button>
      </div>
    </nav>
  );
};

export default Navbar;
