import React, { useState, useEffect } from "react";
import { 
  IonContent, 
  IonPage, 
  IonIcon,
  useIonRouter,
  IonModal,
  IonAlert,
  IonToast,
  IonSpinner
} from '@ionic/react';
import { 
  flashOutline, 
  arrowBackOutline,
  searchOutline,
  closeOutline,
  pencilOutline,
  trashOutline,
  alertCircleOutline,
  imageOutline,
  cubeOutline
} from 'ionicons/icons';
import './GestionarProductos.css';

const GestionarProductos = () => {
  const router = useIonRouter();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(false);
  const [form, setForm] = useState({});
  const [nuevaImagen, setNuevaImagen] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user?.id || !user.empresa) {
       router.push('/login', 'back', 'replace');
       return;
    }
    fetch(`http://localhost:8000/api/productos/proveedor/${user.id}`)
      .then(r => r.json())
      .then(data => { setProductos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router, user?.id]);

  const abrirEdicion = (p) => {
    setForm({
      nombre: p.nombre || "",
      categoria: p.categoria || "",
      marca: p.marca || "",
      modelo: p.modelo || "",
      precio: p.precio || "",
      stock: p.stock || "",
      descripcion: p.descripcion || "",
      tarjeta_pago: p.tarjeta_pago || "",
    });
    setNuevaImagen(null);
    setEditando(p);
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const fd = new FormData();
      fd.append("nombre", form.nombre);
      fd.append("categoria", form.categoria);
      fd.append("marca", form.marca || "");
      fd.append("modelo", form.modelo || "");
      fd.append("precio", form.precio);
      fd.append("stock", form.stock || 0);
      fd.append("descripcion", form.descripcion || "");
      if (form.tarjeta_pago) fd.append("tarjeta_pago", form.tarjeta_pago);
      if (nuevaImagen) fd.append("imagen", nuevaImagen);

      const res = await fetch(`http://localhost:8000/api/productos/${editando.id}`, {
        method: "POST", // Laravel accepts POST for FormData with files + _method inside but mostly just POST works for update in this specific API structure
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        const msg = Object.values(err.messages || {}).flat().join("\n");
        throw new Error(msg || "Error al actualizar");
      }

      const data = await res.json();
      setProductos(prev => prev.map(p => p.id === editando.id ? data.producto : p));
      setEditando(null);
      setToastMessage("Producto actualizado");
      setToastColor('success');
      setShowToast(true);
    } catch (err) {
      setToastMessage(err.message);
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    setEliminandoId(true);
    try {
      const res = await fetch(`http://localhost:8000/api/productos/${eliminando.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      
      setProductos(prev => prev.filter(p => p.id !== eliminando.id));
      setEliminando(null);
      setToastMessage("Producto eliminado");
      setToastColor("success");
      setShowToast(true);
    } catch (err) {
      setToastMessage(err.message);
      setToastColor("danger");
      setShowToast(true);
    } finally {
      setEliminandoId(false);
    }
  };

  const filtrados = productos.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <IonPage>
      <IonContent fullscreen className="gp-ion-content">
        <div className="gp-wrap">
          <div className="gp-dots" />
          <div className="gp-orb gp-orb-1" />
          <div className="gp-orb gp-orb-2" />

          {/* HEADER */}
          <header className="gp-header">
            <div className="gp-header-inner">
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div className="gp-logo"><IonIcon icon={flashOutline} /></div>
                <div>
                  <p className="gp-htitle">Gestionar Productos</p>
                  <p className="gp-hsub">Edita o elimina tus productos publicados</p>
                </div>
              </div>
              <button className="gp-backbtn" onClick={() => router.push('/proveedor')}>
                <IonIcon icon={arrowBackOutline} style={{ marginRight: '6px' }} />
                Volver al panel
              </button>
            </div>
          </header>

          {/* MAIN */}
          <div className="gp-main">
            {/* Toolbar */}
            <div className="gp-toolbar">
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div className="gp-searchwrap">
                  <IonIcon icon={searchOutline} className="gp-searchico" />
                  <input
                    className="gp-search"
                    type="text"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
              <span className="gp-count">
                {loading ? "Cargando..." : `${filtrados.length} producto${filtrados.length !== 1 ? "s" : ""}`}
              </span>
            </div>

            {/* Content Card / Table */}
            <div className="gp-card">
              {loading ? (
                <div className="gp-loading-container">
                  <IonSpinner name="crescent" color="primary" />
                  <span style={{ fontSize:14, color:"#9ca3af", marginLeft: '10px' }}>Cargando productos...</span>
                </div>
              ) : filtrados.length === 0 ? (
                <div className="gp-empty">
                  <div className="gp-emptyico"><IonIcon icon={cubeOutline} style={{ fontSize: '32px' }}/></div>
                  <p style={{ fontSize:15, fontWeight:500, color:"#9ca3af" }}>
                    {busqueda ? "Sin resultados para tu búsqueda" : "Aún no tienes productos publicados"}
                  </p>
                  <button
                    onClick={() => router.push('/proveedor')}
                    className="gp-btn-primary"
                  >
                    Publicar primer producto
                  </button>
                </div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table className="gp-table">
                    <thead className="gp-thead">
                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th style={{ textAlign:"center" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="gp-tbody">
                      {filtrados.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                              {p.imagen
                                ? <img src={`http://localhost:8000/productos/${p.imagen}`} alt={p.nombre} className="gp-thumb" />
                                : <div className="gp-thumb-placeholder"><IonIcon icon={imageOutline} style={{ fontSize:'24px' }}/></div>
                              }
                              <div>
                                <p style={{ fontWeight:600, color:"#1e1b4b", fontSize:14, margin: '0' }}>{p.nombre}</p>
                                <p style={{ fontSize:12, color:"#9ca3af", margin: '2px 0 0 0' }}>{p.marca} {p.modelo}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="gp-badge badge-indigo">
                              {p.categoria}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#1e1b4b" }}>
                              {Number(p.precio).toLocaleString("es-MX", { style:"currency", currency:"MXN", minimumFractionDigits:0 })}
                            </span>
                          </td>
                          <td>
                            <span className={`gp-badge ${p.stock > 10 ? 'badge-green' : p.stock > 0 ? 'badge-orange' : 'badge-red'}`}>
                              {p.stock} uds
                            </span>
                          </td>
                          <td>
                            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                              <button className="gp-actbtn gp-edit" onClick={() => abrirEdicion(p)} title="Editar">
                                <IonIcon icon={pencilOutline} />
                              </button>
                              <button className="gp-actbtn gp-del" onClick={() => setEliminando(p)} title="Eliminar">
                                <IonIcon icon={trashOutline} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL EDITAR */}
        <IonModal isOpen={!!editando} onDidDismiss={() => setEditando(null)} className="gp-edit-modal">
          {editando && (
            <div className="gp-modal">
              <div className="gp-modalhead">
                <p className="gp-modaltitle">Editar producto</p>
                <button className="gp-closebtn" onClick={() => setEditando(null)}><IonIcon icon={closeOutline} /></button>
              </div>

              <form className="gp-mbody" onSubmit={guardarEdicion}>
                <div className="gp-mgrid">
                  <div className="gp-mfield gp-mspan">
                    <label className="gp-mlabel">Nombre</label>
                    <input className="gp-minput" type="text" value={form.nombre}
                      onChange={e => setForm({...form, nombre: e.target.value})} required />
                  </div>

                  <div className="gp-mfield">
                    <label className="gp-mlabel">Categoría</label>
                    <input className="gp-minput" type="text" value={form.categoria}
                      onChange={e => setForm({...form, categoria: e.target.value})} required />
                  </div>

                  <div className="gp-mfield">
                    <label className="gp-mlabel">Marca</label>
                    <input className="gp-minput" type="text" value={form.marca}
                      onChange={e => setForm({...form, marca: e.target.value})} />
                  </div>

                  <div className="gp-mfield">
                    <label className="gp-mlabel">Modelo</label>
                    <input className="gp-minput" type="text" value={form.modelo}
                      onChange={e => setForm({...form, modelo: e.target.value})} />
                  </div>

                  <div className="gp-mfield">
                    <label className="gp-mlabel">Precio</label>
                    <input className="gp-minput" type="number" value={form.precio}
                      onChange={e => setForm({...form, precio: e.target.value})} required />
                  </div>

                  <div className="gp-mfield">
                    <label className="gp-mlabel">Stock</label>
                    <input className="gp-minput" type="number" value={form.stock}
                      onChange={e => setForm({...form, stock: e.target.value})} />
                  </div>

                  <div className="gp-mfield gp-mspan">
                    <label className="gp-mlabel">Descripción</label>
                    <textarea className="gp-minput gp-mtextarea" value={form.descripcion}
                      onChange={e => setForm({...form, descripcion: e.target.value})} />
                  </div>

                  <div className="gp-mfield gp-mspan">
                    <label className="gp-mlabel">Número de Tarjeta (Pago)</label>
                    <input className="gp-minput" type="text" value={form.tarjeta_pago} placeholder="Ej. 4111 1111 1111 1111"
                      onChange={e => setForm({...form, tarjeta_pago: e.target.value})} />
                  </div>

                  <div className="gp-mfield gp-mspan">
                    <label className="gp-mlabel">Imagen (dejar vacío para mantener la actual)</label>
                    {editando.imagen && (
                      <img src={`http://localhost:8000/productos/${editando.imagen}`}
                        alt="actual" style={{ width:80, height:80, objectFit:"cover", borderRadius:10, marginBottom:8, border:"1px solid rgba(99,102,241,.15)" }} />
                    )}
                    <input type="file" accept="image/*" className="gp-mfileinput"
                      onChange={e => setNuevaImagen(e.target.files[0] || null)} />
                  </div>
                </div>

                <div className="gp-mfooter">
                  <button type="button" className="gp-mcancel" onClick={() => setEditando(null)}>Cancelar</button>
                  <button type="submit" className="gp-msave" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </IonModal>

        {/* MODAL CONFIRMAR ELIMINAR (ALERT) */}
        <IonAlert
          isOpen={!!eliminando}
          onDidDismiss={() => setEliminando(null)}
          header="¿Eliminar producto?"
          message={`<strong>"${eliminando?.nombre}"</strong> será eliminado permanentemente de la base de datos. Esta acción no se puede deshacer.`}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: eliminandoId ? 'Eliminando...' : 'Sí, eliminar',
              role: 'destructive',
              handler: () => {
                confirmarEliminar();
                return false; // Prevent auto-close if we want to show loading
              }
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default GestionarProductos;
