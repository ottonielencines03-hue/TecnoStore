export const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export const BASE_URL = isLocalhost
  ? 'http://127.0.0.1:8000'
  : 'https://tecnostore-production.up.railway.app';

export const API_BASE_URL = `${BASE_URL}/api`;
