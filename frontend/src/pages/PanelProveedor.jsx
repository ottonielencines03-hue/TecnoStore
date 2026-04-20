import React, { useState, useEffect, useRef } from "react";
import { 
  IonContent, 
  IonPage, 
  useIonRouter,
  IonActionSheet,
  IonAlert,
  IonIcon,
  IonToast,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonPopover
} from '@ionic/react';
import { 
  flashOutline, 
  cubeOutline, 
  personOutline, 
  logOutOutline,
  chevronDownOutline,
  closeOutline,
  bulbOutline,
  cashOutline,
  layersOutline,
  imageOutline,
  peopleOutline
} from 'ionicons/icons';
import imageCompression from "browser-image-compression";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, ShoppingBag, Layers, Activity } from 'lucide-react';
import './PanelProveedor.css';

const PRODUCT_CATEGORIES = [
  "Laptops",
  "Smartphones",
  "Tablets",
  "Audio",
  "Wearables",
  "Monitores",
  "Gaming",
  "Componentes",
  "Almacenamiento",
  "Periféricos",
  "Cámaras",
  "Otros"
];

const PanelProveedor = () => {
  const router = useIonRouter();

  const [producto, setProducto] = useState({
    nombre: "",
    categoria: "",
    marca: "",
    modelo: "",
    precio: "",
    stock: "",
    descuento: "",
    descripcion: "",
    imagen: null,
    tarjeta_pago: "",
  });

  const [proveedor, setProveedor] = useState(null);
  const [stats, setStats] = useState({
    total_products: 0,
    total_stock: 0,
    total_categories: 0,
    category_distribution: [],
    activity_data: []
  });
  const [globalStats, setGlobalStats] = useState({ customers: 0, avg_rating: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Ionic Overlay States
  const [popoverState, setPopoverState] = useState({ show: false, event: undefined });
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || (!user.empresa)) {
       router.push('/login', 'back', 'replace');
       return;
    }
    setProveedor(user);

    // Fetch Stats
    fetch(`http://localhost:8000/api/stats/proveedor/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoadingStats(false);
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
        setLoadingStats(false);
      });

    // Fetch Global Stats
    fetch("http://localhost:8000/api/stats")
      .then(res => res.json())
      .then(data => setGlobalStats(data))
      .catch(err => console.error("Error fetching global stats:", err));
  }, [router]);

  const handleChange = async (e) => {
    if (e.target.name === "imagen") {
      const file = e.target.files[0];
      if (file) {
        const options = { maxSizeMB: 2, maxWidthOrHeight: 1920 };
        try {
          const compressedBlob = await imageCompression(file, options);
          const finalFile = new File([compressedBlob], file.name, { type: file.type });
          setProducto({ ...producto, [e.target.name]: finalFile });
        } catch (error) {
          console.error(error);
          setToastMessage("Error al comprimir la imagen.");
          setToastColor("danger");
          setShowToast(true);
        }
      }
    } else {
      setProducto({ ...producto, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) throw new Error("No hay usuario logueado");

      const formData = new FormData();
      formData.append("nombre", producto.nombre);
      formData.append("categoria", producto.categoria);
      formData.append("marca", producto.marca || "");
      formData.append("modelo", producto.modelo || "");
      formData.append("precio", producto.precio);
      formData.append("descuento", producto.descuento || 0);
      formData.append("stock", producto.stock || 0);
      formData.append("descripcion", producto.descripcion || "");
      formData.append("proveedor_id", user.id);
      if (producto.tarjeta_pago) {
        formData.append("tarjeta_pago", producto.tarjeta_pago);
      }

      if (producto.imagen) {
        formData.append("imagen", producto.imagen);
      }

      const res = await fetch("http://localhost:8000/api/productos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        const messages = Object.values(errorData.messages || {})
          .flat()
          .join("\n");
        throw new Error(messages || "Error de validación");
      }

      const data = await res.json();
      
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 1500);

      setProducto({
        nombre: "",
        categoria: "",
        marca: "",
        modelo: "",
        precio: "",
        stock: "",
        descuento: "",
        descripcion: "",
        imagen: null,
        tarjeta_pago: "",
      });
      // Reset input file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

    } catch (error) {
      console.error(error);
      setToastMessage(error.message || "Error al publicar el producto");
      setToastColor("danger");
      setShowToast(true);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("user");
    window.location.replace("/");
  };

  const inicial = proveedor?.name?.charAt(0).toUpperCase() || "?";

  return (
    <IonPage>
      <IonContent fullscreen className="pp-ion-content">
        <div className="pp-wrap">
          <div className="pp-dots" />
          <div className="pp-orb pp-orb-1" />
          <div className="pp-orb pp-orb-2" />
          <div className="pp-orb pp-orb-3" />

          {/* HEADER */}
          <header className="pp-header">
            <div className="pp-header-inner">
              <div className="pp-header-logo" onClick={() => router.push('/')}>
                <img src="/Logo-TecnoStore.png" alt="TecnoStore Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                <div>
                  <p className="pp-htitle">Panel de Proveedor</p>
                  <p className="pp-hsub">Administra tus productos fácilmente</p>
                </div>
              </div>

              {/* PERFIL */}
              <div className="pp-avbtn" onClick={(e) => setPopoverState({ show: true, event: e.nativeEvent })}>
                {proveedor?.avatar ? (
                    <img src={`http://localhost:8000/avatars/${proveedor.avatar}`} alt="Avatar" className="pp-av-img" />
                ) : (
                    <div className="pp-av">{inicial}</div>
                )}
                <span className="pp-avname hide-mobile">
                  {proveedor?.name || "Proveedor"}
                </span>
                <IonIcon icon={chevronDownOutline} className="pp-chev" />
              </div>
            </div>
          </header>

          {/* MAIN */}
          <div className="pp-main">

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="pp-form-container">
              <div className="pp-card pp-form-card">
                <div className="pp-cardhead">
                  <div className="pp-cardicon">
                    <IonIcon icon={cubeOutline} />
                  </div>
                  <div>
                    <p className="pp-cardtitle">Nuevo Producto</p>
                    <p className="pp-cardsub">Completa los datos para publicar</p>
                  </div>
                </div>

                <div className="pp-form-body">
                  <div className="pp-grid2">
                    <div className="pp-field pp-span">
                      <label className="pp-label">Nombre del producto</label>
                      <input type="text" name="nombre" placeholder="Nombre del producto" value={producto.nombre} onChange={handleChange} className="pp-input" required/>
                    </div>
                    
                    <div className="pp-field">
                      <label className="pp-label">Categoría</label>
                      <select 
                        name="categoria" 
                        value={producto.categoria} 
                        onChange={handleChange} 
                        className="pp-input pp-select" 
                        required
                      >
                        <option value="" disabled>Seleccionar categoría...</option>
                        {PRODUCT_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="pp-field">
                      <label className="pp-label">Marca</label>
                      <input type="text" name="marca" placeholder="Marca" value={producto.marca} onChange={handleChange} className="pp-input" />
                    </div>

                    <div className="pp-field">
                      <label className="pp-label">Modelo</label>
                      <input type="text" name="modelo" placeholder="Modelo" value={producto.modelo} onChange={handleChange} className="pp-input" />
                    </div>

                    <div className="pp-field">
                      <label className="pp-label">Precio</label>
                      <input type="number" name="precio" placeholder="Precio" value={producto.precio} onChange={handleChange} className="pp-input" required/>
                    </div>

                    <div className="pp-field">
                      <label className="pp-label">Stock</label>
                      <input type="number" name="stock" placeholder="Stock" value={producto.stock} onChange={handleChange} className="pp-input" required/>
                    </div>

                    <div className="pp-field">
                      <label className="pp-label">Descuento (%)</label>
                      <input type="number" name="descuento" placeholder="Ej. 15" value={producto.descuento} onChange={handleChange} className="pp-input" max="100" min="0" />
                    </div>

                    <div className="pp-field pp-span">
                      <label className="pp-label">Número de Tarjeta (Pago)</label>
                      <input type="text" name="tarjeta_pago" placeholder="Ej. 4111 1111 1111 1111" value={producto.tarjeta_pago} onChange={handleChange} className="pp-input" />
                    </div>

                    <div className="pp-field pp-span pp-file-container">
                      <label className="pp-label">Imagen del producto</label>
                      <div className="pp-fileinput-wrapper">
                        <IonIcon icon={imageOutline} className="pp-file-icon" />
                        <input type="file" name="imagen" accept="image/*" onChange={handleChange} className="pp-fileinput" />
                        {producto.imagen ? (
                          <span style={{ marginLeft: "10px", fontSize: "14px", color: "#10b981", fontWeight: "500" }}>
                            {producto.imagen.name}
                          </span>
                        ) : (
                          <span style={{ marginLeft: "10px", fontSize: "14px", color: "#6b7280" }}>Seleccionar imagen...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pp-field pp-textarea-container">
                    <label className="pp-label">Descripción del producto</label>
                    <textarea name="descripcion" placeholder="Descripción del producto" value={producto.descripcion} onChange={handleChange} className="pp-input pp-textarea" />
                  </div>

                  <div className="pp-submit-container">
                    <button type="submit" className="pp-submit">
                      Publicar Producto
                      <IonIcon icon={cubeOutline} style={{marginLeft: '8px'}}/>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* SIDEBAR */}
            <div className="pp-sidebar">
              {/* Perfil */}
              <div className="pp-card pp-profile-card">
                <div className="pp-profile-header">
                  {proveedor?.avatar ? (
                    <img src={`http://localhost:8000/avatars/${proveedor.avatar}`} alt="Avatar" className="pp-avlg-img" />
                  ) : (
                    <div className="pp-avlg">{inicial}</div>
                  )}
                  <div>
                    <p className="pp-profile-name">{proveedor?.name || "Proveedor"}</p>
                    <p className="pp-profile-company">{proveedor?.empresa || "Tu empresa"}</p>
                  </div>
                </div>
                
                <div className="pp-contact-grid">
                  <div className="pp-contact-item">
                    <p className="pp-contact-label">Email</p>
                    <p className="pp-contact-value">{proveedor?.email || "—"}</p>
                  </div>
                  <div className="pp-contact-item">
                    <p className="pp-contact-label">Teléfono</p>
                    <p className="pp-contact-value">{proveedor?.telefono || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="pp-card pp-stats-card">
                <p className="pp-sidebar-title">Análisis de Inventario</p>
                
                {/* Categorías Pie Chart */}
                <div style={{ width: '100%', height: 180, marginBottom: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.category_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.category_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#6366f1', '#a78bfa', '#818cf8', '#60a5fa'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="pp-stats-list">
                  <div className="pp-statcard">
                    <div className="pp-sticon st-blue"><IonIcon icon={cubeOutline} /></div>
                    <div>
                      <p className="pp-stlabel">Productos</p>
                      <p className="pp-stval">{loadingStats ? '—' : stats.total_products}</p>
                    </div>
                  </div>
                  <div className="pp-statcard">
                    <div className="pp-sticon st-green"><IonIcon icon={cashOutline} /></div>
                    <div>
                      <p className="pp-stlabel">Stock Total</p>
                      <p className="pp-stval">{loadingStats ? '—' : stats.total_stock}</p>
                    </div>
                  </div>
                  <div className="pp-statcard">
                    <div className="pp-sticon st-orange"><IonIcon icon={layersOutline} /></div>
                    <div>
                      <p className="pp-stlabel">Categorías</p>
                      <p className="pp-stval">{loadingStats ? '—' : stats.total_categories}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DASHBOARD CHARTS */}
              <div className="pp-card pp-main-chart-card">
                <div className="pp-cardhead">
                  <div className="pp-cardicon"><IonIcon icon={cashOutline} /></div>
                  <div>
                    <p className="pp-cardtitle">Actividad Semanal</p>
                    <p className="pp-cardsub">Vistas y pedidos</p>
                  </div>
                </div>
                <div style={{ width: '100%', height: 200, padding: '12px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.activity_data}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={5} />
                      <YAxis hide={true} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', padding: '8px' }}
                        itemStyle={{ fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="ventas" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tips */}
              <div className="pp-card pp-tips-card">
                <div className="pp-tips-header">
                  <IonIcon icon={bulbOutline} className="tips-icon"/>
                  <p className="pp-tips-title">Tips para vender más</p>
                </div>
                <div className="pp-tips-list">
                  <div className="pp-tip">
                    <div className="pp-tipdot bg-blue" /> Usa imágenes en alta resolución sobre fondo blanco
                  </div>
                  <div className="pp-tip">
                    <div className="pp-tipdot bg-green" /> Incluye especificaciones técnicas detalladas
                  </div>
                  <div className="pp-tip">
                    <div className="pp-tipdot bg-orange" /> El precio competitivo aumenta 3× las ventas
                  </div>
                  <div className="pp-tip">
                    <div className="pp-tipdot bg-pink" /> Actualiza el stock para mayor visibilidad
                  </div>
                </div>
              </div>

              {/* Global Stats Card */}
              <div className="pp-card pp-global-stats-card">
                <div className="pp-cardhead">
                  <div className="pp-cardicon"><IonIcon icon={peopleOutline} /></div>
                  <div>
                    <p className="pp-cardtitle">Nuestra Comunidad</p>
                    <p className="pp-cardsub">Estado general de TecnoStore</p>
                  </div>
                </div>
                <div className="pp-global-stats-content">
                  <div className="pp-gstat">
                    <span className="pp-gstat-val">+{globalStats.customers.toLocaleString()}</span>
                    <span className="pp-gstat-lbl">Usuarios felices</span>
                  </div>
                  <div className="pp-gstat">
                    <span className="pp-gstat-val">{globalStats.avg_rating || "5.0"}★</span>
                    <span className="pp-gstat-lbl">Calificación promedio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ionic Components */}
        {/* Menú Avartar Premium (Popover) */}
        <IonPopover
          isOpen={popoverState.show}
          event={popoverState.event}
          onDidDismiss={() => setPopoverState({ show: false, event: undefined })}
          className="user-menu-popover light-popover"
          alignment="end"
          side="bottom"
          keyboardClose={false}
        >
          <div className="ump-container">
            <div className="ump-header">
              <span className="ump-name">{proveedor?.name ?? 'Proveedor'}</span>
              <span className="ump-email">{proveedor?.email ?? ''}</span>
            </div>
            
            <div className="ump-divider" />
            
            <div className="ump-actions">
              <button 
                className="ump-btn" 
                onClick={() => { setPopoverState({ show: false }); router.push('/gestionar-productos'); }}
              >
                <div className="ump-btn-icon"><IonIcon icon={cubeOutline} /></div>
                <span>Gestionar productos</span>
              </button>
              
              <button 
                className="ump-btn" 
                onClick={() => { setPopoverState({ show: false }); router.push('/perfil-proveedor'); }}
              >
                <div className="ump-btn-icon"><IonIcon icon={personOutline} /></div>
                <span>Ver perfil</span>
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
              Se cerrará tu sesión actual en el panel de proveedor. Deberás iniciar sesión de nuevo para administrar tus productos.
            </p>
            
            <div className="lm-actions">
              <button className="lm-btn lm-btn-cancel" onClick={() => setShowLogoutAlert(false)}>
                Mejor me quedo
              </button>
              <button className="lm-btn lm-btn-confirm" onClick={cerrarSesion}>
                Sí, salir
                <IonIcon icon={logOutOutline} style={{ marginLeft: '6px' }} />
              </button>
            </div>
          </div>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />

        {/* Modal Premium de Éxito al Publicar */}
        <IonModal 
          isOpen={showSuccessModal} 
          onDidDismiss={() => setShowSuccessModal(false)}
          className="pp-success-modal"
          backdropDismiss={false}
          animated={true}
        >
          <div className="pp-success-container">
            <div className="pp-success-icon-wrapper">
              <div className="pp-success-icon-bg">
                <IonIcon icon={cubeOutline} className="pp-success-icon" />
              </div>
            </div>
            <h2 className="pp-success-title">¡Publicado!</h2>
            <p className="pp-success-subtitle">El producto ya está en tu catálogo</p>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default PanelProveedor;
