import React, { useEffect, useState } from "react";
import { 
  IonContent, 
  IonPage, 
  IonIcon,
  useIonRouter,
  IonSpinner,
  IonModal,
  IonButton
} from '@ionic/react';
import { 
  arrowBackOutline, searchOutline, cubeOutline, cartOutline, logInOutline,
  laptopOutline, phonePortraitOutline, hardwareChipOutline, watchOutline
} from 'ionicons/icons';
import ProductoCard from "../components/ProductoCard";
import CartModal from "../components/CartModal";
import { useCart } from "../context/CartContext";
import './Productos.css';

const bgIcons = [laptopOutline, phonePortraitOutline, hardwareChipOutline, watchOutline];

const Productos = () => {
  const router = useIonRouter();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoria] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const { cartItemCount, setIsCartOpen } = useCart();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isProveedor = user && user.empresa !== undefined;

  // Set selected category from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) {
      setCategoria(cat);
    }
  }, []);

  const requireAuth = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setShowAuthAlert(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetch("https://tecnostore-production.up.railway.app/api/productos")
      .then(r => r.json())
      .then(data => {
        setProductos(data);
        setCategorias(["Todos", ...new Set(data.map(p => p.categoria).filter(Boolean))]);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filtrados = productos
    .filter(p => categoriaSeleccionada === "Todos" || p.categoria === categoriaSeleccionada)
    .filter(p => {
      const q = busqueda.toLowerCase().trim();
      return !q || p.nombre?.toLowerCase().includes(q) || p.marca?.toLowerCase().includes(q);
    });

  return (
    <IonPage>
      <IonContent fullscreen className="pg-ion-content">
        <div className="pg-root pg-bg">
          {/* Animated Background */}
          <div className="pg-anim-bg">
            {[...Array(14)].map((_, i) => (
              <IonIcon 
                key={i} 
                icon={bgIcons[i % bgIcons.length]} 
                className="pg-anim-icon" 
                style={{ 
                  left: `${(i * 7) + Math.random() * 3}%`, 
                  animationDuration: `${14 + Math.random() * 20}s`, 
                  animationDelay: `-${Math.random() * 15}s`,
                  fontSize: `${18 + Math.random() * 28}px`,
                  transform: `rotate(${Math.random() * 45}deg)`
                }} 
              />
            ))}
          </div>
          {/* Header */}
          <header className="pg-header">
            <div className="pg-header-inner">
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <button className="pg-back-btn" onClick={() => router.goBack()}>
                  <IonIcon icon={arrowBackOutline} />
                </button>
                <div>
                  <h1 className="pg-title">Catálogo</h1>
                  <div className="pg-stat-wrapper">
                    <span className="pg-stat">
                      <IonIcon icon={cubeOutline} style={{ fontSize: '12px' }}/>
                      {loading ? "—" : `${filtrados.length} productos`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pg-search-wrapper">
                <IonIcon icon={searchOutline} className="pg-search-icon" />
                <input
                  className="pg-search"
                  type="text"
                  placeholder="Buscar productos o marcas..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </div>

              {!isProveedor && (
                <button 
                  className="pg-cart-btn" 
                  onClick={() => {
                    if (requireAuth()) setIsCartOpen(true);
                  }}
                >
                  <IonIcon icon={cartOutline} />
                  {cartItemCount > 0 && <span className="pg-cart-badge">{cartItemCount}</span>}
                </button>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="pg-main">
            {/* Category Pills */}
            <div className="pg-pills">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`pg-pill ${categoriaSeleccionada === cat ? "pg-pill-active" : "pg-pill-inactive"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="pg-loading">
                <IonSpinner name="crescent" color="primary" />
                <span>Cargando productos...</span>
              </div>
            ) : filtrados.length > 0 ? (
              <div className="pg-grid">
                {filtrados.map((p, i) => (
                  <ProductoCard key={p.id} producto={p} index={i} onRequireAuth={requireAuth} />
                ))}
              </div>
            ) : (
              <div className="pg-empty">
                <div className="pg-empty-icon">
                  <IonIcon icon={searchOutline} style={{ fontSize: '28px' }}/>
                </div>
                <p className="pg-empty-text">
                  Sin resultados para <strong>"{busqueda || categoriaSeleccionada}"</strong>
                </p>
              </div>
            )}
          </main>
        </div>
      </IonContent>

      {/* Modal Auth Requerido */}
      <IonModal 
        isOpen={showAuthAlert} 
        onDidDismiss={() => setShowAuthAlert(false)} 
        className="logout-modal-premium center-modal login-req-modal"
        backdropDismiss={true}
      >
        <div className="lm-container login-req-container">
          <div className="lm-icon-wrapper">
            <div className="lm-icon-bg pulse-anim" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.1))', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#3b82f6', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>
              <IonIcon icon={logInOutline} className="lm-icon" />
            </div>
          </div>
          
          <h2 className="lm-title" style={{ color: '#f0f9ff' }}>Inicia Sesión</h2>
          <p className="lm-subtitle" style={{ color: 'rgba(148, 163, 184, 0.8)' }}>
            Para agregar productos a tu carrito y realizar la compra necesitas estar conectado a tu cuenta.
          </p>
          
          <div className="lm-actions">
            <button className="lm-btn lm-btn-cancel" onClick={() => setShowAuthAlert(false)}>
              Seguir explorando
            </button>
            <button className="lm-btn lm-btn-confirm" style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }} onClick={() => { setShowAuthAlert(false); setTimeout(() => router.push('/login'), 150); }}>
              Ir a iniciar sesión
              <IonIcon icon={logInOutline} style={{ marginLeft: '6px' }} />
            </button>
          </div>
        </div>
      </IonModal>

    </IonPage>
  );
};

export default Productos;
