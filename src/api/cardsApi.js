import { API_URL } from './apiConfig.js';
import { request } from './http.js';

const endpoint = `${API_URL}/tarjetas`;

export async function getCards() {
  return request(endpoint);
}

export async function getCard(id) {
  return request(`${endpoint}/${id}`);
}

export async function postCard(card) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(card)
  });
}

// PUT reemplaza el recurso completo.
export async function putCard(card, id) {
  return request(`${endpoint}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(card)
  });
}

// PATCH modifica solamente las propiedades enviadas.
export async function patchCard(data, id) {
  return request(`${endpoint}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function deleteCard(id) {
  return request(`${endpoint}/${id}`, {
    method: 'DELETE'
  });
}
