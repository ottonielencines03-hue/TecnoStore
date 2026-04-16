import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonIcon, 
  useIonRouter,
  IonToast
} from '@ionic/react';
import axios from 'axios';
import { 
  flashOutline, 
  shieldCheckmarkOutline, 
  swapHorizontalOutline, 
  peopleOutline, 
  personOutline, 
  businessOutline,
  arrowForwardOutline,
  closeCircleOutline
} from 'ionicons/icons';
import './Login.css';

const Login = () => {
  const router = useIonRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [form, setForm] = useState({
    name: "", email: "", password: "", rol: "cliente",
    empresa: "", telefono: "", direccion: "",
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      if (user.empresa) router.push("/proveedor", "forward", "replace");
      else router.push("/PantallaInicio", "forward", "replace");
    }
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
    try {
      const url = isLogin
        ? form.rol === "proveedor"
          ? "http://localhost:8000/api/login-proveedor"
          : "http://localhost:8000/api/login"
        : form.rol === "proveedor"
          ? "http://localhost:8000/api/register-proveedor"
          : "http://localhost:8000/api/register";

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

      const res = await axios.post(url, data);
      
      localStorage.setItem("user", JSON.stringify(res.data.user ?? res.data.proveedor));
      
      // Navigate based on role
      if (form.rol === "proveedor") {
        router.push("/proveedor", "forward", "replace");
      } else {
        router.push("/PantallaInicio", "forward", "replace");
      }

    } catch (err) {
      console.error(err);
      if (err.response) {
        const message = err.response.data.message || "";
        const validationErrors = err.response.data.errors || {};

        if (err.response.status === 422 && Object.keys(validationErrors).length > 0) {
          // Map all validation errors to the state
          const newErrors = {};
          for (const key in validationErrors) {
            newErrors[key] = validationErrors[key][0]; // Toma el primer mensaje de error para el campo
          }
          setErrors(newErrors);
          
          setToastMessage("Por favor corrige los errores del formulario");
          setShowToast(true);
        } else if (err.response.status === 401 || err.response.status === 404) {
          // Manejo de errores específicos de login (no encontrado o pass incorrecta)
          if (message.toLowerCase().includes("no encontrado")) {
            setErrors({ email: message });
          } else if (message.toLowerCase().includes("incorrecta")) {
            setErrors({ password: message });
          } else {
            setToastMessage(message);
            setShowToast(true);
          }
        } else {
          setToastMessage(message || "Error al procesar la solicitud");
          setShowToast(true);
        }
      } else {
        setToastMessage("Error de conexión con el servidor");
        setShowToast(true);
      }
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

          {/* Left Column - Branding (Hidden on small screens via CSS) */}
          <div className="lg-left">
            <div className="lg-brand-logo" onClick={() => router.push('/')}>
              <div className="lg-brand-mark">
                <IonIcon icon={flashOutline} />
              </div>
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
                  <p className="lg-trust-title">+8,200 usuarios felices</p>
                  <p className="lg-trust-sub">Calificación promedio 4.9/5 estrellas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg-right">
            <div className="lg-form-wrap">
              {/* Mobile Logo */}
              <div className="lg-mobile-logo" onClick={() => router.push('/')}>
                <div className="lg-brand-mark small">
                  <IonIcon icon={flashOutline} />
                </div>
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
                  className={`lg-submit ${isProveedor ? "submit-vendor" : "submit-client"}`}>
                  {isLogin
                    ? `Entrar como ${isProveedor ? "Proveedor" : "Cliente"}`
                    : `Registrarme como ${isProveedor ? "Proveedor" : "Cliente"}`}
                  <IonIcon icon={arrowForwardOutline} style={{ marginLeft: '10px' }} />
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

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          icon={closeCircleOutline}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
