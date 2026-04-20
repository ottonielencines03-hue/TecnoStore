import React, { useState, useEffect } from "react";
import { IonIcon, IonModal } from '@ionic/react';
import {
  addOutline, checkmarkOutline, closeOutline, imageOutline,
  cartOutline, flashOutline, callOutline, chatbubblesOutline,
  cubeOutline, pricetagOutline, storefrontOutline, shieldCheckmarkOutline,
  sparklesOutline
} from 'ionicons/icons';
import { useCart } from '../context/CartContext';
import './ProductoCard.css';

const CAT_COLORS = {
  Laptops:     ["#2b6cb0","#63b3ed"],
  Smartphones: ["#6b46c1","#b794f4"],
  Audio:       ["#b7791f","#f6ad55"],
  Monitores:   ["#276749","#68d391"],
  Accesorios:  ["#9b2c2c","#fc8181"],
  Wearables:   ["#2c5282","#76e4f7"],
};

const ProductoCard = ({ producto, index = 0, onRequireAuth }) => {
  const [showModal, setShowModal] = useState(false);
  const [proveedor, setProveedor] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (producto.proveedor_id) {
      fetch(`http://localhost:8000/api/proveedores/${producto.proveedor_id}`)
        .then(r => r.json())
        .then(setProveedor)
        .catch(console.error);
    }
  }, [producto.proveedor_id]);

  const [c1, c2] = CAT_COLORS[producto.categoria] ?? ["#2b6cb0","#63b3ed"];
  const provIni = proveedor?.name?.charAt(0).toUpperCase() ?? "?";

  const hasDiscount = producto.descuento > 0;
  const discountedPrice = hasDiscount ? producto.precio * (1 - producto.descuento / 100) : producto.precio;
  
  const formattedPrice = Number(discountedPrice).toLocaleString("es-MX", {
    style: "currency", currency: "MXN", minimumFractionDigits: 0,
  });
  const oldPrice = Number(producto.precio).toLocaleString("es-MX", {
    style: "currency", currency: "MXN", minimumFractionDigits: 0,
  });

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (onRequireAuth && !onRequireAuth()) return;
    const res = await addToCart(producto);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleAddFromModal = async () => {
    if (onRequireAuth && !onRequireAuth()) return;
    const res = await addToCart(producto);
    if (res.success) {
      setAdded(true);
      setTimeout(() => { setAdded(false); setShowModal(false); }, 1200);
    }
  };

  const imgSrc = `http://localhost:8000/productos/${producto.imagen}`;

  return (
    <div className="pc-root" style={{ animationDelay: `${index * 0.06}s` }}>
      {/* TARJETA */}
      <div className="pc-card-inner" onClick={() => setShowModal(true)}>
        {/* Imagen */}
        <div className="pc-img-container" style={{ background: `linear-gradient(145deg, ${c1}0d, ${c2}18)` }}>
          {producto.imagen && !imgError ? (
            <img
              src={imgSrc}
              alt={producto.nombre}
              onError={() => setImgError(true)}
              className="pc-img"
            />
          ) : (
            <div className="pc-img-placeholder">
              <IonIcon icon={imageOutline} style={{ fontSize: '48px', color: c1, opacity: 0.2 }} />
            </div>
          )}

          <div className="pc-img-gradient" />
        </div>

        {/* Cuerpo */}
        <div className="pc-body">
          <p className="pc-marca">{producto.marca}</p>
          <h2 className="pc-name">{producto.nombre}</h2>
          <p className="pc-modelo">{producto.modelo}</p>

          <div className="pc-footer">
            <div className="pc-price-wrap">
              <p className="pc-price-label">Precio</p>
              {hasDiscount && <span className="pc-old-price">{oldPrice}</span>}
              <p className="pc-price" style={hasDiscount ? { color: '#ef4444' } : {}}>{formattedPrice}</p>
            </div>

            <div className="pc-footer-actions">
              <button
                className="pc-add-btn-full"
                style={{ background: `linear-gradient(135deg, #3b82f6, #1d4ed8)` }}
                onClick={handleAdd}
              >
                <IonIcon icon={added ? checkmarkOutline : cartOutline} />
                <span>{added ? '¡Agregado!' : 'Añadir'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Strip proveedor */}
        <div className="pc-prov-strip">
          {proveedor ? (
            <>
              <div className="pc-prov-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                {provIni}
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="pc-prov-name">{proveedor.name}</p>
                <p className="pc-prov-company">{proveedor.empresa}</p>
              </div>
            </>
          ) : (
            <div className="pc-prov-loading">
              <span>Cargando proveedor...</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODAL — Premium Product Detail                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="pdm-modal">
        <div className="pdm-wrapper">
          {/* ── Close Button ── */}
          <button className="pdm-close" onClick={() => setShowModal(false)} aria-label="Cerrar">
            <IonIcon icon={closeOutline} />
          </button>

          {/* ── Scrollable Content ── */}
          <div className="pdm-scroll">
            {/* Image Section */}
            <div className="pdm-hero" style={{ background: `linear-gradient(160deg, ${c1}12, ${c2}1a)` }}>
              <div className="pdm-hero-glow" style={{ background: `radial-gradient(ellipse at 50% 80%, ${c1}25, transparent 70%)` }} />
              {producto.imagen && !imgError ? (
                <img src={imgSrc} alt={producto.nombre} className="pdm-hero-img" />
              ) : (
                <div className="pdm-hero-placeholder">
                  <IonIcon icon={imageOutline} style={{ fontSize: '80px', color: c1, opacity: 0.18 }} />
                </div>
              )}
              {hasDiscount && (
                <div className="pdm-discount-badge">
                  -{producto.descuento}% OFF
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="pdm-body">

              {/* Header row: brand + stock */}
              <div className="pdm-meta-row">
                <p className="pdm-brand">
                  {producto.marca}
                  {producto.modelo && <span className="pdm-model"> — {producto.modelo}</span>}
                </p>
                <div className={`pdm-stock ${producto.stock > 0 ? 'pdm-in' : 'pdm-out'}`}>
                  <span className="pdm-stock-dot" />
                  {producto.stock > 0 ? `${producto.stock} en stock` : 'Agotado'}
                </div>
              </div>

              {/* Name */}
              <h2 className="pdm-name">{producto.nombre}</h2>

              {/* Price */}
              <div className="pdm-price-row">
                <span className="pdm-currency">MXN</span>
                {hasDiscount && <span className="pdm-old-price">{oldPrice}</span>}
                <span className="pdm-amount" style={{ color: hasDiscount ? '#ef4444' : c2 }}>
                  {Number(discountedPrice).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                </span>
              </div>

              {/* Specs grid */}
              <div className="pdm-specs">
                {producto.marca && (
                  <div className="pdm-spec-chip">
                    <IonIcon icon={pricetagOutline} style={{ color: c2 }} />
                    <div>
                      <span className="pdm-spec-label">Marca</span>
                      <span className="pdm-spec-value">{producto.marca}</span>
                    </div>
                  </div>
                )}
                {producto.modelo && (
                  <div className="pdm-spec-chip">
                    <IonIcon icon={cubeOutline} style={{ color: c2 }} />
                    <div>
                      <span className="pdm-spec-label">Modelo</span>
                      <span className="pdm-spec-value">{producto.modelo}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {producto.descripcion && (
                <div className="pdm-desc-section">
                  <h3 className="pdm-section-title">Descripción</h3>
                  <p className="pdm-desc">{producto.descripcion}</p>
                </div>
              )}

              {/* Provider */}
              <div className="pdm-provider">
                <h3 className="pdm-section-title">Proveedor</h3>
                <div className="pdm-prov-card">
                  <div className="pdm-prov-top">
                    <div className="pdm-prov-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                      {provIni}
                    </div>
                    <div className="pdm-prov-info">
                      <p className="pdm-prov-name">{proveedor ? proveedor.name : 'Cargando...'}</p>
                      <p className="pdm-prov-company">{proveedor ? proveedor.empresa : ''}</p>
                    </div>
                  </div>
                  {proveedor && (
                    <div className="pdm-prov-contacts">
                      <div className="pdm-contact-chip">
                        <IonIcon icon={chatbubblesOutline} style={{ color: c2 }} />
                        <span>{proveedor.email}</span>
                      </div>
                      <div className="pdm-contact-chip">
                        <IonIcon icon={callOutline} style={{ color: c2 }} />
                        <span>{proveedor.telefono}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Sticky CTA ── */}
          <div className="pdm-cta-bar">
            <div className="pdm-cta-price-mini">
              <span className="pdm-cta-label">Total</span>
              <span className="pdm-cta-amount">{formattedPrice}</span>
            </div>
            <button
              className={`pdm-cta-btn ${producto.stock <= 0 ? 'pdm-cta-disabled' : ''} ${added ? 'pdm-cta-success' : ''}`}
              onClick={() => { if (producto.stock > 0) handleAddFromModal(); }}
              disabled={producto.stock <= 0}
              style={!added ? { background: `linear-gradient(135deg, #3b82f6, #1d4ed8)`, boxShadow: `0 6px 24px rgba(59, 130, 246, 0.3)` } : {}}
            >
              <IonIcon icon={added ? checkmarkOutline : cartOutline} />
              <span>{added ? '¡Agregado!' : (producto.stock > 0 ? 'Añadir al carrito' : 'Agotado')}</span>
            </button>
          </div>
        </div>
      </IonModal>
    </div>
  );
};

export default ProductoCard;
