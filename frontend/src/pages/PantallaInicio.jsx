import React, { useState, useEffect, useRef } from "react";
import { 
  IonContent, 
  IonPage, 
  useIonRouter,
  IonActionSheet,
  IonAlert,
  IonModal,
  IonButton,
  IonIcon
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
  
  // Ionic Overlays states
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    setUser(u);
  }, []);

  const inicial = user?.name?.charAt(0).toUpperCase() ?? "?";

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/", "back", "replace");
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
            <div className="pi-nav-logo" onClick={() => router.push("/PantallaInicio")}>
              <div className="pi-nav-logomark">
                <IonIcon icon={flashOutline} style={{ fontSize: '20px' }} />
              </div>
              <span className="pi-nav-brand">TecnoStore</span>
            </div>

            <div className="pi-nav-links">
              <button className="pi-nav-link active">Inicio</button>
              <button className="pi-nav-link" onClick={() => router.push("/productos")}>Productos</button>
              <button className="pi-nav-link">Categorías</button>
              <button className="pi-nav-link">Ofertas</button>
            </div>

            <div className="pi-nav-right">
              <div className="pi-cart-btn">
                <IonIcon icon={cartOutline} style={{ fontSize: '20px' }} />
                <span className="pi-cart-badge">0</span>
              </div>

              <div className="pi-avatar-btn" onClick={() => setShowActionSheet(true)}>
                <div className="pi-avatar">{inicial}</div>
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
                Descubre los últimos productos en tecnología con los mejores precios del mercado, envío express y garantía oficial.
              </p>

              <div className="pi-hero-btns">
                <button className="pi-btn-primary" onClick={() => router.push("/productos")}>
                  Explorar productos <IonIcon icon={flashOutline} style={{ marginLeft: '8px' }}/>
                </button>
                <button className="pi-btn-ghost">
                  Ver ofertas
                </button>
              </div>

              <div className="pi-hero-stats">
                {[{n:"500+",l:"Productos"},{n:"50k+",l:"Clientes"},{n:"4.9★",l:"Rating"}].map(({ n, l }) => (
                  <div key={l} className="pi-stat-item">
                    <div className="pi-stat-num">{n}</div>
                    <div className="pi-stat-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pi-hero-img-wrap">
              <div className="pi-hero-img">
                <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85" alt="MacBook" />
              </div>

              <div className="pi-chip pi-chip-1">
                <div className="pi-chip-lbl">Envío gratis</div>
                <div className="pi-chip-val">En compras +$500 🚀</div>
              </div>

              <div className="pi-chip pi-chip-2">
                <div className="pi-chip-lbl">Garantía</div>
                <div className="pi-chip-val" style={{ color:"#34d399" }}>1 año ✓</div>
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
          <section className="pi-section">
            <p className="pi-section-eye">Explorar</p>
            <h2 className="pi-section-title">Categorías <em>populares</em></h2>
            <div className="pi-cats-grid">
              {CATS.map(({ emoji, name, count, color, bg }) => (
                <div key={name} className="pi-cat-card" onClick={() => router.push("/productos")}>
                  <div className="pi-cat-ico" style={{ background:bg, border:`1px solid ${color}30` }}>{emoji}</div>
                  <p className="pi-cat-name">{name}</p>
                  <p className="pi-cat-count">{count} items</p>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURED */}
          <section className="pi-section">
            <p className="pi-section-eye">Destacados</p>
            <h2 className="pi-section-title">Productos <em>premium</em></h2>
            <div className="pi-feat-grid">
              {FEATURED.map((p, i) => (
                <div key={i} className="pi-feat-card" onClick={() => router.push("/productos")}>
                  <div className="pi-feat-img">
                    <img src={p.img} alt={p.name} loading="lazy" />
                    <div className="pi-feat-img-overlay" />
                    <span className="pi-feat-badge" style={{ background:`${p.badgeColor}22`, border:`1px solid ${p.badgeColor}44`, color:p.badgeColor }}>
                      {p.badge}
                    </span>
                  </div>
                  <div className="pi-feat-body">
                    <p className="pi-feat-cat">{p.cat}</p>
                    <p className="pi-feat-name">{p.name}</p>
                    <div className="pi-feat-footer">
                      <span className="pi-feat-price">{p.price}</span>
                      <button className="pi-feat-add">
                        <IonIcon icon={addOutline} style={{ fontSize: '20px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign:"center", marginTop: 40 }}>
              <button className="pi-btn-ghost" onClick={() => router.push("/productos")}>
                Ver catálogo completo →
              </button>
            </div>
          </section>
        </div>

        {/* Ionic Overlays */}
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header={`${user?.name ?? 'Usuario'} - ${user?.email ?? ''}`}
          buttons={[
            {
              text: 'Ver perfil',
              icon: personOutline,
              handler: () => setShowProfileModal(true)
            },
            {
              text: 'Catálogo',
              icon: listOutline,
              handler: () => router.push('/productos')
            },
            {
              text: 'Cerrar sesión',
              role: 'destructive',
              icon: logOutOutline,
              handler: () => setShowLogoutAlert(true)
            },
            {
              text: 'Cancelar',
              icon: closeOutline,
              role: 'cancel'
            }
          ]}
        />

        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Cerrar sesión"
          message="¿Estás seguro que deseas salir de tu cuenta?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Cerrar sesión',
              role: 'destructive',
              handler: handleLogout
            }
          ]}
        />

        {/* Custom Profile Modal with dark styling */}
        <IonModal isOpen={showProfileModal} onDidDismiss={() => setShowProfileModal(false)} className="dark-modal" initialBreakpoint={1} breakpoints={[0, 1]}>
          <div className="pi-profile-box" style={{ background: 'rgba(8,12,22,.97)', height: '100%' }}>
            <div className="pi-profile-header" style={{ padding: '28px', background: 'linear-gradient(135deg,rgba(59,130,246,.12),rgba(6,182,212,.08))', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 'bold', color: '#fff' }}>
                {inicial}
              </div>
              <div className="pi-profile-header-info">
                <h3>{user?.name ?? "—"}</h3>
                <p>{user?.email ?? "—"}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', fontSize: '11px', color: '#60a5fa', fontWeight: '600', marginTop: '6px' }}>
                  <IonIcon icon={personOutline} /> Cliente
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,.06)', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <IonIcon icon={closeOutline} />
              </button>
            </div>
            <div className="pi-profile-body" style={{ padding: '24px 28px' }}>
              {[
                  { label:"ID de usuario", value:`#${user?.id ?? "—"}` },
                  { label:"Nombre completo", value: user?.name ?? "—" },
                  { label:"Correo electrónico", value: user?.email ?? "—" },
                  { label:"Miembro desde", value: user?.created_at ? new Date(user.created_at).toLocaleDateString("es-MX", { year:"numeric", month:"long", day:"numeric" }) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="pi-profile-field">
                    <p className="pi-profile-label">{label}</p>
                    <p className="pi-profile-value">{value}</p>
                  </div>
              ))}
            </div>
          </div>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default PantallaInicio;
