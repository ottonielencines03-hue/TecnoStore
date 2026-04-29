import React, { useEffect, useState, useRef } from "react";
import { 
  IonContent, 
  IonPage, 
  IonIcon,
  useIonRouter,
  IonSpinner,
  IonToast
} from '@ionic/react';
import { 
  arrowBackOutline,
  cameraOutline,
  businessOutline,
  callOutline,
  locationOutline,
  mailOutline,
  personOutline,
  lockClosedOutline,
  notificationsOutline,
  colorPaletteOutline,
  saveOutline,
  logoFacebook,
  logoInstagram,
  logoTiktok,
  logoWhatsapp,
  trashOutline,
  qrCodeOutline,
  shareSocialOutline,
  downloadOutline
} from 'ionicons/icons';
import { QRCodeCanvas } from 'qrcode.react';
import imageCompression from 'browser-image-compression';
import './PerfilProveedor.css';
import { useCart } from '../context/CartContext';

const PerfilProveedor = () => {
  const router = useIonRouter();
  const { showToast } = useCart();
  const [proveedor, setProveedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'settings'
  const [removedAvatar, setRemovedAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const qrRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    empresa: "",
    telefono: "",
    direccion: "",
    password: "",
    avatar_file: null,
    facebook: "",
    instagram: "",
    tiktok: "",
    whatsapp: ""
  });

  // Settings State (for JSON field)
  const [ajustes, setAjustes] = useState({
    notificaciones_email: true,
    notificaciones_pedidos: true,
    tema_oscuro: true
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    if (!data || !data.empresa) {
      router.push('/login', 'back', 'replace');
    } else {
      setProveedor(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        empresa: data.empresa || "",
        telefono: data.telefono || "",
        direccion: data.direccion || "",
        password: "",
        avatar_file: null,
        facebook: data.facebook || "",
        instagram: data.instagram || "",
        tiktok: data.tiktok || "",
        whatsapp: data.whatsapp || ""
      });
      setRemovedAvatar(false);

      if (data.ajustes) {
        try {
          const parsedAjustes = typeof data.ajustes === 'string' ? JSON.parse(data.ajustes) : data.ajustes;
          setAjustes(prev => ({ ...prev, ...parsedAjustes }));
        } catch (e) { console.error("Error parsing ajustes", e); }
      }

      if (data.avatar) {
        setPreviewImage(`https://tecnostore-production.up.railway.app/avatars/${data.avatar}`);
      }
      setLoading(false);
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleAjuste = (key) => {
    setAjustes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast("La imagen es demasiado grande. Máx 10MB.", "error");
        return;
      }
      
      try {
        const options = { 
          maxSizeMB: 2, 
          maxWidthOrHeight: 1024,
          useWebWorker: true 
        };
        const compressedBlob = await imageCompression(file, options);
        const finalFile = new File([compressedBlob], file.name, { type: file.type });
        
        setFormData({ ...formData, avatar_file: finalFile });
        setRemovedAvatar(false);
        setPreviewImage(URL.createObjectURL(finalFile));
      } catch (error) {
        console.error("Error compressing image:", error);
        showToast("Error al procesar la imagen.", "error");
      }
    }
  };

  const handleRemoveAvatar = () => {
    setFormData({ ...formData, avatar_file: null });
    setPreviewImage(null);
    setRemovedAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("empresa", formData.empresa);
      form.append("telefono", formData.telefono);
      form.append("direccion", formData.direccion);
      form.append("facebook", formData.facebook);
      form.append("instagram", formData.instagram);
      form.append("tiktok", formData.tiktok);
      form.append("whatsapp", formData.whatsapp);
      
      if (formData.password) {
        form.append("password", formData.password);
      }
      if (formData.avatar_file) {
        form.append("avatar", formData.avatar_file);
      } else if (removedAvatar) {
        form.append("eliminar_avatar", "true");
      }
      form.append("ajustes", JSON.stringify(ajustes));

      const res = await fetch(`https://tecnostore-production.up.railway.app/api/perfil/proveedor/${proveedor.id}`, {
        method: 'POST',
        body: form
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setProveedor(data.user);
        showToast("Perfil actualizado correctamente", "success");
        setFormData({ ...formData, password: "" }); // Reset password field
      } else {
        showToast(data.message || "Error al guardar los cambios", "error");
      }

    } catch (err) {
      console.error(err);
      showToast("Error de conexión al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `TecnoStore_QR_${formData.empresa || proveedor.name}.png`;
      a.click();
    }
  };

  const handleShareQR = async () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas && navigator.share) {
      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        const file = new File([blob], `QR_${formData.empresa || proveedor.name}.png`, { type: "image/png" });
        await navigator.share({
          title: `Perfil de ${formData.empresa || proveedor.name}`,
          text: `Mira nuestra tienda en TecnoStore!`,
          files: [file]
        });
      } catch (err) {
        console.error("Error sharing QR", err);
      }
    } else {
      showToast("La función de compartir no está disponible en este navegador.", "warning");
    }
  };


  if (loading) {
    return (
      <IonPage>
        <IonContent fullscreen className="profile-ion-content">
          <div className="profile-loading">
            <IonSpinner name="crescent" color="primary" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const inicial = proveedor.name?.charAt(0).toUpperCase() || "?";

  return (
    <IonPage>
      <IonContent fullscreen className="profile-ion-content">
        <div className="profile-container">
          
          {/* Top Navbar */}
          <div className="prov-nav">
            <button className="prov-back-btn" onClick={() => router.push("/proveedor")}>
              <IonIcon icon={arrowBackOutline} />
              <span>Panel de Control</span>
            </button>
            <h1 className="prov-page-title">Ajustes de Cuenta</h1>
            <div style={{ width: '120px' }}></div> {/* Spacer */}
          </div>

          <div className="prov-layout">
            {/* Sidebar TABS */}
            <div className="prov-sidebar">
              <button 
                className={`prov-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <div className="prov-tab-icon"><IonIcon icon={personOutline} /></div>
                Información del Perfil
              </button>
              <button 
                className={`prov-tab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <div className="prov-tab-icon"><IonIcon icon={lockClosedOutline} /></div>
                Seguridad e Inicio
              </button>
              <button 
                className={`prov-tab ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <div className="prov-tab-icon"><IonIcon icon={notificationsOutline} /></div>
                Preferencias y Avisos
              </button>
              <button 
                className={`prov-tab ${activeTab === 'qr' ? 'active' : ''}`}
                onClick={() => setActiveTab('qr')}
              >
                <div className="prov-tab-icon"><IonIcon icon={qrCodeOutline} /></div>
                Código QR del Perfil
              </button>
            </div>

            {/* Main Content Area */}
            <div className="prov-content">
              
              {/* TAB 1: PERFIL */}
              {activeTab === 'profile' && (
                <div className="prov-card animate-fade-in">
                  <div className="prov-card-header">
                    <h2>Información de la Empresa</h2>
                    <p>Actualiza tus datos públicos y de contacto.</p>
                  </div>
                  
                  <div className="prov-card-body">
                    {/* Avatar Upload */}
                    <div className="prov-avatar-section">
                      <div className="prov-avatar-wrapper" onClick={handleImageClick}>
                        {previewImage ? (
                          <img src={previewImage} alt="Avatar" className="prov-avatar-img" />
                        ) : (
                          <div className="prov-avatar-placeholder">{inicial}</div>
                        )}
                        <div className="prov-avatar-overlay">
                          <IonIcon icon={cameraOutline} />
                        </div>
                      </div>
                      <div className="prov-avatar-info">
                        <h3>Logo / Foto de Perfil</h3>
                        <p>Sube una imagen recomendada de al menos 400x400px en formato JPG o PNG (máx. 10MB).</p>
                        <div className="prov-avatar-btns">
                          <button className="prov-btn-outline" onClick={handleImageClick}>Cambiar foto</button>
                          {(previewImage || proveedor.avatar) && !removedAvatar && (
                            <button className="prov-btn-delete" onClick={handleRemoveAvatar} title="Eliminar foto">
                              <IonIcon icon={trashOutline} />
                            </button>
                          )}
                        </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                      />
                    </div>

                    <div className="prov-form-grid">
                      <div className="prov-input-group">
                        <label>Nombre Completo</label>
                        <div className="prov-input-wrapper">
                          <IonIcon icon={personOutline} className="input-icon" />
                          <input type="text" name="name" value={formData.name} onChange={handleChange} />
                        </div>
                      </div>
                      
                      <div className="prov-input-group">
                        <label>Nombre de la Empresa</label>
                        <div className="prov-input-wrapper">
                          <IonIcon icon={businessOutline} className="input-icon" />
                          <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="prov-input-group">
                        <label>Correo Electrónico</label>
                        <div className="prov-input-wrapper">
                          <IonIcon icon={mailOutline} className="input-icon" />
                          <input type="email" name="email" value={formData.email} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="prov-input-group">
                        <label>Teléfono de Contacto</label>
                        <div className="prov-input-wrapper">
                          <IonIcon icon={callOutline} className="input-icon" />
                          <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="prov-input-group full-width">
                        <label>Dirección Física</label>
                        <div className="prov-input-wrapper">
                          <IonIcon icon={locationOutline} className="input-icon" />
                          <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="prov-divider" style={{ gridColumn: '1/-1', height: '1px', background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
                      <h3 style={{ gridColumn: '1/-1', fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>Redes Sociales</h3>

                      <div className="prov-input-group">
                        <label>Enlace Facebook</label>
                        <div className="prov-input-wrapper">
                          <IonIcon icon={logoFacebook} className="input-icon" />
                          <input type="text" name="facebook" placeholder="https://facebook.com/..." value={formData.facebook} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="prov-input-group">
                        <label>Usuario Instagram</label>
                        <div className="prov-input-wrapper">
                          <IonIcon icon={logoInstagram} className="input-icon" />
                          <input type="text" name="instagram" placeholder="@usuario" value={formData.instagram} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="prov-input-group">
                        <label>Usuario TikTok</label>
                        <div className="prov-input-wrapper">
                          <IonIcon icon={logoTiktok} className="input-icon" />
                          <input type="text" name="tiktok" placeholder="@usuario" value={formData.tiktok} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="prov-input-group">
                        <label>WhatsApp (Número)</label>
                        <div className="prov-input-wrapper">
                          <IonIcon icon={logoWhatsapp} className="input-icon" />
                          <input type="text" name="whatsapp" placeholder="Ej. 521234567890" value={formData.whatsapp} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SEGURIDAD */}
              {activeTab === 'security' && (
                <div className="prov-card animate-fade-in">
                  <div className="prov-card-header">
                    <h2>Seguridad de la Cuenta</h2>
                    <p>Gestiona tu contraseña y el acceso a tu cuenta.</p>
                  </div>
                  
                  <div className="prov-card-body">
                    <div className="prov-form-grid">
                      <div className="prov-input-group full-width">
                        <label>Nueva Contraseña (dejar en blanco para mantener actual)</label>
                        <div className="prov-input-wrapper">
                          <IonIcon icon={lockClosedOutline} className="input-icon" />
                          <input 
                            type="password" 
                            name="password" 
                            placeholder="••••••••"
                            value={formData.password} 
                            onChange={handleChange} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PREFERENCIAS */}
              {activeTab === 'settings' && (
                <div className="prov-card animate-fade-in">
                  <div className="prov-card-header">
                    <h2>Preferencias y Sistema</h2>
                    <p>Personaliza tu experiencia y las notificaciones que recibes.</p>
                  </div>
                  
                  <div className="prov-card-body">
                    <div className="prov-toggles-list">
                      <div className="prov-toggle-item">
                        <div className="prov-toggle-info">
                          <div className="prov-toggle-icon"><IonIcon icon={mailOutline} /></div>
                          <div>
                            <h4>Notificaciones Promocionales</h4>
                            <p>Recibe consejos y ofertas exclusivas en tu correo.</p>
                          </div>
                        </div>
                        <label className="prov-switch">
                          <input 
                            type="checkbox" 
                            checked={ajustes.notificaciones_email} 
                            onChange={() => handleToggleAjuste('notificaciones_email')} 
                          />
                          <span className="prov-slider"></span>
                        </label>
                      </div>

                      <div className="prov-toggle-item">
                        <div className="prov-toggle-info">
                          <div className="prov-toggle-icon st-blue"><IonIcon icon={notificationsOutline} /></div>
                          <div>
                            <h4>Alertas de Pedidos Nuevos</h4>
                            <p>Envía un email cada vez que un cliente compra un producto tuyo.</p>
                          </div>
                        </div>
                        <label className="prov-switch">
                          <input 
                            type="checkbox" 
                            checked={ajustes.notificaciones_pedidos} 
                            onChange={() => handleToggleAjuste('notificaciones_pedidos')} 
                          />
                          <span className="prov-slider"></span>
                        </label>
                      </div>

                      <div className="prov-toggle-item">
                        <div className="prov-toggle-info">
                          <div className="prov-toggle-icon st-purple"><IonIcon icon={colorPaletteOutline} /></div>
                          <div>
                            <h4>Tema Oscuro Global</h4>
                            <p>Utilizar interfaz oscura en todos los paneles.</p>
                          </div>
                        </div>
                        <label className="prov-switch">
                          <input 
                            type="checkbox" 
                            checked={ajustes.tema_oscuro} 
                            onChange={() => handleToggleAjuste('tema_oscuro')} 
                          />
                          <span className="prov-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: QR CODE */}
              {activeTab === 'qr' && (
                <div className="prov-card animate-fade-in">
                  <div className="prov-card-header">
                    <h2>Tu Código QR</h2>
                    <p>Comparte tu tienda para que los clientes te encuentren fácilmente.</p>
                  </div>
                  
                  <div className="prov-card-body">
                    <div className="prov-qr-section" ref={qrRef}>
                      <div className="prov-qr-container">
                        <QRCodeCanvas 
                          value={`${window.location.origin}/proveedor/tienda/${proveedor.id}`}
                          size={256}
                          level={"H"}
                          includeMargin={true}
                          imageSettings={{
                            src: "/Logo-TecnoStore.png",
                            x: undefined,
                            y: undefined,
                            height: 50,
                            width: 50,
                            excavate: true,
                          }}
                        />
                      </div>
                      <div className="prov-qr-info">
                        <h3>{formData.empresa || proveedor.name}</h3>
                        <p>Los clientes pueden escanear este código para ver todos tus productos en TecnoStore.</p>
                        <div className="prov-qr-actions">
                          <button className="prov-btn-qr" onClick={handleDownloadQR}>
                            <IonIcon icon={downloadOutline} /> Descargar Imagen
                          </button>
                          <button className="prov-btn-qr prov-btn-share" onClick={handleShareQR}>
                            <IonIcon icon={shareSocialOutline} /> Compartir Código
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Floating Action Bar */}
              <div className="prov-fab-footer">
                <button 
                  className={`prov-btn-primary ${saving ? 'loading' : ''}`} 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <IonSpinner name="crescent" />
                  ) : (
                    <>
                      <IonIcon icon={saveOutline} />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PerfilProveedor;
