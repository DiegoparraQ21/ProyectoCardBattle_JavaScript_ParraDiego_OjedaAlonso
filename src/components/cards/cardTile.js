import { escapeHtml } from '../../utils/dom.js';

export class CardTile extends HTMLElement {
  static get observedAttributes() {
    return ['selected', 'compact', 'disabled'];
  }

  set card(value) {
    this._card = value;
    this.render();
  }

  get card() {
    return this._card;
  }

  connectedCallback() {
    this.addEventListener('click', () => {
      if (this.hasAttribute('disabled')) return;
      if (!this._card) return;
      this.dispatchEvent(new CustomEvent('card-select', {
        detail: this._card,
        bubbles: true,
        composed: true
      }));
    });
  }

  render() {
    if (!this._card) return;
    const c = this._card;
    this.innerHTML = /*html*/`
      <article class="card-tile ${this.hasAttribute('selected') ? 'is-selected' : ''} ${this.hasAttribute('compact') ? 'is-compact' : ''}">
        <div class="card-image-wrap">
          <img src="${escapeHtml(c.imagen)}" alt="Carta de ${escapeHtml(c.nombre)}"
                onerror="this.src='./images/cartas/placeholder.svg'; this.classList.add('fallback-image')">
          <span class="rarity">${escapeHtml(c.rareza || 'SR')}</span>
          <span class="clan">${escapeHtml(c.clan || c.tipo)}</span>
        </div>
        <div class="card-body">
          <div class="card-heading">
            <h3>${escapeHtml(c.nombre)}</h3>
            <span class="hp">♥ ${c.hp} HP</span>
          </div>
          <p>${escapeHtml(c.descripcion)}</p>
          <div class="stats">
            <span>⚔ ${c.ataques[0]?.baseDamage ?? 20}</span>
            <span>🛡 ${Math.round((c.defensa.reduccion ?? 0.5) * 100)}%</span>
            <span>✦ ${c.especial.baseDamage}</span>
          </div>
          <div class="special-name">${escapeHtml(c.especial.nombre)}</div>
        </div>
        ${this.hasAttribute('selected') ? '<div class="selected-badge">✓ Seleccionada</div>' : ''}
      </article>
    `;
  }
}

customElements.define('card-tile', CardTile);
