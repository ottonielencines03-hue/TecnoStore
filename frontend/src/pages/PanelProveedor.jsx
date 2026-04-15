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
  IonButton
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
  imageOutline
} from 'ionicons/icons';
import imageCompression from "browser-image-compression";
import './PanelProveedor.css';

const PanelProveedor = () => {
  const router = useIonRouter();

  const [producto, setProducto] = useState({
    nombre: "",
    categoria: "",
    marca: "",
    modelo: "",
    precio: "",
    stock: "",
    descripcion: "",
    imagen: null,
  });

  const [proveedor, setProveedor] = useState(null);
  
  // Ionic Overlay States
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setProveedor(user);
    if (!user || !user.id) {
       router.push('/login', 'back', 'replace');
    }
  }, [router]);

  const handleChange = async (e) => {
    if (e.target.name === "imagen") {
      const file = e.target.files[0];
      if (file) {
        const options = { maxSizeMB: 2, maxWidthOrHeight: 1920 };
        try {
          const compressedFile = await imageCompression(file, options);
          setProducto({ ...producto, [e.target.name]: compressedFile });
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
      formData.append("stock", producto.stock || 0);
      formData.append("descripcion", producto.descripcion || "");
      formData.append("proveedor_id", user.id);

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
      
      setToastMessage("Producto publicado 🚀");
      setToastColor("success");
      setShowToast(true);

      setProducto({
        nombre: "",
        categoria: "",
        marca: "",
        modelo: "",
        precio: "",
        stock: "",
        descripcion: "",
        imagen: null,
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
    router.push("/", "back", "replace");
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
                <div className="pp-logo">
                  <IonIcon icon={flashOutline} />
                </div>
                <div>
                  <p className="pp-htitle">Panel de Proveedor</p>
                  <p className="pp-hsub">Administra tus productos fácilmente</p>
                </div>
              </div>

              {/* PERFIL */}
              <div className="pp-avbtn" onClick={() => setShowActionSheet(true)}>
                <div className="pp-av">{inicial}</div>
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
                      <input type="text" name="categoria" placeholder="Categoría" value={producto.categoria} onChange={handleChange} className="pp-input" required/>
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

                    <div className="pp-field pp-span pp-file-container">
                      <label className="pp-label">Imagen del producto</label>
                      <div className="pp-fileinput-wrapper">
                        <IonIcon icon={imageOutline} className="pp-file-icon" />
                        <input type="file" name="imagen" accept="image/*" onChange={handleChange} className="pp-fileinput" />
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
                  <div className="pp-avlg">{inicial}</div>
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
                <p className="pp-sidebar-title">Resumen</p>
                <div className="pp-stats-list">
                  <div className="pp-statcard">
                    <div className="pp-sticon st-blue"><IonIcon icon={cubeOutline} /></div>
                    <div>
                      <p className="pp-stlabel">Productos</p>
                      <p className="pp-stval">—</p>
                    </div>
                  </div>
                  <div className="pp-statcard">
                    <div className="pp-sticon st-green"><IonIcon icon={cashOutline} /></div>
                    <div>
                      <p className="pp-stlabel">Ventas hoy</p>
                      <p className="pp-stval">—</p>
                    </div>
                  </div>
                  <div className="pp-statcard">
                    <div className="pp-sticon st-orange"><IonIcon icon={layersOutline} /></div>
                    <div>
                      <p className="pp-stlabel">Categorías</p>
                      <p className="pp-stval">—</p>
                    </div>
                  </div>
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
            </div>
          </div>
        </div>

        {/* Ionic Components */}
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header={(proveedor?.name || "Proveedor") + " - " + (proveedor?.email || "")}
          buttons={[
            {
              text: 'Gestionar productos',
              icon: cubeOutline,
              handler: () => router.push('/gestionar-productos')
            },
            {
              text: 'Ver perfil',
              icon: personOutline,
              handler: () => router.push('/perfil-proveedor')
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
          header="¿Cerrar sesión?"
          message="Se cerrará tu sesión actual en el panel de proveedor."
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Sí, salir',
              role: 'destructive',
              handler: cerrarSesion
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default PanelProveedor;
