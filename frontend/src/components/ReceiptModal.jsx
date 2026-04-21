import React, { useRef } from 'react';
import './ReceiptModal.css';

const ReceiptModal = ({ isOpen, onClose, orderData }) => {
  const receiptRef = useRef();

  if (!isOpen || !orderData) return null;

  const downloadPDF = () => {
    const element = receiptRef.current;
    if (!element) return;
    
    // Use global html2pdf from CDN
    const html2pdf = window.html2pdf;
    
    if (!html2pdf) {
      alert("La librería de PDF aún se está cargando. Intenta de nuevo en un momento.");
      return;
    }
    
    const opt = {
      margin:       [10, 10],
      filename:     `ticket-${orderData.transaction_id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(value);
  };

  return (
    <div className="receipt-overlay animate-fade-in">
      <div className="receipt-container">
        <button className="receipt-close-btn" onClick={onClose}>&times;</button>
        
        <div className="receipt-content" ref={receiptRef}>
          <div className="receipt-header">
            <div className="receipt-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1>¡Pago Exitoso!</h1>
            <p className="receipt-subtitle">Gracias por tu compra en TecnoStore</p>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-details">
            <div className="receipt-row">
              <span>Fecha</span>
              <strong>{new Date().toLocaleDateString()}</strong>
            </div>
            <div className="receipt-row">
              <span>ID Transacción</span>
              <strong>{orderData.transaction_id}</strong>
            </div>
            <div className="receipt-row">
              <span>Estado</span>
              <span className="status-badge">Completado</span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-items">
            <h3>Resumen de productos</h3>
            {orderData.detalles.map((item, index) => (
              <div key={index} className="receipt-item-row">
                <div className="item-info">
                  <span className="item-name">{item.nombre}</span>
                  <span className="item-qty">x{item.cantidad}</span>
                </div>
                <span className="item-price">{formatCurrency(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-total-section">
            <div className="receipt-row total">
              <span>Total pagado</span>
              <strong>{formatCurrency(orderData.total)}</strong>
            </div>
            <p className="payment-method">Pagado con PayPal</p>
          </div>

          <div className="receipt-footer">
            <p>Este es un comprobante oficial de su transacción.</p>
            <p>TecnoStore - Tecnología a tu alcance</p>
          </div>
        </div>

        <div className="receipt-actions">
          <button className="btn-download" onClick={handleDownloadPDF}>
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar PDF
          </button>
          <button className="btn-done" onClick={onClose}>Listo</button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
