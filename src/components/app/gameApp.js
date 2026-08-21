import { getCurrentPlayer, clearCurrentPlayer } from '../../utils/storage.js';
import { toast } from '../../utils/dom.js';

export class GameApp extends HTMLElement {
  constructor() {
    super();
    this.view = 'home';
    this.player = getCurrentPlayer();
    this.admin = null;
    this.battleData = null;
  }

  connectedCallback() {
    this.render();
    this.bindGlobalEvents();
  }

  render() {
    this.innerHTML = /*html*/`
      <div class="app-shell">
        <header class="topbar">
          <button class="brand" data-nav="home" aria-label="Inicio">
            <span class="brand-mark">⚡</span>
            <span><strong>CARD BATTLE</strong><small>SHINOBI ARENA</small></span>
          </button>
          <nav>
            <button data-nav="deck">Jugar</button>
            <button data-nav="leaderboard">Ranking</button>
            <button data-nav="admin">Administración</button>
          </nav>
          <div class="player-pill">
            ${this.player ? `<span>◉ ${this.player.apodo}</span><button data-logout title="Cerrar sesión">Salir</button>` : '<span>Invitado</span>'}
          </div>
        </header>

        <main id="main-content">
          ${this.renderView()}
        </main>

        <footer>
          <span>Card Battle Arena · JavaScript Vanilla + Web Components + Fetch API</span>
          <span>Proyecto Integrador 2026</span>
        </footer>

        <div id="toast-region" aria-live="polite"></div>
      </div>
    `;

    this.querySelectorAll('[data-nav]').forEach((button) => {
      button.addEventListener('click', () => this.navigate(button.dataset.nav));
    });

    this.querySelector('[data-logout]')?.addEventListener('click', () => {
      clearCurrentPlayer();
      this.player = null;
      this.navigate('home');
    });
  }

  renderView() {
    switch (this.view) {
      case 'deck':
        return '<deck-selector></deck-selector>';
      case 'battle':
        return '<battle-view></battle-view>';
      case 'leaderboard':
        return '<leaderboard-view></leaderboard-view>';
      case 'admin':
        return this.admin ? '<admin-panel></admin-panel>' : '<admin-login></admin-login>';
      case 'home':
      default:
        return this.renderHome();
    }
  }

  renderHome() {
    return /*html*/`
      <section class="home-screen">
        <div class="home-hero">
          <div class="hero-copy">
            <div class="section-kicker">NARUTO · SHINOBI BATTLE</div>
            <h1>Forja tu <em>equipo</em>.<br>Domina la arena.</h1>
            <p>Selecciona cinco shinobi, ordénalos y enfréntate a la máquina. Cada victoria suma puntos al ranking.</p>
            <div class="hero-actions">
              ${this.player
        ? /*html*/`<button class="btn btn-primary btn-large" data-nav="deck">⚔ Continuar como ${this.player.apodo}</button>
                  <button class="btn btn-ghost" data-nav="leaderboard">Ver ranking</button>`
        : /*html*/`<player-register></player-register>`}
            </div>
            <div class="feature-row">
              <span>✦ 20 cartas</span><span>⚔ Combate por turnos</span><span>🏆 Ranking acumulativo</span>
            </div>
          </div>
          <div class="hero-visual">
            <div class="energy-orbit orbit-one"></div>
            <div class="energy-orbit orbit-two"></div>
            <div class="hero-card-stack">
              <div class="mini-card mini-back"></div>
              <div class="mini-card mini-mid"></div>
              <div class="mini-card mini-front">
                <img src="/images/cartas/NARUTO_KURAMA.png" alt="Naruto Uzumaki">
                <div class="mini-card-overlay"><strong>NARUTO</strong><span>✦ MODO KURAMA</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="home-info">
          <article><span>01</span><h3>Elige</h3><p>Selecciona exactamente 5 cartas activas y crea tu orden de combate.</p></article>
          <article><span>02</span><h3>Combate</h3><p>Alterna ataques, defensa y poderes especiales con cooldown.</p></article>
          <article><span>03</span><h3>Asciende</h3><p>Gana +50 por victoria y +10 por derrota. Tu progreso se guarda.</p></article>
        </div>
      </section>
    `;
  }

  bindGlobalEvents() {
    document.addEventListener('player-ready', (event) => {
      this.player = event.detail;
      this.navigate('deck');
      this.showToast(`Bienvenido, ${this.player.apodo}.`, 'success');
    });

    document.addEventListener('deck-ready', (event) => {
      this.battleData = event.detail;
      this.navigate('battle');
      const battle = this.querySelector('battle-view');
      if (battle) battle.battleData = this.battleData;
    });

    document.addEventListener('back-to-deck', () => this.navigate('deck'));

    document.addEventListener('battle-finished', (event) => {
      this.player = event.detail.player;
      this.showToast(event.detail.won ? '¡Victoria! +50 puntos.' : 'Partida terminada. +10 puntos.', event.detail.won ? 'success' : 'info');
    });

    document.addEventListener('admin-authenticated', (event) => {
      this.admin = event.detail;
      this.navigate('admin');
      this.showToast('Acceso administrativo concedido.', 'success');
    });

    document.addEventListener('app-toast', (event) => {
      this.showToast(event.detail.message, event.detail.type);
    });
  }

  navigate(view) {
    if (view === 'deck' && !this.player) {
      this.view = 'home';
      this.render();
      this.showToast('Primero registra o recupera tu apodo.', 'info');
      return;
    }

    this.view = view;
    this.render();

    if (view === 'battle' && this.battleData) {
      const battle = this.querySelector('battle-view');
      if (battle) battle.battleData = this.battleData;
    }
  }

  showToast(message, type = 'info') {
    const region = this.querySelector('#toast-region');
    if (!region) return;

    const item = document.createElement('div');
    item.className = `toast ${type}`;
    item.textContent = message;
    region.appendChild(item);
    setTimeout(() => item.remove(), 3500);
  }
}

customElements.define('card-battle-app', GameApp);
