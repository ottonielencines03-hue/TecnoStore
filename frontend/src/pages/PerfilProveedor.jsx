import React, { useEffect, useState } from "react";
import { 
  IonContent, 
  IonPage, 
  IonIcon,
  useIonRouter,
  IonSpinner
} from '@ionic/react';
import { 
  arrowBackOutline,
  logOutOutline,
  mailOutline,
  businessOutline,
  callOutline,
  locationOutline
} from 'ionicons/icons';
import './PerfilProveedor.css';

const PerfilProveedor = () => {
  const [proveedor, setProveedor] = useState(null);
  const router = useIonRouter();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    if (!data || !data.empresa) {
      router.push('/login', 'back', 'replace');
    } else {
      setProveedor(data);
    }
  }, [router]);


  if (!proveedor) {
    return (
      <IonPage>
        <IonContent fullscreen className="profile-ion-content">
          <div className="profile-loading">
            <IonSpinner name="crescent" color="primary" />
            <p>Cargando perfil...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const inicial = proveedor.name?.charAt(0).toUpperCase() || "?";

  return (
    <IonPage>
      <IonContent fullscreen className="profile-ion-content">
        <div className="profile-wrap">
          <div className="profile-hex" />
          <div className="profile-noise" />
          <div className="profile-orb profile-orb-1" />
          <div className="profile-orb profile-orb-2" />

          <div className="profile-card-container">
            <div className="profile-card">
              {/* HEADER */}
              <div className="profile-card-header">
                <div className="profile-avatar-lg">
                  {inicial}
                </div>
                <h2 className="profile-name">
                  {proveedor.name}
                </h2>
                <p className="profile-role">
                  Proveedor
                </p>
              </div>

              {/* INFO */}
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <IonIcon icon={mailOutline} />
                  </div>
                  <div className="profile-info-text">
                    <span className="profile-info-label">Correo</span>
                    <p className="profile-info-value">{proveedor.email}</p>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <IonIcon icon={businessOutline} />
                  </div>
                  <div className="profile-info-text">
                    <span className="profile-info-label">Empresa</span>
                    <p className="profile-info-value">{proveedor.empresa}</p>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <IonIcon icon={callOutline} />
                  </div>
                  <div className="profile-info-text">
                    <span className="profile-info-label">Teléfono</span>
                    <p className="profile-info-value">{proveedor.telefono}</p>
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-info-icon">
                    <IonIcon icon={locationOutline} />
                  </div>
                  <div className="profile-info-text">
                    <span className="profile-info-label">Dirección</span>
                    <p className="profile-info-value">
                      {proveedor.direccion || "No registrada"}
                    </p>
                  </div>
                </div>
              </div>

              {/* BOTONES */}
              <div className="profile-actions">
                <button
                  onClick={() => router.push("/proveedor")}
                  className="profile-btn-primary"
                  style={{ width: '100%' }}
                >
                  <IonIcon icon={arrowBackOutline} style={{ marginRight: '8px' }} />
                  Volver al Panel
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
