import React, { useState, useRef, useEffect } from 'react';
import { IonModal, IonIcon, IonSpinner } from '@ionic/react';
import { 
  closeOutline, 
  personOutline, 
  mailOutline, 
  lockClosedOutline, 
  notificationsOutline, 
  cameraOutline, 
  shieldCheckmarkOutline,
  colorPaletteOutline,
  saveOutline,
  qrCodeOutline,
  shareSocialOutline,
  downloadOutline
} from 'ionicons/icons';
import { QRCodeCanvas } from 'qrcode.react';
import { useCart } from '../context/CartContext';
import imageCompression from 'browser-image-compression';
import { trashOutline } from 'ionicons/icons';
import './ClientSettingsModal.css';

const ClientSettingsModal = ({ isOpen, onDismiss, user, onUpdateUser }) => {
  const { showToast } = useCart();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [removedAvatar, setRemovedAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const qrRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    avatar_file: null
  });

  const [ajustes, setAjustes] = useState({
    notificaciones_ofertas: true,
    notificaciones_envios: true,
    tema_oscuro: true
  });

  const [previewImage, setPreviewImage] = useState(null);

  // Sync state when modal opens or user updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        avatar_file: null
      });
      setRemovedAvatar(false);

      if (user.ajustes) {
        try {
          const parsedAjustes = typeof user.ajustes === 'string' ? JSON.parse(user.ajustes) : user.ajustes;
          setAjustes(prev => ({ ...prev, ...parsedAjustes }));
        } catch (e) {
          console.error("Error parsing ajustes", e);
        }
      }

      if (user.avatar) {
        setPreviewImage(`https://tecnostore-production.up.railway.app/avatars/${user.avatar}`);
      }
    }
  }, [user, isOpen]);

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
      
      if (formData.password) {
        form.append("password", formData.password);
      }
      if (formData.avatar_file) {
        form.append("avatar", formData.avatar_file);
      } else if (removedAvatar) {
        form.append("eliminar_avatar", "true");
      }
      form.append("ajustes", JSON.stringify(ajustes));

      const res = await fetch(`https://tecnostore-production.up.railway.app/api/perfil/cliente/${user.id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: form
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (onUpdateUser) onUpdateUser(data.user);
        showToast("Ajustes guardados correctamente", "success");
        setFormData({ ...formData, password: "" });
        onDismiss();
      } else {
        let errorMsg = data.message || "Error al guardar los cambios";
        if (data.errors) {
          errorMsg = Object.values(data.errors).flat().join("\n");
        }
        showToast(errorMsg, "error");
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
      a.download = `TecnoStore_QR_${user.name}.png`;
      a.click();
    }
  };

  const handleShareQR = async () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas && navigator.share) {
      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        const file = new File([blob], `QR_${user.name}.png`, { type: "image/png" });
        await navigator.share({
          title: 'Mí Perfil de TecnoStore',
          text: `Escanea este código para ver mi perfil en TecnoStore: ${user.name}`,
          files: [file]
        });
      } catch (err) {
        console.error("Error sharing QR", err);
      }
    } else {
      showToast("La función de compartir no está disponible en este navegador.", "warning");
    }
  };

  if (!user) return null;
  const inicial = user.name?.charAt(0).toUpperCase() || "?";

  return (
    <IonModal 
      isOpen={isOpen} 
      onDidDismiss={onDismiss} 
      className="cs-modal dark-modal" 
    >
      <div className="cs-container">
        
        {/* Header */}
        <div className="cs-header">
          <div className="cs-header-info">
            <h2 className="cs-title">Ajustes de Cuenta</h2>
            <p className="cs-subtitle">Administra tu perfil, seguridad y preferencias</p>
          </div>
          <button className="cs-close-btn" onClick={onDismiss}>
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        {/* Layout */}
        <div className="cs-layout">
          
          {/* Sidebar */}
          <div className="cs-sidebar">
            <button 
              className={`cs-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <IonIcon icon={personOutline} /> Perfil
            </button>
            <button 
              className={`cs-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <IonIcon icon={shieldCheckmarkOutline} /> Seguridad
            </button>
            <button 
              className={`cs-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <IonIcon icon={notificationsOutline} /> Preferencias
            </button>
            <button 
              className={`cs-tab ${activeTab === 'qr' ? 'active' : ''}`}
              onClick={() => setActiveTab('qr')}
            >
              <IonIcon icon={qrCodeOutline} /> Código QR
            </button>
          </div>

          {/* Content */}
          <div className="cs-content">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="cs-tab-pane">
                <div className="cs-avatar-section">
                  <div className="cs-avatar-wrapper" onClick={handleImageClick}>
                    {previewImage ? (
                      <img src={previewImage} alt="Avatar" className="cs-avatar-img" />
                    ) : (
                      <div className="cs-avatar-placeholder">{inicial}</div>
                    )}
                    <div className="cs-avatar-overlay">
                      <IonIcon icon={cameraOutline} />
                    </div>
                  </div>
                  <div className="cs-avatar-info">
                    <h3>Foto de Perfil</h3>
                    <p>JPG o PNG, máx. 10MB (se comprimirá)</p>
                    <div className="cs-avatar-btns">
                      <button className="cs-btn-outline" onClick={handleImageClick}>Elegir foto</button>
                      {(previewImage || user.avatar) && !removedAvatar && (
                        <button className="cs-btn-delete" onClick={handleRemoveAvatar} title="Eliminar foto">
                          <IonIcon icon={trashOutline} />
                        </button>
                      )}
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                </div>

                <div className="cs-form">
                  <div className="cs-field">
                    <label>Nombre Completo</label>
                    <div className="cs-input-wrap">
                      <IonIcon icon={personOutline} />
                      <input type="text" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <div className="cs-field">
                    <label>Correo Electrónico</label>
                    <div className="cs-input-wrap">
                      <IonIcon icon={mailOutline} />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="cs-tab-pane">
                <div className="cs-form">
                  <div className="cs-field">
                    <label>Nueva Contraseña</label>
                    <div className="cs-input-wrap">
                      <IonIcon icon={lockClosedOutline} />
                      <input 
                        type="password" 
                        name="password" 
                        placeholder="Dejar en blanco para no cambiar"
                        value={formData.password} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="cs-tab-pane">
                <div className="cs-toggles">
                  
                  <div className="cs-toggle-item">
                    <div className="cs-toggle-info">
                      <div className="cs-toggle-icon"><IonIcon icon={mailOutline} /></div>
                      <div>
                        <h4>Ofertas y Promociones</h4>
                        <p>Recibe correos con descuentos exclusivos.</p>
                      </div>
                    </div>
                    <label className="cs-switch">
                      <input type="checkbox" checked={ajustes.notificaciones_ofertas} onChange={() => handleToggleAjuste('notificaciones_ofertas')} />
                      <span className="cs-slider"></span>
                    </label>
                  </div>

                  <div className="cs-toggle-item">
                    <div className="cs-toggle-info">
                      <div className="cs-toggle-icon bg-green"><IonIcon icon={notificationsOutline} /></div>
                      <div>
                        <h4>Actualizaciones de Envíos</h4>
                        <p>Avisos sobre el estado de tus compras.</p>
                      </div>
                    </div>
                    <label className="cs-switch">
                      <input type="checkbox" checked={ajustes.notificaciones_envios} onChange={() => handleToggleAjuste('notificaciones_envios')} />
                      <span className="cs-slider"></span>
                    </label>
                  </div>

                  <div className="cs-toggle-item">
                    <div className="cs-toggle-info">
                      <div className="cs-toggle-icon bg-purple"><IonIcon icon={colorPaletteOutline} /></div>
                      <div>
                        <h4>Modo Oscuro</h4>
                        <p>Utilizar interfaz oscura en el catálogo.</p>
                      </div>
                    </div>
                    <label className="cs-switch">
                      <input type="checkbox" checked={ajustes.tema_oscuro} onChange={() => handleToggleAjuste('tema_oscuro')} />
                      <span className="cs-slider"></span>
                    </label>
                  </div>

                </div>
              </div>
            )}

            {/* QR TAB */}
            {activeTab === 'qr' && (
              <div className="cs-tab-pane">
                <div className="cs-qr-section" ref={qrRef}>
                  <div className="cs-qr-container">
                    <QRCodeCanvas 
                      value={`${window.location.origin}/perfil/${user.id}`}
                      size={200}
                      level={"H"}
                      includeMargin={true}
                      imageSettings={{
                        src: "/Logo-TecnoStore.png",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                  <div className="cs-qr-info">
                    <h3>Tu Código QR Personal</h3>
                    <p>Comparte este código para que otros puedan encontrarte rápidamente en TecnoStore.</p>
                    <div className="cs-qr-actions">
                      <button className="cs-btn-qr" onClick={handleDownloadQR}>
                        <IonIcon icon={downloadOutline} /> Descargar
                      </button>
                      <button className="cs-btn-qr cs-btn-share" onClick={handleShareQR}>
                        <IonIcon icon={shareSocialOutline} /> Compartir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="cs-footer">
          <button className="cs-btn-cancel" onClick={onDismiss}>Cancelar</button>
          <button className={`cs-btn-save ${saving ? 'loading' : ''}`} onClick={handleSave} disabled={saving}>
            {saving ? <IonSpinner name="dots" /> : <><IonIcon icon={saveOutline} /> Guardar</>}
          </button>
        </div>

      </div>
    </IonModal>
  );
};

export default ClientSettingsModal;
