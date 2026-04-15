import React, { useState, useEffect } from "react";
import { IonIcon, IonModal } from '@ionic/react';
import { addOutline, checkmarkOutline, closeOutline, imageOutline } from 'ionicons/icons';
import './ProductoCard.css';

const CAT_COLORS = {
  Laptops:     ["#2b6cb0","#63b3ed"],
  Smartphones: ["#6b46c1","#b794f4"],
  Audio:       ["#b7791f","#f6ad55"],
  Monitores:   ["#276749","#68d391"],
  Accesorios:  ["#9b2c2c","#fc8181"],
  Wearables:   ["#2c5282","#76e4f7"],
};

const ProductoCard = ({ producto, index = 0 }) => {
  const [showModal, setShowModal] = useState(false);
  const [proveedor, setProveedor] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

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

  const handleAdd = (e) => {
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
            <span className="pc-badge" style={{ background: 'rgba(255,255,255,.92)', color: c1, border: `1px solid ${c1}33` }}>
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
            <div>
              <p className="pc-price-label">Precio</p>
              <p className="pc-price">{price}</p>
            </div>

            <button
              className="pc-add-btn-circle"
              style={{ borderColor: `${c1}44`, background: `${c1}0f`, color: c1 }}
              onClick={handleAdd}
            >
              <IonIcon icon={added ? checkmarkOutline : addOutline} style={{ fontSize: '18px' }} />
            </button>
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
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="pc-detail-modal" initialBreakpoint={1} breakpoints={[0, 1]}>
        <div className="pc-modal-box">
          {/* Close handle */}
          <div className="pc-modal-handle" />

          {/* Imagen modal */}
          <div className="pc-modal-img" style={{ background: `linear-gradient(145deg, ${c1}0d, ${c2}18)` }}>
            {producto.imagen && !imgError
              ? <img src={`http://localhost:8000/productos/${producto.imagen}`} alt={producto.nombre} />
              : <div className="pc-modal-img-placeholder">
                  <IonIcon icon={imageOutline} style={{ fontSize: '64px', color: c1, opacity: 0.18 }} />
                </div>
            }
            <div className="pc-modal-img-gradient" />

            <button className="pc-modal-close" onClick={() => setShowModal(false)}>
              <IonIcon icon={closeOutline} style={{ fontSize: '16px' }} />
            </button>
          </div>

          {/* Contenido modal */}
          <div className="pc-modal-content">
            <p className="pc-modal-marca">
              {producto.marca}
              {producto.modelo && <span className="pc-modal-modelo"> · {producto.modelo}</span>}
            </p>
            <h2 className="pc-modal-name">{producto.nombre}</h2>
            <p className="pc-modal-price" style={{ backgroundImage: `linear-gradient(90deg, ${c1}, ${c2})` }}>
              {price}
            </p>

            {producto.descripcion && (
              <p className="pc-modal-desc">{producto.descripcion}</p>
            )}

            {/* Proveedor en modal */}
            <div className="pc-modal-prov">
              <p className="pc-modal-prov-label">Proveedor</p>
              {proveedor ? (
                <>
                  <div className="pc-modal-prov-header">
                    <div className="pc-modal-prov-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                      {provIni}
                    </div>
                    <div>
                      <p className="pc-modal-prov-name">{proveedor.name}</p>
                      <p className="pc-modal-prov-company">{proveedor.empresa}</p>
                    </div>
                  </div>

                  <div className="pc-modal-prov-grid">
                    {[["Email", proveedor.email], ["Teléfono", proveedor.telefono]].map(([lbl, val]) => (
                      <div key={lbl} className="pc-chip">
                        <p className="pc-chip-label">{lbl}</p>
                        <p className="pc-chip-value">{val || "—"}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="pc-prov-loading"><span>Cargando proveedor...</span></div>
              )}
            </div>

            <button className="pc-cta-btn">Agregar al carrito →</button>
          </div>
        </div>
      </IonModal>
    </div>
  );
};

export default ProductoCard;
