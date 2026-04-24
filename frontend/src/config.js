let hostname = window.location.hostname;
if (hostname === 'localhost') hostname = '127.0.0.1';

// Si estamos en localhost o 127.0.0.1, usamos el puerto 8000 por defecto de artisan serve
export const BASE_URL = `http://${hostname}:8000`;
export const API_BASE_URL = `${BASE_URL}/api`;
