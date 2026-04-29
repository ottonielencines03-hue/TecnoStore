import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonIcon, 
  useIonRouter
} from '@ionic/react';
import { 
  flashOutline, 
  shieldCheckmarkOutline, 
  swapHorizontalOutline, 
  peopleOutline, 
  personOutline, 
  businessOutline,
  arrowForwardOutline
} from 'ionicons/icons';
import { useCart } from '../context/CartContext';
import './Login.css';

const Login = () => {
  const router = useIonRouter();
  const { showToast } = useCart();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: "", email: "", password: "", rol: "cliente",
    empresa: "", telefono: "", direccion: "",
  });
  
  const [errors, setErrors] = useState({});
  const [platformStats, setPlatformStats] = useState({ customers: 0, avg_rating: 0 });

  useEffect(() => {
    // Check for role in URL
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'proveedor') {
      setForm(prev => ({ ...prev, rol: 'proveedor' }));
    }

    fetch("https://tecnostore-production.up.railway.app/api/stats")
      .then(res => res.json())
      .then(data => {
        setPlatformStats({
          customers: data.customers,
          avg_rating: data.avg_rating
        });
      })
      .catch(err => console.error("Error fetching platform stats:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const setRol = (rol) => {
    setForm({ ...form, rol });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit
    setLoading(true);

    const url = isLogin
      ? form.rol === "proveedor"
        ? "https://tecnostore-production.up.railway.app/api/login-proveedor"
        : "https://tecnostore-production.up.railway.app/api/login"
      : form.rol === "proveedor"
        ? "https://tecnostore-production.up.railway.app/api/register-proveedor"
        : "https://tecnostore-production.up.railway.app/api/register";

    const cleanEmail = form.email.trim();
    const cleanPassword = form.password.trim();

    const data = isLogin
      ? { email: cleanEmail, password: cleanPassword }
      : form.rol === "proveedor"
        ? { 
            name: form.name.trim(), 
            email: cleanEmail, 
            password: cleanPassword, 
            empresa: form.empresa.trim(), 
            telefono: form.telefono.trim(), 
            direccion: form.direccion.trim() 
          }
        : { name: form.name.trim(), email: cleanEmail, password: cleanPassword };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const resData = await response.json();
      
      if (response.ok) {
        // Save user and navigate INSTANTLY
        const userData = resData.user ?? resData.proveedor;
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Navigate immediately — no delay
        if (form.rol === "proveedor") {
          router.push("/proveedor", "forward", "replace");
        } else {
          router.push("/PantallaInicio", "forward", "replace");
        }
        return; // Don't setLoading(false) — we're leaving
      }

      // Handle errors
      if (response.status === 422 && resData.errors) {
        const newErrors = {};
        for (const key in resData.errors) {
          newErrors[key] = resData.errors[key][0];
        }
        setErrors(newErrors);
        showToast("Por favor corrige los errores del formulario", "error");
      } else if (response.status === 401 || response.status === 404) {
        const message = resData.message || "";
        if (message.toLowerCase().includes("no encontrado")) {
          setErrors({ email: message });
        } else if (message.toLowerCase().includes("incorrecta")) {
          setErrors({ password: message });
        } else {
          showToast(message, "error");
        }
      } else {
        showToast(resData.message || "Error al procesar la solicitud", "error");
      }
    } catch (err) {
      showToast("Error de conexión con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const isProveedor = form.rol === "proveedor";

  return (
    <IonPage>
      <IonContent fullscreen className="lg-ion-content">
        <div className="lg-wrap">
          {/* Background */}
          <div className="lg-hex" />
          <div className="lg-noise" />
          <div className="lg-scan" />
          <div className="lg-orb lg-orb-1" />
          <div className="lg-orb lg-orb-2" />
          <div className="lg-orb lg-orb-3" />

          {/* Left Column - Branding */}
          <div className="lg-left">
            <div className="lg-brand-logo" onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img src="/Logo-TecnoStore.png" alt="TecnoStore Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
              <span className="lg-brand-name">TecnoStore</span>
            </div>

            <h1 className="lg-brand-headline">
              Tu tienda<br /><span className="gr">tecnológica</span><br />de confianza
            </h1>

            <p className="lg-brand-sub">
              Compra y vende gadgets, laptops, smartphones y más con total seguridad y los mejores precios del mercado.
            </p>

            <div className="lg-trust">
              <div className="lg-trust-item">
                <div className="lg-trust-ico ico-blue">
                  <IonIcon icon={shieldCheckmarkOutline} />
                </div>
                <div>
                  <p className="lg-trust-title">Pagos 100% seguros</p>
                  <p className="lg-trust-sub">Cifrado SSL en cada transacción</p>
                </div>
              </div>
              <div className="lg-trust-item">
                <div className="lg-trust-ico ico-green">
                  <IonIcon icon={swapHorizontalOutline} />
                </div>
                <div>
                  <p className="lg-trust-title">Envío express</p>
                  <p className="lg-trust-sub">Entrega en 24-48 horas con rastreo</p>
                </div>
              </div>
              <div className="lg-trust-item">
                <div className="lg-trust-ico ico-orange">
                  <IonIcon icon={peopleOutline} />
                </div>
                <div>
                  <p className="lg-trust-title">+{platformStats.customers.toLocaleString()} usuarios felices</p>
                  <p className="lg-trust-sub">Calificación promedio {platformStats.avg_rating || "5.0"}/5 estrellas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg-right">
            <div className="lg-form-wrap">
              {/* Mobile Logo */}
              <div className="lg-mobile-logo" onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src="/Logo-TecnoStore.png" alt="TecnoStore Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                <span className="mobile-name">TecnoStore</span>
              </div>

              <div className="lg-header-text">
                <h2 className="lg-form-title">{isLogin ? "Bienvenido de vuelta" : "Crear cuenta"}</h2>
                <p className="lg-form-sub">
                  {isLogin
                    ? "Ingresa tus credenciales para continuar"
                    : `Regístrate como ${isProveedor ? "proveedor" : "cliente"} para empezar`}
                </p>
              </div>

              {/* Role Selector */}
              <div className="lg-rol-grid">
                <button
                  type="button"
                  className={`lg-rol-btn btn-client ${form.rol === "cliente" ? "active" : ""}`}
                  onClick={() => setRol("cliente")}>
                  <IonIcon icon={personOutline} />
                  Cliente
                </button>
                <button
                  type="button"
                  className={`lg-rol-btn btn-vendor ${form.rol === "proveedor" ? "active" : ""}`}
                  onClick={() => setRol("proveedor")}>
                  <IonIcon icon={businessOutline} />
                  Proveedor
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="lg-form">
                {!isLogin && (
                  <div className="lg-field">
                    <label className="lg-label">Nombre</label>
                    <input className={`lg-input ${errors.name ? "err" : ""}`} type="text" name="name" placeholder="Tu nombre completo" onChange={handleChange} required />
                    {errors.name && <span className="lg-error-msg">⚠ {errors.name}</span>}
                  </div>
                )}

                <div className="lg-field">
                  <label className="lg-label">Correo electrónico</label>
                  <input 
                    className={`lg-input ${errors.email ? "err" : ""}`} 
                    type="email" 
                    name="email" 
                    placeholder="correo@ejemplo.com" 
                    onChange={handleChange} 
                    required 
                  />
                  {errors.email && <span className="lg-error-msg">⚠ {errors.email}</span>}
                </div>

                <div className="lg-field">
                  <label className="lg-label">Contraseña</label>
                  <input 
                    className={`lg-input ${errors.password ? "err" : ""}`} 
                    type="password" 
                    name="password" 
                    placeholder="••••••••" 
                    onChange={handleChange} 
                    required 
                  />
                  {errors.password && <span className="lg-error-msg">⚠ {errors.password}</span>}
                </div>

                {!isLogin && isProveedor && (
                  <div className="lg-vendor-fields">
                    <div className="lg-divider" />
                    <div className="lg-field">
                      <label className="lg-label">Empresa</label>
                      <input className={`lg-input ${errors.empresa ? "err" : ""}`} type="text" name="empresa" placeholder="Nombre de tu empresa" onChange={handleChange} required />
                      {errors.empresa && <span className="lg-error-msg">⚠ {errors.empresa}</span>}
                    </div>
                    <div className="lg-field">
                      <label className="lg-label">Teléfono</label>
                      <input className={`lg-input ${errors.telefono ? "err" : ""}`} type="text" name="telefono" placeholder="+52 000 000 0000" onChange={handleChange} required />
                      {errors.telefono && <span className="lg-error-msg">⚠ {errors.telefono}</span>}
                    </div>
                    <div className="lg-field">
                      <label className="lg-label">Dirección</label>
                      <input className={`lg-input ${errors.direccion ? "err" : ""}`} type="text" name="direccion" placeholder="Ciudad, Estado" onChange={handleChange} />
                      {errors.direccion && <span className="lg-error-msg">⚠ {errors.direccion}</span>}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className={`lg-submit ${isProveedor ? "submit-vendor" : "submit-client"} ${loading ? "lg-submit-loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="lg-spinner" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      {isLogin
                        ? `Entrar como ${isProveedor ? "Proveedor" : "Cliente"}`
                        : `Registrarme como ${isProveedor ? "Proveedor" : "Cliente"}`}
                      <IonIcon icon={arrowForwardOutline} style={{ marginLeft: '10px' }} />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle */}
              <p className="lg-toggle">
                {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                <span onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Crear cuenta" : "Iniciar sesión"}
                </span>
              </p>

              {/* Security Badge */}
              <div className="lg-security">
                <span className="lg-pulse-dot" />
                <span className="lg-security-text">
                  Conexión segura · SSL activo
                </span>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
