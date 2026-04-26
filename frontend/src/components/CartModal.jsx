import React, { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  closeOutline, trashOutline, addOutline, removeOutline, 
  bagHandleOutline, sparklesOutline,
  imageOutline, chevronForwardOutline, cardOutline,
  shieldCheckmarkOutline, lockClosedOutline, checkmarkCircleOutline,
  locationOutline
} from 'ionicons/icons';
import { useCart } from '../context/CartContext';
import ReceiptModal from './ReceiptModal';
import { API_BASE_URL, BASE_URL } from '../config';
import './CartModal.css';

const CartModal = ({ isOpen: propIsOpen, onDismiss: propOnDismiss, onRequireAuth }) => {
  const { 
    cart, removeFromCart, updateQuantity, cartTotal, cartItemCount, uniqueItemCount,
    clearCart, showToast, isCartOpen, setIsCartOpen, user 
  } = useCart();
  
  const isOpen = propIsOpen !== undefined ? propIsOpen : isCartOpen;
  const onDismiss = propOnDismiss || (() => setIsCartOpen(false));
  const [removingId, setRemovingId] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const overlayRef = useRef(null);

  // ─── ESTADOS PARA LAS 3 APIs SECUNDARIAS (REQUISITO ESCOLAR) ───
  const [exchangeRateUSD, setExchangeRateUSD] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [secureTransactionToken, setSecureTransactionToken] = useState('');

  // Simulated card form state
  const [cardData, setCardData] = useState({
    cardNumber: '4242 4242 4242 4242',
    cardName: 'USUARIO PRUEBA',
    expiry: '12/28',
    cvv: '123'
  });
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'transfer' | 'cash'

  // ─── LLAMADAS A LAS 3 APIs ───
  useEffect(() => {
    if (isOpen) {
      // API #1: ExchangeRate API (Para convertir MXN a USD en tiempo real)
      fetch('https://api.exchangerate-api.com/v4/latest/MXN')
        .then(res => res.json())
        .then(data => {
          if (data && data.rates && data.rates.USD) {
            setExchangeRateUSD(data.rates.USD);
          }
        })
        .catch(err => console.error("Error al cargar API 1 (ExchangeRate):", err));

      // API #2: IPAPI Geolocation (Para detectar la ciudad/estado del envío automáticamente)
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setUserLocation(data);
          }
        })
        .catch(err => console.error("Error al cargar API 2 (IPAPI Geo):", err));
    }
  }, [isOpen]);

  useEffect(() => {
    // API #3: HTTPBin UUID / Token Generator (Para simular un Token Seguro Externo de Pasarela de Pago)
    if (showCheckout && !secureTransactionToken) {
      fetch('https://httpbin.org/uuid')
        .then(res => res.json())
        .then(data => {
          if (data && data.uuid) {
            setSecureTransactionToken(data.uuid);
          }
        })
        .catch(err => console.error("Error al cargar API 3 (HTTPBin UUID):", err));
    }
  }, [showCheckout, secureTransactionToken]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onDismiss();
  };

  const handleRemove = async (id) => {
    setRemovingId(id);
    setTimeout(async () => {
      await removeFromCart(id);
      setRemovingId(null);
    }, 350);
  };

  const formatPrice = (val) =>
    Number(val).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 });

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  };

  const handleCardInput = (field, value) => {
    if (field === 'cardNumber') {
      setCardData(prev => ({ ...prev, cardNumber: formatCardNumber(value) }));
    } else if (field === 'expiry') {
      setCardData(prev => ({ ...prev, expiry: formatExpiry(value) }));
    } else if (field === 'cvv') {
      setCardData(prev => ({ ...prev, cvv: value.replace(/\D/g, '').slice(0, 4) }));
    } else {
      setCardData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessingOrder(true);
    
    try {
      // Simulate a small delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));

      const methodLabels = {
        card: 'Tarjeta Bancaria',
        transfer: 'Transferencia',
        cash: 'Pago en Efectivo'
      };

      // Aquí consumimos el token que nos dio la API 3, o usamos uno fallback si la API falló
      const mockPaypalId = secureTransactionToken ? `EXT-TOKEN-${secureTransactionToken}` : `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const orderData = {
        user_id: user?.id || 1,
        paypal_id: mockPaypalId,
        total: Number(cartTotal.toFixed(2)),
        metodo_pago: methodLabels[paymentMethod],
        items: cart.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: Number((item.precio * (1 - (item.descuento || 0) / 100)).toFixed(2)),
        }))
      };

      const targetUrl = `${API_BASE_URL}/ordenes`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setOrderResult(data.orden);
        setIsReceiptOpen(true);
        clearCart();
        setShowCheckout(false);
        if (showToast) showToast('¡Compra realizada con éxito!', 'success');
      } else {
        if (showToast) showToast(data.message || 'Error al registrar la orden.', 'danger');
      }
    } catch (error) {
      if (showToast) showToast('Error de conexión con el servidor.', 'danger');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="cm-drawer">
        <div className="cm-top-gradient" />
        <div className="cm-handle-bar">
          <div className="cm-handle" />
        </div>

        <div className="cm-header">
          <div className="cm-header-left">
            <div className="cm-header-icon-wrap">
              <IonIcon icon={bagHandleOutline} />
            </div>
            <div>
              <h2 className="cm-title">{showCheckout ? 'Checkout' : 'Mi Carrito'}</h2>
              <p className="cm-subtitle">
                {showCheckout 
                  ? 'Pasarela de Pagos'
                  : uniqueItemCount === 0
                    ? 'Sin productos'
                    : `${uniqueItemCount} ${uniqueItemCount === 1 ? 'producto' : 'productos'}`}
              </p>
            </div>
          </div>
          <button className="cm-close" onClick={onDismiss} aria-label="Cerrar carrito">
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        <div className="cm-body">
          {showCheckout ? (
            /* ─── Checkout Form ─── */
            <div className="cm-checkout-form">
              
              {/* API #2: Mostrar Geolocalización Dinámica */}
              {userLocation ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: '#166534', fontSize: '13px' }}>
                  <IonIcon icon={locationOutline} style={{ fontSize: '24px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', color: '#14532d', marginBottom: '2px' }}>Envío auto-calculado para {userLocation.city}, {userLocation.region}</strong>
                    <span>Región: {userLocation.country_name}</span>
                  </div>
                </div>
              ) : (
                <div className="cm-test-banner">
                  <IonIcon icon={shieldCheckmarkOutline} />
                  <div>
                    <strong>Modo Seguro</strong>
                    <span>Tus datos de pago están protegidos</span>
                  </div>
                </div>
              )}

              {/* Payment method selector */}
              <div className="cm-payment-methods">
                <p className="cm-form-label">Selecciona tu método de pago</p>
                <div className="cm-method-options">
                  <button 
                    className={`cm-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <IonIcon icon={cardOutline} />
                    <span>Tarjeta</span>
                  </button>
                  <button 
                    className={`cm-method-btn ${paymentMethod === 'transfer' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('transfer')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
                    </svg>
                    <span>Transferencia</span>
                  </button>
                  <button 
                    className={`cm-method-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="6" width="20" height="12" rx="2"/>
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M6 12h.01M18 12h.01"/>
                    </svg>
                    <span>Efectivo</span>
                  </button>
                </div>
              </div>

              {/* API #3: Mostrar Token generado si no es Tarjeta */}
              {(paymentMethod === 'transfer' || paymentMethod === 'cash') && (
                <div className="cm-transfer-info">
                  <div className="cm-info-card">
                    <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 28, color: paymentMethod === 'transfer' ? '#16a34a' : '#f59e0b' }} />
                    <p><strong>{paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 'Pago en Efectivo'}</strong></p>
                    <p className="cm-info-detail" style={{ margin: '8px 0' }}>
                      {paymentMethod === 'transfer' ? (
                        <>CLABE: 0123 4567 8901 2345 67<br/>Banco: TecnoBank SA de CV</>
                      ) : (
                        <>Dicta esta referencia al cajero (OXXO/7-Eleven).<br/>El pago se aprobará al instante.</>
                      )}
                    </p>
                    
                    {/* Visualización clara de la API de Autenticación de Token */}
                    <div style={{ background: '#f1f5f9', width: '100%', padding: '8px', borderRadius: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', marginBottom:'2px' }}>Token de Pasarela (Ext API)</span>
                      <code style={{ fontSize: '11px', color: '#334155', wordBreak: 'break-all' }}>
                        {secureTransactionToken ? `EXT-${secureTransactionToken}` : 'Generando token seguro...'}
                      </code>
                    </div>

                  </div>
                </div>
              )}

              {/* Card form (shown only for card method) */}
              {paymentMethod === 'card' && (
                <div className="cm-card-form">
                  <div className="cm-card-preview">
                    <div className="cm-card-preview-top">
                      <div className="cm-card-chip" />
                      <span className="cm-card-type">VISA</span>
                    </div>
                    <p className="cm-card-preview-number">
                      {cardData.cardNumber || '•••• •••• •••• ••••'}
                    </p>
                    <div className="cm-card-preview-bottom">
                      <div>
                        <span className="cm-card-label">Titular</span>
                        <p className="cm-card-preview-name">{cardData.cardName || 'NOMBRE'}</p>
                      </div>
                      <div>
                        <span className="cm-card-label">Expira</span>
                        <p className="cm-card-preview-name">{cardData.expiry || 'MM/AA'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="cm-input-group">
                    <label className="cm-form-label">Número de tarjeta</label>
                    <div className="cm-input-wrap">
                      <IonIcon icon={cardOutline} className="cm-input-icon" />
                      <input
                        type="text"
                        className="cm-input"
                        placeholder="4242 4242 4242 4242"
                        value={cardData.cardNumber}
                        onChange={(e) => handleCardInput('cardNumber', e.target.value)}
                      />
                      <IonIcon icon={lockClosedOutline} className="cm-input-lock" />
                    </div>
                  </div>

                  <div className="cm-input-group">
                    <label className="cm-form-label">Nombre del titular</label>
                    <input
                      type="text"
                      className="cm-input cm-input-full"
                      placeholder="NOMBRE COMPLETO"
                      value={cardData.cardName}
                      onChange={(e) => handleCardInput('cardName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="cm-input-row">
                    <div className="cm-input-group">
                      <label className="cm-form-label">Fecha exp.</label>
                      <input
                        type="text"
                        className="cm-input cm-input-full"
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={(e) => handleCardInput('expiry', e.target.value)}
                      />
                    </div>
                    <div className="cm-input-group">
                      <label className="cm-form-label">CVV</label>
                      <input
                        type="text"
                        className="cm-input cm-input-full"
                        placeholder="123"
                        value={cardData.cvv}
                        onChange={(e) => handleCardInput('cvv', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order summary */}
              <div className="cm-checkout-summary">
                <div className="cm-summary-row" style={{ alignItems: 'flex-start' }}>
                  <span style={{ paddingTop: '8px' }}>Total a pagar</span>
                  <div style={{ textAlign: 'right' }}>
                    <span className="cm-total-amount">{formatPrice(cartTotal)}</span>
                    {/* API #1: Mostrar equivalencia en USD usando ExchangeRate API */}
                    {exchangeRateUSD && (
                       <span style={{ display: 'block', fontSize: '13px', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>
                         ≈ ${(cartTotal * exchangeRateUSD).toFixed(2)} USD
                       </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <button 
                className="cm-pay-btn"
                onClick={handleProcessPayment}
                disabled={isProcessingOrder || !secureTransactionToken}
              >
                {isProcessingOrder ? (
                  <span className="cm-pay-loading">
                    <span className="cm-spinner" />
                    Procesando orden...
                  </span>
                ) : (
                  <>
                    <IonIcon icon={shieldCheckmarkOutline} />
                    <span>Confirmar Pago Seguro</span>
                  </>
                )}
              </button>

              <button 
                className="cm-back-btn"
                onClick={() => setShowCheckout(false)}
                disabled={isProcessingOrder}
              >
                ← Volver al carrito
              </button>
            </div>
          ) : cart.length === 0 ? (
            /* ─── Empty State ─── */
            <div className="cm-empty">
              <div className="cm-empty-visual">
                <div className="cm-empty-ring cm-empty-ring-1" />
                <div className="cm-empty-ring cm-empty-ring-2" />
                <div className="cm-empty-icon-circle">
                  <IonIcon icon={bagHandleOutline} />
                </div>
              </div>
              <h3 className="cm-empty-title">Tu carrito está vacío</h3>
              <p className="cm-empty-desc">
                Explora nuestro catálogo y encuentra los mejores productos de tecnología
              </p>
              <button className="cm-empty-cta" onClick={onDismiss}>
                <IonIcon icon={sparklesOutline} />
                Explorar catálogo
              </button>
            </div>
          ) : (
            /* ─── Cart Items ─── */
            <div className="cm-items">
              {cart.map((item, idx) => (
                <div
                  className={`cm-item ${removingId === item.id ? 'cm-item-removing' : ''}`}
                  key={item.id}
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  <div className="cm-item-img-wrap">
                    {item.imagen ? (
                      <img
                        src={`${BASE_URL}/productos/${item.imagen}`}
                        alt={item.nombre}
                        className="cm-item-img"
                      />
                    ) : (
                      <div className="cm-item-img-fallback">
                        <IonIcon icon={imageOutline} />
                      </div>
                    )}
                  </div>

                  <div className="cm-item-body">
                    <div className="cm-item-top-row">
                      <div className="cm-item-text">
                        <p className="cm-item-brand">{item.marca}</p>
                        <h4 className="cm-item-name">{item.nombre}</h4>
                      </div>
                      <button
                        className="cm-item-remove"
                        onClick={() => handleRemove(item.id)}
                        aria-label="Eliminar producto"
                      >
                        <IonIcon icon={trashOutline} />
                      </button>
                    </div>

                    <div className="cm-item-bottom-row">
                      <div className="cm-item-price-wrap">
                        {item.descuento > 0 && <span className="cm-item-old-price">{formatPrice(item.precio)}</span>}
                        <p className="cm-item-price" style={item.descuento > 0 ? { color: '#3b82f6' } : {}}>
                          {formatPrice(item.precio * (1 - (item.descuento || 0) / 100))}
                        </p>
                      </div>

                      <div className="cm-qty-control">
                        <button
                          className="cm-qty-btn cm-qty-minus"
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Reducir cantidad"
                        >
                          <IonIcon icon={removeOutline} />
                        </button>
                        <span className="cm-qty-value">{item.cantidad}</span>
                        <button
                          className="cm-qty-btn cm-qty-plus"
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Aumentar cantidad"
                        >
                          <IonIcon icon={addOutline} />
                        </button>
                      </div>
                    </div>

                    <p className="cm-item-subtotal">
                      Subtotal: {formatPrice(item.precio * (1 - (item.descuento || 0) / 100) * item.cantidad)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Checkout */}
        {cart.length > 0 && !showCheckout && (
          <div className="cm-footer">
            <div className="cm-footer-summary">
              <div className="cm-summary-row">
                <span>Subtotal ({cartItemCount} artículos)</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="cm-summary-row cm-summary-row-shipping">
                <span>Envío</span>
                <span className="cm-free-tag">Gratis</span>
              </div>
              <div className="cm-divider" />
              <div className="cm-summary-row cm-summary-total" style={{ alignItems: 'flex-start' }}>
                <span style={{ paddingTop: '8px' }}>Total</span>
                <div style={{ textAlign: 'right' }}>
                  <span className="cm-total-amount">{formatPrice(cartTotal)}</span>
                  {/* API #1: Mostrar equivalencia en USD en el carrito también */}
                  {exchangeRateUSD && (
                     <span style={{ display: 'block', fontSize: '13px', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>
                       ≈ ${(cartTotal * exchangeRateUSD).toFixed(2)} USD
                     </span>
                  )}
                </div>
              </div>
            </div>

            <button 
              className="cm-checkout-btn" 
              onClick={() => {
                if (onRequireAuth && !onRequireAuth()) {
                  onDismiss();
                  return;
                }
                setShowCheckout(true);
              }}>
              <span>Proceder al pago</span>
              <IonIcon icon={chevronForwardOutline} />
            </button>

            <button className="cm-clear-btn" onClick={clearCart}>
              <IonIcon icon={trashOutline} style={{ fontSize: 14 }} />
              Vaciar carrito
            </button>
          </div>
        )}
      </div>

      {isProcessingOrder && (
        <div className="cm-loading-overlay">
          <div className="cm-loading-content">
            <div className="cm-loading-spinner" />
            <p>Procesando tu pedido...</p>
            <span>Validando token seguro (API Externa)...</span>
          </div>
        </div>
      )}

      {isReceiptOpen && orderResult && (
        <ReceiptModal 
          isOpen={isReceiptOpen} 
          onClose={() => {
            setIsReceiptOpen(false);
            onDismiss();
          }} 
          orderData={orderResult} 
        />
      )}
    </div>
  );
};

export default CartModal;
