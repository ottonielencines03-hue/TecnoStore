import React, { useState, useEffect, useRef } from "react";
import { 
  IonContent, 
  IonPage, 
  useIonRouter,
  IonModal,
  IonIcon,
  IonPopover
} from '@ionic/react';
import { 
  flashOutline, 
  cartOutline, 
  chevronDownOutline,
  personOutline, 
  listOutline, 
  logOutOutline,
  closeOutline,
  addOutline
} from 'ionicons/icons';
import { useCart } from '../context/CartContext';
import CartModal from '../components/CartModal';
import ClientSettingsModal from '../components/ClientSettingsModal';
import './PantallaInicio.css';

/* ── Datos categorías ── */
const CATS = [
  { emoji:"💻", name:"Laptops",     count:"120+", color:"#3b82f6", bg:"rgba(59,130,246,.12)"  },
  { emoji:"📱", name:"Smartphones", count:"85+",  color:"#8b5cf6", bg:"rgba(139,92,246,.12)"  },
  { emoji:"🎧", name:"Audio",       count:"64+",  color:"#f59e0b", bg:"rgba(245,158,11,.12)"  },
  { emoji:"⌚", name:"Wearables",   count:"42+",  color:"#06b6d4", bg:"rgba(6,182,212,.12)"   },
  { emoji:"🖥️", name:"Monitores",   count:"38+",  color:"#34d399", bg:"rgba(52,211,153,.12)"  },
  { emoji:"🎮", name:"Gaming",      count:"96+",  color:"#ef4444", bg:"rgba(239,68,68,.12)"   },
];

/* ── Productos featured ── */
const FEATURED = [
  { img:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80", cat:"Laptops",     name:"MacBook Pro M3",       price:"$42,999", badge:"Nuevo",  badgeColor:"#22d3ee" },
  { img:"https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&q=80", cat:"Smartphones", name:"iPhone 16 Pro Max",    price:"$35,500", badge:"Hot",    badgeColor:"#f59e0b" },
  { img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", cat:"Audio",       name:"Sony WH-1000XM5",      price:"$8,999",  badge:"Oferta", badgeColor:"#34d399" },
  { img:"https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80", cat:"Wearables",   name:"Apple Watch Ultra 2",  price:"$16,500", badge:"Nuevo",  badgeColor:"#22d3ee" },
];

const MARQUEE = ["MacBook Pro","iPhone 16","Sony XM5","Samsung S25","AirPods Pro","LG OLED","Razer Gaming","DJI Drone","iPad Pro","RTX 5090","PS5 Pro","Apple Watch Ultra"];

const PantallaInicio = () => {
  const router = useIonRouter();
  const [user, setUser] = useState(null);
  const { cartItemCount, setIsCartOpen } = useCart();
  const [popoverState, setPopoverState] = useState({ show: false, event: undefined });
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // New Data states
  const [realStats, setRealStats] = useState({ products: 0, customers: 0, providers: 0 });
  const [allProducts, setAllProducts] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const prodsTrackRef = useRef(null);
  const dealsTrackRef = useRef(null);
  const catsSectionRef = useRef(null);
  const [hoverDeals, setHoverDeals] = useState(false);
  const [hoverProds, setHoverProds] = useState(false);

  // Autoplay Effect
  useEffect(() => {
    const autoScroll = (ref, isHovered) => {
      if (!ref.current || isHovered) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      // If reached end, go back to start, else scroll slightly
      if (scrollLeft + clientWidth >= scrollWidth - 5) {
        ref.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        ref.current.scrollBy({ left: 1, behavior: 'auto' }); // Smooth continuous pixel scroll
      }
    };

    const timer = setInterval(() => {
      autoScroll(dealsTrackRef, hoverDeals);
      autoScroll(prodsTrackRef, hoverProds);
    }, 30); // Higher frequency for smooth continuous movement

    return () => clearInterval(timer);
  }, [hoverDeals, hoverProds, loading]);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) {
      router.push("/login", "back", "replace");
      return;
    }
    setUser(u);

    // Fetch Real Stats
    fetch("http://localhost:8000/api/stats")
      .then(res => res.json())
      .then(data => setRealStats(data))
      .catch(console.error);

    // Fetch Products
    fetch("http://localhost:8000/api/productos")
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // Auto-carousel timer
  useEffect(() => {
    const featured = allProducts.slice(0, 5);
    if (featured.length <= 1) return;
    
    const t = setInterval(() => {
      setCarouselIdx(prev => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(t);
  }, [allProducts]);

  const inicial = user?.name?.charAt(0).toUpperCase() ?? "?";

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.replace("/"); // Recargo duro para asegurar destrucción de estado de sesión
  };

  return (
    <IonPage>
      <IonContent fullscreen className="pi-ion-content">
        <div className="pi-wrap">
          {/* Fondo */}
          <div className="pi-hex" />
          <div className="pi-noise" />
          <div className="pi-scan" />
          <div className="pi-orb pi-orb-1" />
          <div className="pi-orb pi-orb-2" />
          <div className="pi-orb pi-orb-3" />

          {/* NAVBAR */}
          <nav className="pi-nav">
            <div className="pi-nav-logo" onClick={() => router.push("/PantallaInicio")} style={{ display:'flex', alignItems:'center', gap:'15px' }}>
              <img src="/Logo-TecnoStore.png" alt="TecnoStore Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
              <span className="pi-nav-brand">TecnoStore</span>
            </div>

            <div className="pi-nav-links">
              <button className="pi-nav-link active">Inicio</button>
              <button className="pi-nav-link" onClick={() => router.push("/productos")}>Productos</button>
              <button className="pi-nav-link" onClick={() => scrollToSection(catsSectionRef)}>Categorías</button>
              <button className="pi-nav-link" onClick={() => scrollToSection(dealsTrackRef)}>Ofertas</button>
            </div>

            <div className="pi-nav-right">
              <div className="pi-cart-btn" onClick={() => setIsCartOpen(true)}>
                <IonIcon icon={cartOutline} style={{ fontSize: '20px' }} />
                {cartItemCount > 0 && (
                  <span className="pi-cart-badge">{cartItemCount}</span>
                )}
              </div>

              <div className="pi-avatar-btn" onClick={(e) => setPopoverState({ show: true, event: e.nativeEvent })}>
                {user?.avatar ? (
                  <img src={`http://localhost:8000/avatars/${user.avatar}`} alt="Avatar" className="pi-avatar-img" />
                ) : (
                  <div className="pi-avatar">{inicial}</div>
                )}
                <span className="pi-avatar-name">{user?.name?.split(" ")[0] ?? "Usuario"}</span>
                <IonIcon icon={chevronDownOutline} style={{ color: 'rgba(148,163,184,.5)', fontSize: '14px' }} />
              </div>
            </div>
          </nav>

          {/* HERO */}
          <section className="pi-hero">
            <div className="pi-hero-left">
              <div className="pi-hero-eyebrow">
                <span className="pi-eyebrow-dot" />
                Nuevas ofertas cada semana
              </div>

              <h1 className="pi-hero-title">
                La tecnología<br /><span className="gr">que necesitas</span>
              </h1>

              <p className="pi-hero-sub">
                Descubre los últimos productos en tecnología con los mejores precios del mercado{user ? ", envío express y garantía oficial." : "."}
              </p>

              <div className="pi-hero-btns">
                <button className="pi-btn-primary" onClick={() => router.push("/productos")}>
                  Explorar productos <img src="/Logo-TecnoStore.png" alt="Logo" style={{ width: '28px', height: '28px', marginLeft: '10px' }}/>
                </button>
                <button className="pi-btn-ghost" onClick={() => scrollToSection(dealsTrackRef)}>
                  Ver ofertas
                </button>
              </div>

              <div className="pi-hero-stats">
                {[
                  { n: `${realStats.products}+`, l: "Productos" },
                  { n: `${realStats.customers}+`, l: "Clientes" },
                  { n: "4.9★", l: "Rating" }
                ].map(({ n, l }) => (
                  <div key={l} className="pi-stat-item">
                    <div className="pi-stat-num">{n}</div>
                    <div className="pi-stat-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pi-hero-img-wrap">
              <div className="pi-hero-carousel">
                {allProducts.length > 0 ? (
                  allProducts.slice(0, 5).map((p, i) => (
                    <div 
                      key={p.id} 
                      className={`pi-carousel-slide ${i === carouselIdx ? 'active' : ''}`}
                    >
                      <img src={`http://localhost:8000/productos/${p.imagen}`} alt={p.nombre} />
                      <div className="pi-carousel-info">
                        <h3 className="pi-info-name">{p.nombre}</h3>
                        <p className="pi-info-price">
                          {Number(p.precio).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="pi-hero-img">
                    <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85" alt="Loading" />
                  </div>
                )}
                
                {/* Carousel dots */}
                <div className="pi-carousel-dots">
                  {allProducts.slice(0, 5).map((_, i) => (
                    <div 
                      key={i} 
                      className={`pi-dot ${i === carouselIdx ? 'active' : ''}`} 
                      onClick={() => setCarouselIdx(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* MARQUEE */}
          <div className="pi-marquee">
            <div className="pi-marquee-track">
              {[...MARQUEE, ...MARQUEE].map((item, i) => (
                <div key={i} className="pi-marquee-item">
                  {item}<span className="pi-mq-dot" />
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORÍAS */}
          <section className="pi-section" ref={catsSectionRef}>
            <p className="pi-section-eye">Explorar</p>
            <h2 className="pi-section-title">Categorías <em>populares</em></h2>
            <div className="pi-cats-grid">
              {CATS.map(({ emoji, name, count, color, bg }) => (
                <div key={name} className="pi-cat-card" onClick={() => router.push(`/productos?category=${encodeURIComponent(name)}`)}>
                  <div className="pi-cat-ico" style={{ background:bg, border:`1px solid ${color}30` }}>{emoji}</div>
                  <p className="pi-cat-name">{name}</p>
                  <p className="pi-cat-count">{count} items</p>
                </div>
              ))}
            </div>
          </section>

          {/* SUPER DEALS - CAROUSEL */}
          {allProducts.some(p => p.descuento > 0) && (
            <section className="pi-section pi-deals-section">
              <div className="pi-deals-bg" />
              <div className="pi-section-header">
                <div>
                  <p className="pi-section-eye" style={{ color: '#ef4444' }}>Hot Sale</p>
                  <h2 className="pi-section-title">Super <em>Ofertas</em></h2>
                </div>
              </div>

              <div 
                className="pi-prods-track-container" 
                ref={dealsTrackRef}
                onMouseEnter={() => setHoverDeals(true)}
                onMouseLeave={() => setHoverDeals(false)}
              >
                <div className="pi-prods-track">
                  {allProducts.filter(p => p.descuento > 0).map((p, i) => {
                    const discountedPrice = p.precio * (1 - p.descuento / 100);
                    return (
                      <div key={i} className="pi-feat-card pi-carousel-card" onClick={() => router.push("/productos")}>
                        <div className="pi-feat-img">
                          <img src={`http://localhost:8000/productos/${p.imagen}`} alt={p.nombre} loading="lazy" />
                          <div className="pi-feat-img-overlay" />
                          <span className="pi-feat-badge" style={{ background: '#ef4444', border: '1px solid #fecaca', color: '#fff', fontWeight: 800 }}>
                            -{p.descuento}% OFF
                          </span>
                        </div>
                        <div className="pi-feat-body">
                          <p className="pi-feat-name">{p.nombre}</p>
                          <div className="pi-feat-footer">
                            <div>
                              <span className="pi-feat-price-old">
                                {Number(p.precio).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}
                              </span>
                              <span className="pi-feat-price" style={{ color: '#ef4444' }}>
                                {Number(discountedPrice).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}
                              </span>
                            </div>
                            <button className="pi-feat-add">
                              <IonIcon icon={addOutline} style={{ fontSize: '20px' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* FEATURED CAROUSEL */}
          <section className="pi-section pi-prods-carousel-section">
            <div className="pi-section-header">
              <div>
                <p className="pi-section-eye">Catálogo Pro</p>
                <h2 className="pi-section-title">Productos <em>premium</em></h2>
              </div>
            </div>

            <div 
              className="pi-prods-track-container" 
              ref={prodsTrackRef}
              onMouseEnter={() => setHoverProds(true)}
              onMouseLeave={() => setHoverProds(false)}
            >
              <div className="pi-prods-track">
                {loading ? (
                  Array(6).fill(0).map((_, i) => <div key={i} className="pi-feat-skeleton" style={{ minWidth: 280 }} />)
                ) : (
                  allProducts.map((p, i) => (
                    <div key={i} className="pi-feat-card pi-carousel-card" onClick={() => router.push("/productos")}>
                      <div className="pi-feat-img">
                        <img src={`http://localhost:8000/productos/${p.imagen}`} alt={p.nombre} loading="lazy" />
                        <div className="pi-feat-img-overlay" />
                        {p.descuento > 0 && (
                           <span className="pi-feat-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
                             -{p.descuento}%
                           </span>
                        )}
                      </div>
                      <div className="pi-feat-body">
                        <p className="pi-feat-name">{p.nombre}</p>
                        <div className="pi-feat-footer">
                          <span className="pi-feat-price">
                            {Number(p.precio * (1 - (p.descuento || 0) / 100)).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}
                          </span>
                          <button className="pi-feat-add">
                            <IonIcon icon={addOutline} style={{ fontSize: '20px' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ textAlign:"center", marginTop: 48 }}>
              <button className="pi-btn-ghost" onClick={() => router.push("/productos")}>
                Ver catálogo completo →
              </button>
            </div>
          </section>
        </div>

        {/* Ionic Overlays */}
        {/* Menú Avartar Premium (Popover) */}
        <IonPopover
          isOpen={popoverState.show}
          event={popoverState.event}
          onDidDismiss={() => setPopoverState({ show: false, event: undefined })}
          className="user-menu-popover"
          alignment="end"
          side="bottom"
          keyboardClose={false}
        >
          <div className="ump-container">
            <div className="ump-header">
              <span className="ump-name">{user?.name ?? 'Usuario'}</span>
              <span className="ump-email">{user?.email ?? ''}</span>
            </div>
            
            <div className="ump-divider" />
            
            <div className="ump-actions">
              <button 
                className="ump-btn" 
                onClick={() => { setPopoverState({ show: false }); setShowProfileModal(true); }}
              >
                <div className="ump-btn-icon"><IonIcon icon={personOutline} /></div>
                <span>Mi perfil</span>
              </button>
              
              <button 
                className="ump-btn" 
                onClick={() => { setPopoverState({ show: false }); router.push('/productos'); }}
              >
                <div className="ump-btn-icon"><IonIcon icon={listOutline} /></div>
                <span>Ir al catálogo</span>
              </button>
            </div>
            
            <div className="ump-divider" />
            
            <div className="ump-actions">
              <button 
                className="ump-btn ump-danger" 
                onClick={() => { setPopoverState({ show: false }); setShowLogoutAlert(true); }}
              >
                <div className="ump-btn-icon"><IonIcon icon={logOutOutline} /></div>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </IonPopover>

        {/* Modal Confirmación Logout Premium Centrado */}
        <IonModal 
          isOpen={showLogoutAlert} 
          onDidDismiss={() => setShowLogoutAlert(false)} 
          className="logout-modal-premium center-modal"
          backdropDismiss={true}
        >
          <div className="lm-container">
            <div className="lm-icon-wrapper">
              <div className="lm-icon-bg pulse-anim">
                <IonIcon icon={logOutOutline} className="lm-icon" />
              </div>
            </div>
            
            <h2 className="lm-title">¿Cerrar sesión?</h2>
            <p className="lm-subtitle">
              Estás a punto de salir de tu cuenta personal. Tendrás que ingresar tus credenciales nuevamente para acceder.
            </p>
            
            <div className="lm-actions">
              <button className="lm-btn lm-btn-cancel" onClick={() => setShowLogoutAlert(false)}>
                Mejor me quedo
              </button>
              <button className="lm-btn lm-btn-confirm" onClick={handleLogout}>
                Sí, salir
                <IonIcon icon={logOutOutline} style={{ marginLeft: '6px' }} />
              </button>
            </div>
          </div>
        </IonModal>

        {/* Client Settings Modal */}
        <ClientSettingsModal 
          isOpen={showProfileModal} 
          onDismiss={() => setShowProfileModal(false)} 
          user={user}
          onUpdateUser={(updatedUser) => setUser(updatedUser)}
        />


      </IonContent>
    </IonPage>
  );
};

export default PantallaInicio;
