import { API_URL } from './apiConfig.js';
import { request } from './http.js';

const endpoint = `${API_URL}/administradores`;

export async function getAdmins() {
  return request(endpoint);
}

export async function validateAdmin(usuario, contrasena) {
  const queryUser = encodeURIComponent(usuario.trim());
  const queryPass = encodeURIComponent(contrasena);
  return request(`${endpoint}?usuario=${queryUser}&contrasena=${queryPass}`);
}
