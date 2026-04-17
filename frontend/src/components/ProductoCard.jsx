import React, { useState, useEffect } from "react";
import { IonIcon, IonModal } from '@ionic/react';
import { addOutline, checkmarkOutline, closeOutline, imageOutline, cartOutline, flashOutline, callOutline, chatbubblesOutline } from 'ionicons/icons';
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

  const price = Number(producto.precio).toLocaleString("es-MX", {
    style: "currency", currency: "MXN", minimumFractionDigits: 0,
  });

  const [c1, c2] = CAT_COLORS[producto.categoria] ?? ["#2b6cb0","#63b3ed"];
  const provIni = proveedor?.name?.charAt(0).toUpperCase() ?? "?";

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (onRequireAuth && !onRequireAuth()) return;
    const res = await addToCart(producto);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      alert(res.message);
    }
  };

  const handleAddFromModal = async () => {
    if (onRequireAuth && !onRequireAuth()) return;
    const res = await addToCart(producto);
    if (res.success) {
      setShowModal(false);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="pc-root" style={{ animationDelay: `${index * 0.06}s` }}>
      {/* TARJETA */}
      <div className="pc-card-inner" onClick={() => setShowModal(true)}>
        {/* Imagen */}
        <div className="pc-img-container" style={{ background: `linear-gradient(145deg, ${c1}0d, ${c2}18)` }}>
          {producto.imagen && !imgError ? (
            <img
              src={`http://localhost:8000/productos/${producto.imagen}`}
              alt={producto.nombre}
              onError={() => setImgError(true)}
              className="pc-img"
            />
          ) : (
            <div className="pc-img-placeholder">
              <IonIcon icon={imageOutline} style={{ fontSize: '48px', color: c1, opacity: 0.2 }} />
            </div>
          )}

          {producto.categoria && (
            <span className="pc-badge" style={{ background: 'rgba(5, 8, 16, 0.85)', color: c2, border: `1px solid ${c1}44`, backdropFilter: 'blur(4px)' }}>
              {producto.categoria}
            </span>
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
              <p className="pc-price">{price}</p>
            </div>

            <div className="pc-footer-actions">
              <button
                className="pc-add-btn-full"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
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

      {/* MODAL - Product Detail */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="pc-detail-modal">
        <div className="pc-modal-box">
          {/* Close handle */}
          <div className="pc-modal-handle" />

          {/* Imagen modal */}
          <div className="pc-modal-img" style={{ background: `linear-gradient(145deg, ${c1}1a, ${c2}25)` }}>
            {producto.imagen && !imgError
              ? <img src={`http://localhost:8000/productos/${producto.imagen}`} alt={producto.nombre} className="pc-modal-img-tag" />
              : <div className="pc-modal-img-placeholder">
                  <IonIcon icon={imageOutline} style={{ fontSize: '72px', color: c1, opacity: 0.25 }} />
                </div>
            }
            <div className="pc-modal-img-overlay" />
            <div className="pc-category-pill" style={{ background: `${c1}dd`, borderColor: `${c1}` }}>
               {producto.categoria}
            </div>

            <button className="pc-modal-close-glass" onClick={() => setShowModal(false)} aria-label="Cerrar detalle">
              <IonIcon icon={closeOutline} />
            </button>
          </div>

          {/* Contenido modal */}
          <div className="pc-modal-content">
            <div className="pc-modal-header-meta">
              <p className="pc-modal-marca">
                {producto.marca}
                {producto.modelo && <span className="pc-modal-modelo"> · {producto.modelo}</span>}
              </p>
              <div className={`pc-modal-stock ${producto.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                <div className="stock-dot" />
                {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
              </div>
            </div>

            <h2 className="pc-modal-name">{producto.nombre}</h2>
            
            <div className="pc-modal-price-tag">
              <span className="pc-modal-currency">MXN</span>
              <span className="pc-modal-amount">{Number(producto.precio).toLocaleString('es-MX', { minimumFractionDigits: 0 })}</span>
            </div>

            {producto.descripcion && (
              <div className="pc-modal-desc-wrap">
                <p className="pc-modal-desc-label">Descripción</p>
                <p className="pc-modal-desc">{producto.descripcion}</p>
              </div>
            )}

            {/* Proveedor en modal */}
            <div className="pc-modal-prov">
              <div className="pc-modal-prov-header">
                <div className="pc-modal-prov-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                  {provIni}
                </div>
                <div>
                  <p className="pc-modal-prov-name">{proveedor ? proveedor.name : 'Cargando...'}</p>
                  <p className="pc-modal-prov-company">{proveedor ? proveedor.empresa : ''}</p>
                </div>
              </div>

              {proveedor && (
                <div className="pc-modal-prov-contact-row">
                  <div className="pc-contact-item">
                    <IonIcon icon={chatbubblesOutline} style={{ color: c1 }} />
                    <span>{proveedor.email}</span>
                  </div>
                  <div className="pc-contact-item">
                    <IonIcon icon={callOutline} style={{ color: c1 }} />
                    <span>{proveedor.telefono}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pc-modal-actions">
              <button 
                className={`pc-cta-btn primary ${producto.stock <= 0 ? 'disabled' : ''}`}
                onClick={() => { if(producto.stock > 0) handleAddFromModal(); }}
                disabled={producto.stock <= 0}
              >
                <div className="cta-icon-wrap">
                  <IonIcon icon={added ? checkmarkOutline : cartOutline} />
                </div>
                <span>{added ? '¡Agregado con éxito!' : (producto.stock > 0 ? 'Añadir al carrito' : 'Producto Agotado')}</span>
              </button>
            </div>
          </div>
        </div>
      </IonModal>
    </div>
  );
};

export default ProductoCard;
