import React, { useEffect, useState } from "react";
import { 
  IonContent, 
  IonPage, 
  IonIcon,
  useIonRouter,
  IonSpinner
} from '@ionic/react';
import { arrowBackOutline, searchOutline, cubeOutline } from 'ionicons/icons';
import ProductoCard from "../components/ProductoCard";
import './Productos.css';

const Productos = () => {
  const router = useIonRouter();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoria] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/productos")
      .then(r => r.json())
      .then(data => {
        setProductos(data);
        setCategorias(["Todos", ...new Set(data.map(p => p.categoria).filter(Boolean))]);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filtrados = productos
    .filter(p => categoriaSeleccionada === "Todos" || p.categoria === categoriaSeleccionada)
    .filter(p => {
      const q = busqueda.toLowerCase().trim();
      return !q || p.nombre?.toLowerCase().includes(q) || p.marca?.toLowerCase().includes(q);
    });

  return (
    <IonPage>
      <IonContent fullscreen className="pg-ion-content">
        <div className="pg-root pg-bg">
          {/* Header */}
          <header className="pg-header">
            <div className="pg-header-inner">
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <button className="pg-back-btn" onClick={() => router.goBack()}>
                  <IonIcon icon={arrowBackOutline} />
                </button>
                <div>
                  <h1 className="pg-title">Catálogo</h1>
                  <div className="pg-stat-wrapper">
                    <span className="pg-stat">
                      <IonIcon icon={cubeOutline} style={{ fontSize: '12px' }}/>
                      {loading ? "—" : `${filtrados.length} productos`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pg-search-wrapper">
                <IonIcon icon={searchOutline} className="pg-search-icon" />
                <input
                  className="pg-search"
                  type="text"
                  placeholder="Buscar productos o marcas..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="pg-main">
            {/* Category Pills */}
            <div className="pg-pills">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`pg-pill ${categoriaSeleccionada === cat ? "pg-pill-active" : "pg-pill-inactive"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="pg-loading">
                <IonSpinner name="crescent" color="primary" />
                <span>Cargando productos...</span>
              </div>
            ) : filtrados.length > 0 ? (
              <div className="pg-grid">
                {filtrados.map((p, i) => (
                  <ProductoCard key={p.id} producto={p} index={i} />
                ))}
              </div>
            ) : (
              <div className="pg-empty">
                <div className="pg-empty-icon">
                  <IonIcon icon={searchOutline} style={{ fontSize: '28px' }}/>
                </div>
                <p className="pg-empty-text">
                  Sin resultados para <strong>"{busqueda || categoriaSeleccionada}"</strong>
                </p>
              </div>
            )}
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Productos;
