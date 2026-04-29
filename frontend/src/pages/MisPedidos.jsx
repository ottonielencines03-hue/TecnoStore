import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonTitle,
  IonIcon,
  useIonRouter,
  IonSpinner
} from '@ionic/react';
import { 
  receiptOutline, 
  calendarOutline, 
  walletOutline, 
  chevronForwardOutline,
  bagHandleOutline,
  arrowBackOutline
} from 'ionicons/icons';
import axios from 'axios';
import ReceiptModal from '../components/ReceiptModal';
import './MisPedidos.css';

const MisPedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const router = useIonRouter();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      router.push('/login', 'forward', 'replace');
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`https://tecnostore-production.up.railway.app/api/ordenes/usuario/${user.id}`);
      if (response.data.status === 'success') {
        setOrders(response.data.ordenes);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (val) =>
    Number(val).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 });

  const handleShowReceipt = (order) => {
    setSelectedOrder(order);
    setIsReceiptOpen(true);
  };

  return (
    <IonPage>
      <IonHeader className="pi-nav" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <IonToolbar style={{ '--background': 'transparent', '--color': 'white', '--padding-top': '8px', '--padding-bottom': '8px' }}>
          <IonButtons slot="start">
            <button className="mp-back-btn" onClick={() => router.push('/PantallaInicio', 'back')}>
              <IonIcon icon={arrowBackOutline} />
            </button>
          </IonButtons>
          <IonTitle className="mp-title">Mis Pedidos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="mp-content">
        <div className="mp-wrap">
          {/* Decorative elements */}
          <div className="pi-hex" />
          <div className="pi-orb pi-orb-1" style={{ top: '-10%', left: '-10%' }} />
          <div className="pi-orb pi-orb-2" style={{ bottom: '0', right: '-10%' }} />

          <div className="mp-header-section">
            <h2 className="mp-heading">Historial de <em>Compras</em></h2>
            <p className="mp-subheading">Aquí puedes consultar y descargar los comprobantes de tus pedidos anteriores.</p>
          </div>

          {loading ? (
            <div className="mp-loading">
              <IonSpinner name="crescent" color="primary" />
              <p>Cargando tus pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="mp-empty">
              <div className="mp-empty-icon">
                <IonIcon icon={bagHandleOutline} />
              </div>
              <h3>Aún no tienes pedidos</h3>
              <p>Cuando realices una compra, aparecerá aquí para que puedas ver tu comprobante.</p>
              <button className="mp-cta-btn" onClick={() => router.push('/productos')}>
                Explorar catálogo
              </button>
            </div>
          ) : (
            <div className="mp-list">
              {orders.map((order) => (
                <div key={order.id} className="mp-card" onClick={() => handleShowReceipt(order)}>
                  <div className="mp-card-top">
                    <div className="mp-order-id">
                      <span className="mp-label">Pedido</span>
                      <span className="mp-value">#{order.id}</span>
                    </div>
                    <div className="mp-order-status">
                      <span className="mp-status-badge">{order.status}</span>
                    </div>
                  </div>

                  <div className="mp-card-body">
                    <div className="mp-info-item">
                      <IonIcon icon={calendarOutline} />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mp-info-item">
                      <IonIcon icon={walletOutline} />
                      <span>{formatPrice(order.total)}</span>
                    </div>
                    <div className="mp-info-item">
                      <IonIcon icon={receiptOutline} />
                      <span>{order.detalles?.length || 0} productos</span>
                    </div>
                  </div>

                  <div className="mp-card-footer">
                    <span className="mp-view-txt">Ver recibo</span>
                    <IonIcon icon={chevronForwardOutline} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isReceiptOpen && selectedOrder && (
          <ReceiptModal 
            isOpen={isReceiptOpen} 
            onClose={() => setIsReceiptOpen(false)} 
            orderData={selectedOrder} 
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default MisPedidos;
