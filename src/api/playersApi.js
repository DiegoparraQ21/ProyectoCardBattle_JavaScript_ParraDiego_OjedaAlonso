import { API_URL } from './apiConfig.js';
import { request } from './http.js';

const endpoint = `${API_URL}/jugadores`;

export async function getPlayers() {
  return request(endpoint);
}

export async function findPlayerByNickname(apodo) {
  const query = encodeURIComponent(apodo.trim());
  return request(`${endpoint}?apodo=${query}`);
}

export async function getPlayer(id) {
  return request(`${endpoint}/${id}`);
}

export async function postPlayer(player) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(player)
  });
}

export async function patchPlayer(data, id) {
  return request(`${endpoint}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}
