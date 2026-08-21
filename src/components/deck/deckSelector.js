import { getCards } from '../../api/cardsApi.js';
import { saveDeck } from '../../utils/storage.js';
import { shuffle } from '../../utils/random.js';

export class DeckSelector extends HTMLElement {
  constructor() {
    super();
    this.cards = [];
    this.selected = [];
    this.filtered = [];
  }

  async connectedCallback() {
    this.renderLoading();
    try {
      this.cards = (await getCards()).filter((card) => card.activo);
      this.filtered = [...this.cards];
      this.render();
      this.hydrateCards();
      this.bind();
    } catch (error) {
      this.innerHTML = /*html*/`<div class="empty-state error-box">No se pudieron cargar las cartas: ${error.message}</div>`;
    }
  }

  renderLoading() {
    this.innerHTML = /*html*/`<div class="loading-screen"><div class="spinner"></div><p>Invocando cartas activas...</p></div>`;
  }

  render() {
    const canStart = this.selected.length === 5 && this.cards.length >= 10;

    this.innerHTML = /*html*/`
      <section class="deck-screen">
        <div class="section-head">
          <div>
            <div class="section-kicker">CONSTRUYE TU EQUIPO</div>
            <h1>Selecciona tus 5 shinobi</h1>
            <p class="muted">Haz clic en una carta para añadirla o quitarla. Después ordena el mazo con ↑ y ↓.</p>
          </div>
          <div class="deck-counter">
            <strong>${this.selected.length}</strong><span>/5</span>
            <small>seleccionadas</small>
          </div>
        </div>

        <div class="deck-toolbar">
          <label class="search-box">⌕
            <input id="search" type="search" placeholder="Buscar personaje..." />
          </label>
          <select id="clanFilter">
            <option value="all">Todos los clanes</option>
            <option value="Senju">Senju</option>
            <option value="Uchiha">Uchiha</option>
            <option value="Konoha">Konoha</option>
            <option value="Arena">Arena</option>
            <option value="Akimichi">Akimichi</option>
            <option value="Inuzuka">Inuzuka</option>
            <option value="Viento">Viento</option>
          </select>
          <span class="pool-status">${this.cards.length} cartas activas disponibles</span>
        </div>

        <div class="deck-layout">
          <aside class="selected-panel">
            <div class="panel-title">
              <span>Tu orden de combate</span>
              <span class="mini-count">${this.selected.length}/5</span>
            </div>
            <div id="selectedList" class="selected-list">
              ${this.renderSelected()}
            </div>
            <button id="startBattle" class="btn btn-primary btn-full" ${canStart ? '' : 'disabled'}>
              ${canStart ? '⚔ Iniciar batalla' : `Selecciona ${5 - this.selected.length} más`}
            </button>
            ${this.cards.length < 10 ? '<p class="form-message error">La partida requiere al menos 10 cartas activas.</p>' : ''}
          </aside>

          <div class="cards-grid" id="cardsGrid">
            ${this.renderCards()}
          </div>
        </div>
      </section>
    `;
  }

  renderCards() {
    if (!this.filtered.length) {
      return '<div class="empty-state">No encontramos cartas con esos filtros.</div>';
    }

    return this.filtered.map((card) => {
      const selected = this.selected.some((item) => item.id === card.id);
      const disabled = !selected && this.selected.length >= 5;
      return `<card-tile data-id="${card.id}" ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}></card-tile>`;
    }).join('');
  }

  renderSelected() {
    if (!this.selected.length) {
      return '<div class="selected-empty">Tus cartas aparecerán aquí en el orden de entrada.</div>';
    }

    return this.selected.map((card, index) => /*html*/`
      <div class="selected-item">
        <span class="order-number">${index + 1}</span>
        <img src="${card.imagen}" alt="${card.nombre}" onerror="this.src='./images/cartas/placeholder.svg'">
        <span class="selected-name">${card.nombre}</span>
        <div class="order-actions">
          <button data-move="up" data-index="${index}" title="Subir" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button data-move="down" data-index="${index}" title="Bajar" ${index === this.selected.length - 1 ? 'disabled' : ''}>↓</button>
          <button data-remove="${index}" title="Quitar">×</button>
        </div>
      </div>
    `).join('');
  }

  hydrateCards() {
    this.querySelectorAll('card-tile').forEach((tile) => {
      const card = this.cards.find((item) => item.id === tile.dataset.id);
      tile.card = card;
    });
  }

  bind() {
    this.querySelector('#search').addEventListener('input', (event) => {
      this.applyFilters(event.target.value, this.querySelector('#clanFilter').value);
    });

    this.querySelector('#clanFilter').addEventListener('change', (event) => {
      this.applyFilters(this.querySelector('#search').value, event.target.value);
    });

    this.querySelector('#cardsGrid').addEventListener('card-select', (event) => {
      const card = event.detail;
      const index = this.selected.findIndex((item) => item.id === card.id);

      if (index >= 0) {
        this.selected.splice(index, 1);
      } else if (this.selected.length < 5) {
        this.selected.push(card);
      }

      saveDeck(this.selected.map((item) => item.id));
      this.render();
      this.hydrateCards();
      this.bind();
    });

    this.querySelector('#selectedList').addEventListener('click', (event) => {
      const move = event.target.dataset.move;
      const remove = event.target.dataset.remove;

      if (remove !== undefined) {
        this.selected.splice(Number(remove), 1);
      } else if (move) {
        const index = Number(event.target.dataset.index);
        const target = move === 'up' ? index - 1 : index + 1;
        if (target >= 0 && target < this.selected.length) {
          [this.selected[index], this.selected[target]] = [this.selected[target], this.selected[index]];
        }
      }

      saveDeck(this.selected.map((item) => item.id));
      this.render();
      this.bind();
    });

    this.querySelector('#startBattle').addEventListener('click', () => this.startBattle());
  }

  applyFilters(search, clan) {
    const text = search.trim().toLowerCase();
    this.filtered = this.cards.filter((card) => {
      const matchesText = !text || card.nombre.toLowerCase().includes(text);
      const matchesClan = clan === 'all' || card.clan === clan;
      return matchesText && matchesClan;
    });

    this.querySelector('#cardsGrid').innerHTML = this.renderCards();
    this.querySelectorAll('card-tile').forEach((tile) => {
      const card = this.cards.find((item) => item.id === tile.dataset.id);
      tile.card = card;
    });
  }

  startBattle() {
    if (this.selected.length !== 5 || this.cards.length < 10) return;

    const remaining = this.cards.filter((card) => !this.selected.some((selected) => selected.id === card.id));
    const machineDeck = shuffle(remaining).slice(0, 5);

    this.dispatchEvent(new CustomEvent('deck-ready', {
      detail: {
        playerDeck: this.selected,
        machineDeck
      },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('deck-selector', DeckSelector);
