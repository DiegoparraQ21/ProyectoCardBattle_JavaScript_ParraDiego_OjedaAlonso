import { calculateDamage, randomItem } from './random.js';

export function createRuntimeCard(card) {
  return {
    ...structuredClone(card),
    currentHp: 250,
    ownTurns: 0,
    defending: false,
    specialCooldown: 0,
    defeated: false
  };
}

export function createBattleState(playerCards, machineCards) {
  const playerDeck = playerCards.map(createRuntimeCard);
  const machineDeck = machineCards.map(createRuntimeCard);

  return {
    playerDeck,
    machineDeck,
    playerIndex: 0,
    machineIndex: 0,
    currentTurn: Math.random() < 0.5 ? 'player' : 'machine',
    turnNumber: 0,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    winner: null,
    log: []
  };
}

export function activeCard(state, actor) {
  const deck = actor === 'player' ? state.playerDeck : state.machineDeck;
  const index = actor === 'player' ? state.playerIndex : state.machineIndex;
  return deck[index];
}

export function opponentCard(state, actor) {
  return activeCard(state, actor === 'player' ? 'machine' : 'player');
}

export function prepareOwnTurn(card) {
  card.ownTurns += 1;

  if (card.specialCooldown > 0) {
    card.specialCooldown -= 1;
  }
}

export function availableActions(card) {
  const actions = ['attack1', 'attack2', 'attack3', 'attack4', 'defense'];

  if (card.ownTurns >= 2 && card.specialCooldown === 0) {
    actions.push('special');
  }

  return actions;
}

export function executeAction(state, actor, action) {
  const attacker = activeCard(state, actor);
  const defender = opponentCard(state, actor);

  if (!attacker || !defender || attacker.defeated) {
    return { valid: false, reason: 'No hay una carta activa válida.' };
  }

  if (action === 'defense') {
    attacker.defending = true;
    pushLog(state, `${attacker.nombre} activa ${attacker.defensa.nombre}.`);
    finishTurn(state, actor);
    return { valid: true, type: 'defense', damage: 0 };
  }

  let baseDamage;
  let actionName;
  let type = 'attack';

  if (action === 'special') {
    if (attacker.ownTurns < 2 || attacker.specialCooldown > 0) {
      return { valid: false, reason: 'El poder especial está bloqueado.' };
    }
    baseDamage = attacker.especial.baseDamage;
    actionName = attacker.especial.nombre;
    attacker.specialCooldown = attacker.especial.enfriamiento;
    type = 'special';
  } else {
    const attackIndex = Number(action.replace('attack', '')) - 1;
    const attack = attacker.ataques[attackIndex];
    if (!attack) return { valid: false, reason: 'Ataque inválido.' };
    baseDamage = attack.baseDamage;
    actionName = attack.nombre;
  }

  let damage = calculateDamage(baseDamage);

  if (defender.defending) {
    damage = Math.round(damage * (1 - Number(defender.defensa.reduccion ?? 0.5)));
    defender.defending = false;
    pushLog(state, `${defender.nombre} reduce el daño gracias a su defensa.`);
  }

  defender.currentHp = Math.max(0, defender.currentHp - damage);
  pushLog(state, `${attacker.nombre} usa ${actionName} y causa ${damage} de daño.`);

  const defeated = defender.currentHp === 0;
  if (defeated) {
    defender.defeated = true;
    pushLog(state, `${defender.nombre} ha sido derrotado.`);
    advanceAfterDefeat(state, actor === 'player' ? 'machine' : 'player');
  }

  finishTurn(state, actor);

  return { valid: true, type, damage, defeated, actionName };
}

function advanceAfterDefeat(state, defeatedActor) {
  if (defeatedActor === 'player') {
    state.playerIndex += 1;
    if (state.playerIndex >= state.playerDeck.length) {
      state.winner = 'machine';
      state.finishedAt = new Date().toISOString();
      return;
    }
  } else {
    state.machineIndex += 1;
    if (state.machineIndex >= state.machineDeck.length) {
      state.winner = 'player';
      state.finishedAt = new Date().toISOString();
      return;
    }
  }
}

function finishTurn(state, actor) {
  state.turnNumber += 1;

  if (!state.winner) {
    state.currentTurn = actor === 'player' ? 'machine' : 'player';
  }
}

export function startTurnIfNeeded(state) {
  if (state.winner) return;
  const card = activeCard(state, state.currentTurn);
  prepareOwnTurn(card);
}

export function chooseMachineAction(state) {
  const machine = activeCard(state, 'machine');
  const enemy = activeCard(state, 'player');

  const actions = availableActions(machine);

  // Decisión sencilla, determinista en reglas académicas, no IA real.
  if (actions.includes('special') && (enemy.currentHp <= 110 || Math.random() < 0.45)) {
    return 'special';
  }

  if (machine.currentHp <= 75 && Math.random() < 0.35) {
    return 'defense';
  }

  return randomItem(actions.filter((action) => action !== 'special'));
}

function pushLog(state, message) {
  state.log.push({
    id: crypto.randomUUID(),
    message,
    time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  });
}
