import React, { useState, useEffect, useRef } from "react";
import { IonContent, IonPage, IonIcon, useIonRouter } from '@ionic/react';
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
  { id:1, img:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80", cat:"Laptops", name:"MacBook Pro M3", price:"$42,999", badge:"Nuevo", badgeColor:"#22d3ee" },
  { id:2, img:"https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&q=80", cat:"Smartphones", name:"iPhone 16 Pro Max", price:"$35,500", badge:"Hot", badgeColor:"#f59e0b" },
  { id:3, img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", cat:"Audio", name:"Sony WH-1000XM5", price:"$8,999", badge:"Oferta", badgeColor:"#34d399" },
  { id:4, img:"https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80", cat:"Wearables", name:"Apple Watch Ultra 2", price:"$16,500", badge:"Nuevo", badgeColor:"#22d3ee" },
  { id:5, img:"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80", cat:"Laptops", name:"Dell XPS 15 OLED", price:"$38,000", badge:"Top", badgeColor:"#818cf8" },
  { id:6, img:"https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=600&q=80", cat:"Audio", name:"AirPods Pro 2da Gen", price:"$6,499", badge:"Oferta", badgeColor:"#34d399" },
  { id:7, img:"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80", cat:"Gaming", name:"Razer BlackWidow V4", price:"$4,299", badge:"Hot", badgeColor:"#f59e0b" },
];

const MARQUEE_ITEMS = ["MacBook Pro","iPhone 16","Sony WH-1000XM5","Samsung Galaxy S25","AirPods Pro","LG OLED","Razer Gaming","DJI Drone","iPad Pro","RTX 5090","PS5 Pro","Meta Quest 3","Apple Watch Ultra"];

const FEATURES = [
  { icon: shieldCheckmarkOutline, color:"#3b82f6", title:"Pagos Blindados", desc:"Cifrado SSL y autenticación de dos factores en cada transacción." },
  { icon: flashOutline, color:"#06b6d4", title:"Tech de Punta", desc:"Los últimos lanzamientos disponibles antes que en cualquier otra tienda." },
  { icon: rocketOutline, color:"#34d399", title:"Envío Express", desc:"24-48h con rastreo en tiempo real directo desde tu dashboard." },
  { icon: heartOutline, color:"#f59e0b", title:"Garantía Oficial", desc:"Todos los productos con garantía del fabricante y soporte dedicado." },
  { icon: peopleOutline, color:"#818cf8", title:"Red de Proveedores", desc:"Más de 340 vendedores verificados compitiendo por el mejor precio." },
  { icon: chatbubblesOutline, color:"#f472b6", title:"Soporte 24/7", desc:"Chat en vivo, email y teléfono disponibles toda la semana." },
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
const PCard = ({ p }) => {
  const [added, setAdded] = useState(false);
  return (
    <div className="ld-pcard">
      <div className="ld-pcard-img">
        <img src={p.img} alt={p.name} loading="lazy" />
        <div className="ld-pcard-img-overlay" />
        <span className="ld-pcard-badge" style={{ background: `${p.badgeColor}22`, border: `1px solid ${p.badgeColor}44`, color: p.badgeColor }}>
          {p.badge}
        </span>
      </div>
      <div className="ld-pcard-body">
        <p className="ld-pcard-cat">{p.cat}</p>
        <p className="ld-pcard-name">{p.name}</p>
        <div className="ld-pcard-footer">
          <span className="ld-pcard-price">{p.price}</span>
          <button
            className="ld-pcard-add"
            onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 700); }}
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
  const [heroImg, setHeroImg] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHeroImg(i => (i + 1) % PRODUCTOS.length), 3500);
    return () => clearInterval(t);
  }, []);

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
            <div className="ld-nav-logo">
              <div className="ld-nav-logo-mark">
                <IonIcon icon={flashOutline} style={{ fontSize: '18px' }} />
              </div>
              TecnoStore
            </div>
            <div className="ld-nav-links">
              <button className="ld-nav-link" onClick={() => router.push("/productos")}>Catálogo</button>
              <button className="ld-nav-link" onClick={() => router.push("/login")}>Iniciar sesión</button>
              <button className="ld-nav-btn" onClick={() => router.push("/login")}>
                Registrarse →
              </button>
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
                {[{to:12400,s:"+",l:"Productos"},{to:8200,s:"+",l:"Clientes"},{to:340,s:"+",l:"Proveedores"},{to:99,s:"%",l:"Satisfacción"}].map(({to,s,l}) => (
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
                  <img src={PRODUCTOS[heroImg].img} alt={PRODUCTOS[heroImg].name} key={heroImg} className="ld-mockup-img" />
                  <div className="ld-mockup-bar">
                    <div>
                      <div className="ld-mockup-tag">{PRODUCTOS[heroImg].cat}</div>
                      <div className="ld-mockup-name">{PRODUCTOS[heroImg].name}</div>
                    </div>
                    <div className="ld-mockup-price">{PRODUCTOS[heroImg].price}</div>
                  </div>
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
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
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
              {PRODUCTOS.map((p) => <PCard key={p.id} p={p} />)}
            </div>
            <div style={{ textAlign:"center", marginTop: 48 }}>
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
              {FEATURES.map(f => (
                <div key={f.title} className="ld-feat-card">
                  <div className="ld-feat-ico" style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                    <IonIcon icon={f.icon} style={{ color: f.color, fontSize: '22px' }} />
                  </div>
                  <p className="ld-feat-title">{f.title}</p>
                  <p className="ld-feat-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER CTA */}
          <section className="ld-footer-section">
            <p className="ld-footer-eyebrow">Únete hoy</p>
            <h2 className="ld-footer-title">La tecnología del futuro<br /><span className="grad">está aquí ahora</span></h2>
            <p className="ld-footer-sub">Crea tu cuenta gratis y empieza a comprar o vender hoy mismo.</p>
            <div className="ld-footer-btns">
              <button className="ld-btn-main" onClick={() => router.push("/login")}>
                Crear cuenta gratis →
              </button>
              <button className="ld-btn-ghost" onClick={() => router.push("/login")}>
                Soy proveedor
              </button>
            </div>
            <p className="ld-footer-copy">© 2026 TecnoStore · Hecho en México 🇲🇽</p>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Landing;
