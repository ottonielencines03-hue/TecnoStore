import React, { useState, useRef } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  closeOutline, trashOutline, addOutline, removeOutline, 
  bagHandleOutline, sparklesOutline, arrowForwardOutline,
  imageOutline, chevronForwardOutline
} from 'ionicons/icons';
import { useCart } from '../context/CartContext';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import axios from 'axios';
import ReceiptModal from './ReceiptModal';
import './CartModal.css';

const CartModal = ({ isOpen: propIsOpen, onDismiss: propOnDismiss, onRequireAuth }) => {
  const { 
    cart, removeFromCart, updateQuantity, cartTotal, cartItemCount, uniqueItemCount,
    clearCart, showToast, isCartOpen, setIsCartOpen, user 
  } = useCart();
  
  const isOpen = propIsOpen !== undefined ? propIsOpen : isCartOpen;
  const onDismiss = propOnDismiss || (() => setIsCartOpen(false));
  const [removingId, setRemovingId] = useState(null);
  const [showPaypal, setShowPaypal] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isPaypalLoading, setIsPaypalLoading] = useState(true);
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  const overlayRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onDismiss();
  };

  const handleRemove = async (id) => {
    setRemovingId(id);
    // Wait for animation, then actually remove
    setTimeout(async () => {
      await removeFromCart(id);
      setRemovingId(null);
    }, 350);
  };

  const formatPrice = (val) =>
    Number(val).toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 });

  if (!isOpen) return null;

  return (
    <div className="cm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="cm-drawer">
        {/* Decorative top gradient */}
        <div className="cm-top-gradient" />

        {/* Drag handle */}
        <div className="cm-handle-bar">
          <div className="cm-handle" />
        </div>

        {/* Header */}
        <div className="cm-header">
          <div className="cm-header-left">
            <div className="cm-header-icon-wrap">
              <IonIcon icon={bagHandleOutline} />
            </div>
            <div>
              <h2 className="cm-title">Mi Carrito</h2>
              <p className="cm-subtitle">
                {uniqueItemCount === 0
                  ? 'Sin productos'
                  : `${uniqueItemCount} ${uniqueItemCount === 1 ? 'producto' : 'productos'}`}
              </p>
            </div>
          </div>
          <button className="cm-close" onClick={onDismiss} aria-label="Cerrar carrito">
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        {/* Body */}
        <div className="cm-body">
          {cart.length === 0 ? (
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
            <div className="cm-items">
              {cart.map((item, idx) => (
                <div
                  className={`cm-item ${removingId === item.id ? 'cm-item-removing' : ''}`}
                  key={item.id}
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  {/* Product image */}
                  <div className="cm-item-img-wrap">
                    {item.imagen ? (
                      <img
                        src={`http://localhost:8000/productos/${item.imagen}`}
                        alt={item.nombre}
                        className="cm-item-img"
                      />
                    ) : (
                      <div className="cm-item-img-fallback">
                        <IonIcon icon={imageOutline} />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
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
                        <p className="cm-item-price" style={item.descuento > 0 ? { color: '#ef4444' } : {}}>
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

                    {/* Subtotal por item */}
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
        {cart.length > 0 && (
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
              <div className="cm-summary-row cm-summary-total">
                <span>Total</span>
                <span className="cm-total-amount">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {!showPaypal ? (
              <button 
                className="cm-checkout-btn" 
                onClick={() => {
                  if (onRequireAuth && !onRequireAuth()) {
                    onDismiss();
                    return;
                  }
                  setShowPaypal(true);
                }}>
                <span>Proceder al pago con PayPal</span>
                <IonIcon icon={chevronForwardOutline} />
              </button>
            ) : (
              <div style={{ marginTop: '16px', position: 'relative', zIndex: 1100, minHeight: '150px' }}>
                {(isPaypalLoading || isPending) && !isRejected && (
                  <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
                    Cargando métodos de pago seguros...
                  </p>
                )}
                
                {isRejected && (
                  <div style={{ textAlign: 'center', padding: '20px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                    <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>
                      Error al cargar PayPal.
                    </p>
                    <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '16px' }}>
                      Por favor, revisa la <b>consola de tu navegador (F12)</b> para ver el error exacto (ej. Client ID inválido).
                    </p>
                    <button 
                      onClick={() => window.location.reload()}
                      style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Recargar página
                    </button>
                  </div>
                )}
                
                {isResolved && (
                  <PayPalButtons 
                    style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
                    onInit={() => setIsPaypalLoading(false)}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: { 
                          currency_code: "MXN",
                          value: cartTotal.toFixed(2).toString() 
                        }
                      }]
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then(async (details) => {
                      try {
                        const orderData = {
                          user_id: user?.id || 1,
                          paypal_id: details.id,
                          total: cartTotal,
                          items: cart.map(item => ({
                            producto_id: item.id,
                            cantidad: item.cantidad,
                            precio_unitario: item.precio * (1 - (item.descuento || 0) / 100),
                          }))
                        };

                        const response = await axios.post('http://localhost:8000/api/ordenes', orderData);
                        
                        if (response.data.status === 'success') {
                          setOrderResult(response.data.order);
                          setIsReceiptOpen(true);
                          clearCart();
                          setShowPaypal(false);
                          if (showToast) showToast('¡Compra realizada con éxito!', 'success');
                        }
                      } catch (error) {
                        console.error("Error al guardar la orden:", error);
                        if (showToast) showToast('Pago procesado, pero hubo un error al registrar la orden.', 'warning');
                      }
                    });
                  }}
                  onError={(err) => {
                    console.error("PayPal Error:", err);
                    if (showToast) showToast('Hubo un error al cargar PayPal. Intenta de nuevo.', 'danger');
                    setShowPaypal(false);
                  }}
                />
                )}
                <button 
                  style={{ 
                    width: '100%', 
                    background: 'transparent', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    padding: '8px', 
                    marginTop: '12px',
                    color: '#64748b',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowPaypal(false)}
                >
                  Cancelar y volver
                </button>
              </div>
            )}

            <button className="cm-clear-btn" onClick={clearCart}>
              <IonIcon icon={trashOutline} style={{ fontSize: 14 }} />
              Vaciar carrito
            </button>
          </div>
        )}
      </div>

      {isReceiptOpen && orderResult && (
        <ReceiptModal 
          isOpen={isReceiptOpen} 
          onClose={() => {
            setIsReceiptOpen(false);
            onDismiss(); // Cerrar el carrito también
          }} 
          orderData={orderResult} 
        />
      )}
    </div>
  );
};

export default CartModal;
