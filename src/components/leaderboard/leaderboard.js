import { getPlayers } from '../../api/playersApi.js';

export class Leaderboard extends HTMLElement {
  async connectedCallback() {
    this.renderLoading();
    try {
      this.players = await getPlayers();
      this.render();
    } catch (error) {
      this.innerHTML = /*html*/`<div class="empty-state error-box">No se pudo cargar el ranking: ${error.message}</div>`;
    }
  }

  renderLoading() {
    this.innerHTML = /*html*/`<div class="loading-screen"><div class="spinner"></div><p>Consultando clasificación...</p></div>`;
  }

  render() {
    const sorted = [...(this.players || [])].sort((a, b) => Number(b.puntos || 0) - Number(a.puntos || 0));
    const top = sorted.slice(0, 3);
    const rest = sorted.slice(3);

    this.innerHTML = /*html*/`
      <section class="leaderboard-screen">
        <div class="section-head">
          <div>
            <div class="section-kicker">RANKING GLOBAL</div>
            <h1>Salón de los Shinobi</h1>
            <p class="muted">Los puntos se acumulan entre partidas.</p>
          </div>
          <button id="refreshRank" class="btn btn-ghost">↻ Actualizar</button>
        </div>

        <div class="podium">
          ${[1, 0, 2].map((index) => top[index] ? this.renderPodium(top[index], index + 1) : '<div class="podium-empty"></div>').join('')}
        </div>

        <div class="ranking-table-wrap">
          <table class="ranking-table">
            <thead><tr><th>#</th><th>Jugador</th><th>Puntos</th><th>Victorias</th><th>Partidas</th></tr></thead>
            <tbody>
              ${rest.length ? rest.map((player, index) => /*html*/`
                <tr>
                  <td>${index + 4}</td>
                  <td><strong>${player.apodo}</strong></td>
                  <td>${player.puntos}</td>
                  <td>${player.victorias}</td>
                  <td>${player.juegosJugados}</td>
                </tr>
              `).join('') : '<tr><td colspan="5" class="muted center">Aún no hay más jugadores.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    `;

    this.querySelector('#refreshRank').addEventListener('click', () => this.connectedCallback());
  }

  renderPodium(player, place) {
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    return /*html*/`
      <article class="podium-card place-${place}">
        <div class="podium-medal">${medals[place]}</div>
        <div class="podium-place">${place}° LUGAR</div>
        <h2>${player.apodo}</h2>
        <strong class="podium-points">${player.puntos} pts</strong>
        <div class="podium-stats"><span>${player.victorias} victorias</span><span>${player.juegosJugados} partidas</span></div>
      </article>
    `;
  }
}

customElements.define('leaderboard-view', Leaderboard);
