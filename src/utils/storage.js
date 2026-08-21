const PLAYER_KEY = 'cba_current_player';
const DECK_KEY = 'cba_player_deck';

export function saveCurrentPlayer(player) {
  sessionStorage.setItem(PLAYER_KEY, JSON.stringify(player));
}

export function getCurrentPlayer() {
  try {
    return JSON.parse(sessionStorage.getItem(PLAYER_KEY));
  } catch {
    return null;
  }
}

export function clearCurrentPlayer() {
  sessionStorage.removeItem(PLAYER_KEY);
  sessionStorage.removeItem(DECK_KEY);
}

export function saveDeck(deckIds) {
  sessionStorage.setItem(DECK_KEY, JSON.stringify(deckIds));
}

export function getDeck() {
  try {
    return JSON.parse(sessionStorage.getItem(DECK_KEY)) || [];
  } catch {
    return [];
  }
}
