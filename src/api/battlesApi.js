import { API_URL } from './apiConfig.js';
import { request } from './http.js';

const endpoint = `${API_URL}/batallas`;

export async function getBattles() {
  return request(endpoint);
}

export async function postBattle(battle) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(battle)
  });
}
