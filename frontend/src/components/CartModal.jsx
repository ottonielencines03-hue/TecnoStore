import React, { useState, useRef } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  closeOutline, trashOutline, addOutline, removeOutline, 
  bagHandleOutline, sparklesOutline, arrowForwardOutline,
  imageOutline, chevronForwardOutline
} from 'ionicons/icons';
import { useCart } from '../context/CartContext';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import './CartModal.css';

const CartModal = ({ isOpen, onDismiss, onRequireAuth }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartItemCount, clearCart } = useCart();
  const [removingId, setRemovingId] = useState(null);
  const [showPaypal, setShowPaypal] = useState(false);
  const overlayRef = useRef(null);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onDismiss();
  };

  const handleRemove = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
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
                {cartItemCount === 0
                  ? 'Sin productos'
                  : `${cartItemCount} ${cartItemCount === 1 ? 'producto' : 'productos'}`}
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
                      <p className="cm-item-price">{formatPrice(item.precio)}</p>

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
                          onClick={async () => {
                            const res = await updateQuantity(item.id, 1);
                            if (res && res.success === false) {
                              alert(res.message);
                            }
                          }}
                          aria-label="Aumentar cantidad"
                        >
                          <IonIcon icon={addOutline} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal por item */}
                    <p className="cm-item-subtotal">
                      Subtotal: {formatPrice(item.precio * item.cantidad)}
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
                    onDismiss(); // Cierra el carrito para que vea el modal de login
                    return;
                  }
                  setShowPaypal(true);
                }}>
                <span>Proceder al pago con PayPal</span>
                <IonIcon icon={chevronForwardOutline} />
              </button>
            ) : (
              <div style={{ marginTop: '16px', position: 'relative', zIndex: 1, minHeight: '150px' }}>
                <PayPalScriptProvider options={{ "client-id": "test", currency: "MXN" }}>
                  <PayPalButtons 
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{
                          amount: { value: cartTotal.toString() }
                        }]
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order.capture().then((details) => {
                        clearCart();
                        onDismiss();
                        setTimeout(() => alert("¡Pago procesado correctamente!"), 300);
                      });
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}

            <button className="cm-clear-btn" onClick={clearCart}>
              <IonIcon icon={trashOutline} style={{ fontSize: 14 }} />
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
