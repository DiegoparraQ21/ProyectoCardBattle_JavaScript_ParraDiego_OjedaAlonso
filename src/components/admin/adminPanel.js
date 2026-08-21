import { deleteCard, getCards, patchCard, postCard, putCard } from '../../api/cardsApi.js';
import { slugify } from '../../utils/validators.js';

const DEFAULT_ATTACKS = [
  ['Ataque 1', 20],
  ['Ataque 2', 30],
  ['Ataque 3', 40],
  ['Ataque 4', 50]
];

export class AdminPanel extends HTMLElement {
  constructor() {
    super();
    this.cards = [];
    this.editingId = null;
  }

  async connectedCallback() {
    this.renderLoading();
    await this.loadCards();
  }

  renderLoading() {
    this.innerHTML = `<div class="loading-screen"><div class="spinner"></div><p>Cargando panel administrativo...</p></div>`;
  }

  async loadCards() {
    try {
      this.cards = await getCards();
      this.render();
      this.bind();
    } catch (error) {
      this.innerHTML = `<div class="empty-state error-box">Error cargando cartas: ${error.message}</div>`;
    }
  }

  render() {
    this.innerHTML = `
      <section class="admin-screen">
        <div class="section-head">
          <div>
            <div class="section-kicker">CRUD COMPLETO · FETCH API</div>
            <h1>Administración de cartas</h1>
            <p class="muted">GET lista · POST crea · PUT reemplaza · PATCH actualiza parcialmente · DELETE elimina.</p>
          </div>
          <button id="newCard" class="btn btn-primary">＋ Nueva carta</button>
        </div>

        <div class="crud-table-wrap">
          <table class="crud-table">
            <thead><tr><th>Carta</th><th>Clan</th><th>HP</th><th>Especial</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${this.cards.map((card) => `
                <tr>
                  <td><div class="table-card-name"><img src="${card.imagen}" onerror="this.src='./images/cartas/placeholder.svg'" alt="">${card.nombre}</div></td>
                  <td>${card.clan || card.tipo}</td>
                  <td>${card.hp}</td>
                  <td>${card.especial.nombre}</td>
                  <td><span class="status ${card.activo ? 'active' : 'inactive'}">${card.activo ? 'ACTIVA' : 'INACTIVA'}</span></td>
                  <td class="table-actions">
                    <button class="icon-btn" data-edit="${card.id}">Editar (PUT)</button>
                    <button class="icon-btn" data-toggle="${card.id}">${card.activo ? 'Desactivar' : 'Activar'} (PATCH)</button>
                    <button class="icon-btn danger" data-delete="${card.id}">Eliminar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div id="adminModal" class="modal hidden">
          <div class="modal-card">
            <button class="modal-close" data-close>×</button>
            <div class="section-kicker">${this.editingId ? 'PUT · EDICIÓN COMPLETA' : 'POST · NUEVA CARTA'}</div>
            <h2>${this.editingId ? 'Editar carta' : 'Crear carta'}</h2>
            <form id="cardForm">
              <div class="form-grid">
                <label>Nombre<input name="nombre" required></label>
                <label>Clan / tipo<input name="clan" required placeholder="Uchiha"></label>
                <label>Imagen<input name="imagen" required placeholder="/images/cartas/MADARA_UCHIHA.svg"></label>
                <label>Rareza<select name="rareza"><option>SR</option><option>SSR</option><option>R</option></select></label>
              </div>
              <label>Descripción<textarea name="descripcion" required rows="2"></textarea></label>
              <div class="form-grid">
                ${DEFAULT_ATTACKS.map((attack, index) => `
                  <label>Ataque ${index + 1} · nombre<input name="attackName${index}" value="${attack[0]}" required></label>
                  <label>Ataque ${index + 1} · daño<input name="attackDamage${index}" type="number" min="10" max="50" value="${attack[1]}" required></label>
                `).join('')}
              </div>
              <div class="form-grid">
                <label>Defensa<input name="defensa" value="Guardia de Chakra" required></label>
                <label>Reducción<input name="reduccion" type="number" min="0" max="0.9" step="0.05" value="0.5" required></label>
                <label>Especial<input name="especial" required></label>
                <label>Daño especial<input name="especialDamage" type="number" min="55" max="70" value="65" required></label>
              </div>
              <label>Descripción<input name="specialDescription" value="Poder especial de la carta"></label>
              <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-close>Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
              </div>
              <p class="form-message" id="adminMessage"></p>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  bind() {
    this.querySelector('#newCard').addEventListener('click', () => {
      this.editingId = null;
      this.openModal();
    });

    this.querySelectorAll('[data-edit]').forEach((button) => {
      button.addEventListener('click', () => {
        this.editingId = button.dataset.edit;
        this.openModal(this.cards.find((card) => card.id === this.editingId));
      });
    });

    this.querySelectorAll('[data-toggle]').forEach((button) => {
      button.addEventListener('click', () => this.toggleCard(button.dataset.toggle));
    });

    this.querySelectorAll('[data-delete]').forEach((button) => {
      button.addEventListener('click', () => this.removeCard(button.dataset.delete));
    });

    this.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', () => this.closeModal());
    });

    this.querySelector('#cardForm').addEventListener('submit', (event) => this.save(event));
  }

  openModal(card = null) {
    const modal = this.querySelector('#adminModal');
    modal.classList.remove('hidden');

    if (!card) return;

    const form = this.querySelector('#cardForm');
    form.elements.nombre.value = card.nombre;
    form.elements.clan.value = card.clan || card.tipo;
    form.elements.imagen.value = card.imagen;
    form.elements.rareza.value = card.rareza || 'SR';
    form.elements.descripcion.value = card.descripcion;
    card.ataques.forEach((attack, index) => {
      form.elements[`attackName${index}`].value = attack.nombre;
      form.elements[`attackDamage${index}`].value = attack.baseDamage;
    });
    form.elements.defensa.value = card.defensa.nombre;
    form.elements.reduccion.value = card.defensa.reduccion;
    form.elements.especial.value = card.especial.nombre;
    form.elements.especialDamage.value = card.especial.baseDamage;
    form.elements.specialDescription.value = card.especial.descripcion || '';
  }

  closeModal() {
    this.querySelector('#adminModal').classList.add('hidden');
  }

  buildCard(formData, original = null) {
    const nombre = String(formData.get('nombre')).trim();
    return {
      id: original?.id || `tarjeta-${slugify(nombre)}-${crypto.randomUUID().slice(0, 5)}`,
      nombre,
      clan: String(formData.get('clan')).trim(),
      tipo: String(formData.get('clan')).trim(),
      rareza: String(formData.get('rareza')),
      imagen: String(formData.get('imagen')).trim(),
      descripcion: String(formData.get('descripcion')).trim(),
      hp: 250,
      ataques: [0, 1, 2, 3].map((index) => ({
        id: `ataque-${index + 1}`,
        nombre: String(formData.get(`attackName${index}`)).trim(),
        baseDamage: Number(formData.get(`attackDamage${index}`))
      })),
      defensa: {
        nombre: String(formData.get('defensa')).trim(),
        reduccion: Number(formData.get('reduccion'))
      },
      especial: {
        nombre: String(formData.get('especial')).trim(),
        baseDamage: Number(formData.get('especialDamage')),
        desbloquearTurn: 2,
        enfriamiento: 3,
        descripcion: String(formData.get('specialDescription')).trim()
      },
      sonidos: original?.sonidos || {
        ataque: './sounds/attack.wav',
        defensa: '/sounds/defense.wav',
        especial: '/sounds/special.wav',
        derrotado: './sounds/defeated.wav'
      },
      activo: original?.activo ?? true,
      createdAt: original?.createdAt || new Date().toISOString()
    };
  }

  async save(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const original = this.editingId ? this.cards.find((card) => card.id === this.editingId) : null;
    const card = this.buildCard(data, original);
    const message = this.querySelector('#adminMessage');

    try {
      if (this.editingId) {
        await putCard(card, this.editingId);
      } else {
        await postCard(card);
      }
      this.closeModal();
      await this.loadCards();
    } catch (error) {
      message.textContent = `No se pudo guardar: ${error.message}`;
      message.className = 'form-message error';
    }
  }

  async toggleCard(id) {
    const card = this.cards.find((item) => item.id === id);
    if (!card) return;

    try {
      // PATCH: solo cambia activo, no reemplaza el objeto completo.
      await patchCard({ activo: !card.activo }, id);
      await this.loadCards();
    } catch (error) {
      alert(`No se pudo actualizar el estado: ${error.message}`);
    }
  }

  async removeCard(id) {
    const card = this.cards.find((item) => item.id === id);
    if (!card) return;
    if (!confirm(`¿Eliminar definitivamente ${card.nombre}?`)) return;

    try {
      await deleteCard(id);
      await this.loadCards();
    } catch (error) {
      alert(`No se pudo eliminar: ${error.message}`);
    }
  }
}

customElements.define('admin-panel', AdminPanel);
