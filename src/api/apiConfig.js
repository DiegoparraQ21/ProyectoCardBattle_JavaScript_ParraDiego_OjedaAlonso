const mode = import.meta.env.PROD ? 'production' : (import.meta.env.VITE_API_MODE || 'development');

let API_URL;

switch (mode) {
  case 'production':
    API_URL = import.meta.env.VITE_API_PROD_URL?.replace(/\/$/, '');
    break;
  case 'development':
  default:
    API_URL = import.meta.env.VITE_API_DEV_URL || 'http://localhost:3000';
    break;
}

if (!API_URL) {
  throw new Error('No hay una URL de API configurada. Revisa .env.');
}

export { API_URL, mode };
