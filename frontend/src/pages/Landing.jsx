import React, { useState, useEffect, useRef } from "react";
import { IonContent, IonPage, IonIcon, useIonRouter, useIonAlert } from '@ionic/react';
import { useCart } from '../context/CartContext';
import {
  flashOutline,
  shieldCheckmarkOutline,
  rocketOutline,
  heartOutline,
  peopleOutline,
  chatbubblesOutline,
  addOutline,
  checkmarkOutline
} from 'ionicons/icons';
import './Landing.css';

const PRODUCTOS = [
  { id: 1, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80", cat: "Laptops", name: "MacBook Pro M3", price: "$42,999", badge: "Nuevo", badgeColor: "#22d3ee" },
  { id: 2, img: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&q=80", cat: "Smartphones", name: "iPhone 16 Pro Max", price: "$35,500", badge: "Hot", badgeColor: "#f59e0b" },
  { id: 3, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", cat: "Audio", name: "Sony WH-1000XM5", price: "$8,999", badge: "Oferta", badgeColor: "#34d399" },
  { id: 4, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80", cat: "Wearables", name: "Apple Watch Ultra 2", price: "$16,500", badge: "Nuevo", badgeColor: "#22d3ee" },
  { id: 5, img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80", cat: "Laptops", name: "Dell XPS 15 OLED", price: "$38,000", badge: "Top", badgeColor: "#818cf8" },
  { id: 6, img: "https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=600&q=80", cat: "Audio", name: "AirPods Pro 2da Gen", price: "$6,499", badge: "Oferta", badgeColor: "#34d399" },
  { id: 7, img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80", cat: "Gaming", name: "Razer BlackWidow V4", price: "$4,299", badge: "Hot", badgeColor: "#f59e0b" },
];

const MARQUEE_ITEMS = ["MacBook Pro", "iPhone 16", "Sony WH-1000XM5", "Samsung Galaxy S25", "AirPods Pro", "LG OLED", "Razer Gaming", "DJI Drone", "iPad Pro", "RTX 5090", "PS5 Pro", "Meta Quest 3", "Apple Watch Ultra"];

const FEATURES = [
  { icon: shieldCheckmarkOutline, color: "#3b82f6", title: "Pagos Blindados", desc: "Cifrado SSL y autenticación de dos factores en cada transacción." },
  { icon: flashOutline, color: "#06b6d4", title: "Tech de Punta", desc: "Los últimos lanzamientos disponibles antes que en cualquier otra tienda." },
  { icon: peopleOutline, color: "#818cf8", title: "Red de Proveedores", desc: "Más de 340 vendedores verificados compitiendo por el mejor precio." },
  { icon: chatbubblesOutline, color: "#f472b6", title: "Soporte 24/7", desc: "Chat en vivo, email y teléfono disponibles toda la semana." },
];

/* Counter component */
const Counter = ({ to, suffix = "" }) => {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let n = 0; const s = to / 60;
      const t = setInterval(() => { n += s; if (n >= to) { setV(to); clearInterval(t); } else setV(Math.floor(n)); }, 18);
      obs.disconnect();
    }, { threshold: .5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
};

/* Product Card */
const PCard = ({ p, idx, user, onRequireAuth }) => {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setIsVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const price = Number(p.precio || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  });

  return (
    <div
      className={`ld-pcard ${isVisible ? 'reveal' : ''}`}
      ref={ref}
      style={{ transitionDelay: `${idx * 0.1}s` }}
    >
      <div className="ld-pcard-img">
        {p.imagen ? (
          <img src={`https://tecnostore-production.up.railway.app/productos/${p.imagen}`} alt={p.nombre} loading="lazy" />
        ) : (
          <div className="ld-pcard-placeholder">
            <img src="/Logo-TecnoStore.png" alt="TecnoStore Logo" style={{ width: '50px', height: '50px', opacity: 0.4 }} />
          </div>
        )}
        <div className="ld-pcard-img-overlay" />
        {p.categoria && (
          <span className="ld-pcard-badge">
            {p.categoria}
          </span>
        )}
      </div>
      <div className="ld-pcard-body">
        <p className="ld-pcard-cat">{p.marca || "Premium"}</p>
        <p className="ld-pcard-name">{p.nombre}</p>
        <div className="ld-pcard-footer">
          <span className="ld-pcard-price">{price}</span>
          <button
            className="ld-pcard-add"
            onClick={async (e) => {
              e.stopPropagation();
              if (!user) {
                onRequireAuth();
                return;
              }
              const res = await addToCart(p);
              if (res.success) {
                setAdded(true);
                setTimeout(() => setAdded(false), 700);
              }
            }}
          >
            <IonIcon icon={added ? checkmarkOutline : addOutline} style={{ fontSize: '18px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const router = useIonRouter();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [heroImg, setHeroImg] = useState(0);
  const [stats, setStats] = useState({ products: 0, customers: 0, providers: 0, satisfaction: 99 });
  const [realProducts, setRealProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (u) setUser(u);

    // Fetch stats
    fetch("https://tecnostore-production.up.railway.app/api/stats")
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);

    // Fetch real products
    fetch("https://tecnostore-production.up.railway.app/api/productos")
      .then(res => res.json())
      .then(data => {
        setRealProducts(data.slice(0, 8)); // Display first 8 products
        // Extract unique categories
        const cats = [...new Set(data.map(p => p.categoria))].filter(Boolean);
        setCategories(cats.length > 0 ? cats : ["Computadoras", "Audio", "Visual", "Telefonos", "Gaming"]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });

    const t = setInterval(() => {
      setHeroImg(i => (realProducts.length > 0 ? (i + 1) % realProducts.length : 0));
    }, 4500);
    return () => clearInterval(t);
  }, [realProducts.length]);

  const goToDashboard = () => {
    if (!user) return;
    if (user.empresa) router.push("/proveedor");
    else router.push("/PantallaInicio");
  };

  const handleRequireAuth = () => {
    setShowAuthModal(true);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ld-ion-content">
        <div className="ld-root">
          <div className="ld-hex-grid" />
          <div className="ld-scan" />
          <div className="ld-noise" />
          <div className="ld-orb ld-orb-1" />
          <div className="ld-orb ld-orb-2" />
          <div className="ld-orb ld-orb-3" />

          {/* NAVBAR */}
          <nav className="ld-nav">
            <div className="ld-nav-logo" style={{ gap: '15px', height: '100%', display: 'flex', alignItems: 'center' }}>
              <img src="/Logo-TecnoStore.png" alt="TecnoStore Logo" style={{ width: '110px', height: '110px', objectFit: 'contain' }} />
              <span>TecnoStore</span>
            </div>
            <div className="ld-nav-links">
              <button className="ld-nav-link" onClick={() => router.push("/productos")}>Catálogo</button>
              {user ? (
                <button className="ld-nav-btn" onClick={goToDashboard}>
                  {user.empresa ? "Mi Tablero →" : "Mi Cuenta →"}
                </button>
              ) : (
                <>
                  <button className="ld-nav-link" onClick={() => router.push("/login")}>Iniciar sesión</button>
                  <button className="ld-nav-btn" onClick={() => router.push("/login")}>
                    Registrarse →
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* HERO */}
          <section className="ld-hero">
            <div className="ld-hero-left">
              <div className="ld-hero-eyebrow">
                <span className="ld-hero-eyebrow-dot" />
                Marketplace de tecnología · México
              </div>

              <h1 className="ld-hero-title">
                <span className="grad">Compra</span><br />
                <span className="outline">tecnología</span><br />
                sin límites
              </h1>

              <p className="ld-hero-sub">
                El marketplace más completo de México para comprar y vender tecnología de forma rápida, segura y con los mejores precios.
              </p>

              <div className="ld-hero-actions">
                <button className="ld-btn-main" onClick={() => router.push("/login")}>
                  Empezar ahora →
                </button>
                <button className="ld-btn-ghost" onClick={() => router.push("/productos")}>
                  Ver productos
                </button>
              </div>

              <div className="ld-hero-stats">
                {[
                  { to: stats.products, s: "+", l: "Productos" },
                  { to: stats.customers, s: "+", l: "Clientes" },
                  { to: stats.providers, s: "+", l: "Proveedores" },
                  { to: stats.satisfaction, s: "%", l: "Satisfacción" }
                ].map(({ to, s, l }) => (
                  <div key={l} className="ld-stat-item">
                    <div className="ld-stat-num"><Counter to={to} suffix={s} /></div>
                    <div className="ld-stat-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Mockup */}
            <div className="ld-hero-right">
              <div className="ld-mockup-wrap">
                <div className="ld-mockup">
                  {realProducts.length > 0 ? (
                    <>
                      <img
                        src={`https://tecnostore-production.up.railway.app/productos/${realProducts[heroImg].imagen}`}
                        alt={realProducts[heroImg].nombre}
                        key={heroImg}
                        className="ld-mockup-img"
                      />
                      <div className="ld-mockup-bar">
                        <div>
                          <div className="ld-mockup-tag">{realProducts[heroImg].categoria}</div>
                          <div className="ld-mockup-name">{realProducts[heroImg].nombre}</div>
                        </div>
                        <div className="ld-mockup-price">
                          {Number(realProducts[heroImg].precio).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="ld-mockup-loading">
                      <img src="/Logo-TecnoStore.png" alt="Loading" className="ld-loading-pulse" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>

                <div className="ld-chip ld-chip-1">
                  <div className="ld-chip-label">Envío express</div>
                  <div className="ld-chip-value">24 horas</div>
                </div>
                <div className="ld-chip ld-chip-2">
                  <div className="ld-chip-label">Garantía</div>
                  <div className="ld-chip-value">1 año ✓</div>
                </div>
              </div>
            </div>
          </section>

          {/* MARQUEE */}
          <div className="ld-marquee-section">
            <div className="ld-marquee-track">
              {[...categories, ...categories, ...categories].map((item, i) => (
                <div key={i} className="ld-marquee-item">
                  {item}<span className="ld-marquee-sep" />
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCTOS */}
          <section className="ld-prods-section">
            <p className="ld-section-eyebrow">Catálogo destacado</p>
            <h2 className="ld-section-title">Productos <em>premium</em><br />al mejor precio</h2>
            <div className="ld-prods-grid">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="ld-pcard-skeleton" />
                ))
              ) : (
                realProducts.map((p, idx) => (
                  <PCard
                    key={p.id}
                    p={p}
                    idx={idx}
                    user={user}
                    onRequireAuth={handleRequireAuth}
                  />
                ))
              )}
            </div>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <button className="ld-btn-ghost" onClick={() => router.push("/productos")}>
                Ver catálogo completo →
              </button>
            </div>
          </section>

          {/* FEATURES */}
          <section className="ld-feat-section">
            <p className="ld-section-eyebrow">¿Por qué TecnoStore?</p>
            <h2 className="ld-section-title">Todo lo que necesitas,<br />en <em>un solo lugar</em></h2>
            <div className="ld-feat-grid">
              {FEATURES.map(f => {
                const featClass = `feat-${f.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s\/]+/g, '-')}`;
                return (
                  <div key={f.title} className={`ld-feat-card ${featClass}`}>
                    <div className="ld-feat-ico" style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                      <IonIcon icon={f.icon} style={{ color: f.color, fontSize: '22px' }} className="ld-feat-ion" />
                    </div>
                    <p className="ld-feat-title">{f.title}</p>
                    <p className="ld-feat-desc">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FOOTER CTA */}
          <section className="ld-footer-section">
            <p className="ld-footer-eyebrow">Únete hoy</p>
            <h2 className="ld-footer-title">La tecnología del futuro<br /><span className="grad">está aquí ahora</span></h2>
            <p className="ld-footer-sub">Crea tu cuenta gratis y empieza a comprar o vender hoy mismo.</p>
            <div className="ld-footer-btns">
              <button className="ld-btn-main" onClick={() => router.push("/login")}>
                Crear cuenta
              </button>
              <button className="ld-btn-ghost" onClick={() => router.push("/login?role=proveedor")}>
                Soy proveedor
              </button>
            </div>
            <p className="ld-footer-copy">© 2026 TecnoStore · Hecho en México 🇲🇽</p>
          </section>

          {/* CUSTOM AUTH MODAL */}
          {showAuthModal && (
            <div className="ld-modal-overlay" onClick={() => setShowAuthModal(false)}>
              <div className="ld-modal-box" onClick={e => e.stopPropagation()}>
                <div className="ld-modal-glow" />
                <button className="ld-modal-close-btn" onClick={() => setShowAuthModal(false)}>
                  <IonIcon icon={checkmarkOutline} style={{ transform: 'rotate(45deg)' }} />
                </button>

                <div className="ld-modal-icon-wrap">
                  <div className="ld-modal-icon-ring" />
                  <IonIcon icon={shieldCheckmarkOutline} className="ld-modal-icon" />
                </div>

                <h2 className="ld-modal-title">Acceso Requerido</h2>
                <p className="ld-modal-text">
                  Para llevar la mejor tecnología a tu casa, necesitamos saber quién eres.
                  Inicia sesión como <strong>cliente</strong> para comenzar tu compra.
                </p>

                <div className="ld-modal-actions">
                  <button className="ld-modal-btn-primary" onClick={() => router.push('/login')}>
                    Ir al inicio de sesión
                    <img src="/Logo-TecnoStore.png" alt="Logo" style={{ width: '32px', height: '32px', marginLeft: '10px' }} />
                  </button>
                  <button className="ld-modal-btn-ghost" onClick={() => setShowAuthModal(false)}>
                    Explorar un poco más
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Landing;
