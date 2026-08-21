import { postBattle } from '../../api/battlesApi.js';
import { patchPlayer } from '../../api/playersApi.js';
import { getCurrentPlayer, saveCurrentPlayer } from '../../utils/storage.js';
import {
  activeCard,
  createBattleState,
  executeAction,
  availableActions,
  chooseMachineAction,
  startTurnIfNeeded
} from '../../utils/battleEngine.js';

export class BattleView extends HTMLElement {
  constructor() {
    super();
    this.state = null;
    this.player = null;
    this.processing = false;
    this.finalized = false;
    this.machineTimer = null;
    this.fx = null;
  }

  set battleData(value) {
    this.player = getCurrentPlayer();
    this.state = createBattleState(value.playerDeck, value.machineDeck);
    this.finalized = false;
    this.processing = false;
    startTurnIfNeeded(this.state);
    this.render();
    this.bind();
    this.maybeMachineTurn();
  }

  connectedCallback() {
    this.renderEmpty();
  }

  renderEmpty() {
    if (!this.state) {
      this.innerHTML = /*html*/`
        <section class="empty-state battle-empty">
          <div class="section-kicker">ARENA</div>
          <h2>La batalla aparecerá aquí</h2>
          <p>Regresa al selector y elige cinco cartas.</p>
        </section>
      `;
    }
  }

  render() {
    if (!this.state) return;

    const player = activeCard(this.state, 'player');
    const machine = activeCard(this.state, 'machine');
    const actions = availableActions(player);
    const turnLabel = this.state.currentTurn === 'player' ? 'TU TURNO' : 'TURNO DE LA MÁQUINA';
    const winner = this.state.winner;

    this.innerHTML = /*html*/`
      <section class="battle-screen">
        <div class="battle-topbar">
          <div>
            <div class="section-kicker">SHINOBI BATTLE ARENA</div>
            <h1>${winner ? (winner === 'player' ? '¡Victoria!' : 'Derrota') : turnLabel}</h1>
          </div>
          <div class="battle-round">Turno ${this.state.turnNumber}</div>
        </div>

        <div class="turn-banner ${this.state.currentTurn === 'player' ? 'player-turn' : 'machine-turn'}">
          <span class="pulse-dot"></span>
          ${winner ? 'COMBATE FINALIZADO' : (this.state.currentTurn === 'player' ? 'Puedes elegir una acción' : 'La máquina está pensando...')}
        </div>

        <div class="battle-arena">
          ${this.renderFighter('machine', machine, 'MÁQUINA', 'machine')}
          <div class="vs-badge">VS</div>
          ${this.renderFighter('player', player, this.player?.apodo || 'JUGADOR', 'player')}
        </div>

        <div class="battle-controls">
          ${winner ? this.renderResult() : this.renderControls(player, actions)}
        </div>

        <div class="battle-log">
          <div class="panel-title">Registro de combate</div>
          <div class="log-list">
            ${this.state.log.slice(-8).reverse().map((entry) => `<p><time>${entry.time}</time>${entry.message}</p>`).join('') || '<p class="muted">La batalla está por comenzar.</p>'}
          </div>
        </div>
      </section>
    `;
  }

  renderFighter(actor, card, label, side) {
    if (!card) {
      return `<div class="fighter ${side} defeated-fighter"><div class="fighter-empty">Sin cartas</div></div>`;
    }

    const hpPercent = Math.max(0, Math.round((card.currentHp / 250) * 100));
    const defending = card.defending ? '<span class="status-chip defense-chip">🛡 DEFENDIENDO</span>' : '';
    const specialReady = card.ownTurns >= 2 && card.specialCooldown === 0;
    const specialStatus = specialReady
      ? 'ESPECIAL LISTO'
      : card.ownTurns < 2
        ? `DESBLOQUEA EN TURNO ${2 - card.ownTurns}`
        : `COOLDOWN ${card.specialCooldown}`;

    const fxClass = this.fx?.actor === side ? `fx-${this.fx.type}` : '';
    const targetFx = this.fx?.target === side ? `fx-target-${this.fx.type}` : '';
    const defeatedFx = this.fx?.target === side && this.fx?.defeated ? 'fx-defeated' : '';
    return /*html*/`
      <article class="fighter ${side} ${card.defeated ? 'is-defeated' : ''} ${fxClass} ${targetFx} ${defeatedFx}">
        <div class="fighter-label">${label}</div>
        <div class="fighter-card">
          <div class="fighter-image">
            <img src="${card.imagen}" alt="${card.nombre}" onerror="this.src='./images/cartas/placeholder.svg'">
            <span class="fighter-rarity">${card.rareza || 'SR'}</span>
          </div>
          <div class="fighter-info">
            <h2>${card.nombre}</h2>
            <p>${card.especial.nombre}</p>
            ${defending}
            <div class="hp-row">
              <span>HP</span><strong>${card.currentHp} / 250</strong>
            </div>
            <div class="hp-bar"><span style="width:${hpPercent}%"></span></div>
            <div class="fighter-meta">
              <span>Turnos propios: ${card.ownTurns}</span>
              <span class="${specialReady ? 'ready' : ''}">✦ ${specialStatus}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  renderControls(player, actions) {
    const disabled = this.processing || this.state.currentTurn !== 'player';
    const attackButtons = player.ataques.map((attack, index) => `
      <button class="battle-action attack-action" data-action="attack${index + 1}" ${disabled ? 'disabled' : ''}>
        <span>⚔</span>
        <strong>${attack.nombre}</strong>
        <small>${attack.baseDamage} base</small>
      </button>
    `).join('');

    const specialAvailable = actions.includes('special');

    return /*html*/`
      <div class="actions-grid">
        ${attackButtons}
        <button class="battle-action defense-action" data-action="defense" ${disabled ? 'disabled' : ''}>
          <span>🛡</span><strong>${player.defensa.nombre}</strong><small>50% menos daño</small>
        </button>
        <button class="battle-action special-action ${specialAvailable ? 'is-ready' : ''}" data-action="special"
          ${disabled || !specialAvailable ? 'disabled' : ''}>
          <span>✦</span><strong>${player.especial.nombre}</strong>
          <small>${specialAvailable ? `${player.especial.baseDamage} base · LISTO` : player.ownTurns < 2 ? `Disponible desde turno 2` : `Cooldown: ${player.specialCooldown}`}</small>
        </button>
      </div>
    `;
  }

  renderResult() {
    const won = this.state.winner === 'player';
    return /*html*/`
      <div class="result-card ${won ? 'victory' : 'defeat'}">
        <div class="result-icon">${won ? '🏆' : '⚔'}</div>
        <div>
          <h2>${won ? '¡Ganaste la batalla!' : 'La máquina ganó esta vez'}</h2>
          <p>${won ? '+50 puntos' : '+10 puntos'} · Resultado guardado en el historial.</p>
        </div>
        <button class="btn btn-primary" data-new-battle>Volver a seleccionar</button>
      </div>
    `;
  }

  bind() {
    this.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => this.playerAction(button.dataset.action));
    });

    this.querySelector('[data-new-battle]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('back-to-deck', { bubbles: true, composed: true }));
    });
  }

  async playerAction(action) {
    if (this.processing || this.state.currentTurn !== 'player' || this.state.winner) return;

    this.processing = true;
    const actorCard = activeCard(this.state, 'player');
    const result = executeAction(this.state, 'player', action);

    if (!result.valid) {
      this.processing = false;
      return;
    }

    this.fx = { actor: 'player', target: 'machine', type: result.type, defeated: Boolean(result.defeated) };
    this.playSound(actorCard, result.type);
    if (result.defeated) this.playDefeatedSound();
    this.render();
    this.clearFx();
    this.bind();

    if (this.state.winner) {
      await this.finalizeBattle();
      return;
    }

    await this.wait(650);
    startTurnIfNeeded(this.state);
    this.processing = false;
    this.render();
    this.bind();
    this.maybeMachineTurn();
  }

  maybeMachineTurn() {
    if (this.state?.winner || this.state?.currentTurn !== 'machine') return;

    clearTimeout(this.machineTimer);
    this.machineTimer = setTimeout(async () => {
      if (this.state.winner) return;

      this.processing = true;
      const machineCard = activeCard(this.state, 'machine');
      const action = chooseMachineAction(this.state);
      const result = executeAction(this.state, 'machine', action);

      if (result.valid) {
        this.fx = { actor: 'machine', target: 'player', type: result.type, defeated: Boolean(result.defeated) };
        this.playSound(machineCard, result.type);
        if (result.defeated) this.playDefeatedSound();
      }

      this.render();
      this.clearFx();
      this.bind();

      if (this.state.winner) {
        await this.finalizeBattle();
        return;
      }

      await this.wait(650);
      startTurnIfNeeded(this.state);
      this.processing = false;
      this.render();
      this.bind();
    }, 850);
  }

  async finalizeBattle() {
    if (this.finalized) return;
    this.finalized = true;

    const won = this.state.winner === 'player';
    const points = won ? 50 : 10;
    const updatedPlayer = {
      ...this.player,
      puntos: Number(this.player.puntos || 0) + points,
      victorias: Number(this.player.victorias || 0) + (won ? 1 : 0),
      perdidas: Number(this.player.perdidas || 0) + (won ? 0 : 1),
      juegosJugados: Number(this.player.juegosJugados || 0) + 1
    };

    try {
      const saved = await patchPlayer({
        puntos: updatedPlayer.puntos,
        victorias: updatedPlayer.victorias,
        perdidas: updatedPlayer.perdidas,
        juegosJugados: updatedPlayer.juegosJugados
      }, updatedPlayer.id);

      saveCurrentPlayer(saved);

      await postBattle({
        id: `batalla-${crypto.randomUUID().slice(0, 8)}`,
        playerId: saved.id,
        apodo: saved.apodo,
        resultado: won ? 'victoria' : 'derrota',
        puntosOtorgados: points,
        playerDeck: this.state.playerDeck.map((card) => card.id),
        machineDeck: this.state.machineDeck.map((card) => card.id),
        startedAt: this.state.startedAt,
        finalizadoEn: this.state.finishedAt || new Date().toISOString()
      });

      this.player = saved;
      this.playResultSound(won);
      this.render();
      this.bind();

      this.dispatchEvent(new CustomEvent('battle-finished', {
        detail: { won, points, player: saved },
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      this.state.log.push({
        id: crypto.randomUUID(),
        message: `La batalla terminó, pero hubo un problema guardando el resultado: ${error.message}`,
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      });
      this.render();
      this.bind();
    }
  }

  clearFx() {
    setTimeout(() => {
      this.fx = null;
      if (!this.state?.winner) {
        this.render();
        this.bind();
      }
    }, 420);
  }

  playDefeatedSound() {
    const audio = new Audio('./sounds/defeated.wav');
    audio.volume = 0.45;
    audio.play().catch(() => {});
  }

  playResultSound(won) {
    const audio = new Audio(won ? './sounds/victory.wav' : './sounds/defeat.wav');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }

  playSound(card, type) {
    const key = type === 'special' ? 'especial' : type === 'defense' ? 'defensa' : 'ataque';
    const src = card?.sonidos?.[key];
    if (!src) return;

    const audio = new Audio(src);
    audio.volume = 0.45;
    audio.play().catch(() => {});
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

customElements.define('battle-view', BattleView);
