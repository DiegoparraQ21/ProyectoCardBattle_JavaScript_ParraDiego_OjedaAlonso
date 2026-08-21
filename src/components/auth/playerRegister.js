import { findPlayerByNickname, postPlayer } from '../../api/playersApi.js';
import { isValidNickname } from '../../utils/validators.js';
import { saveCurrentPlayer } from '../../utils/storage.js';

export class PlayerRegister extends HTMLElement {
  connectedCallback() {
    this.render();
    this.querySelector('form').addEventListener('submit', (event) => this.submit(event));
  }

  render() {
    this.innerHTML = /*html*/`
      <section class="auth-card">
        <div class="section-kicker">⚔ REGISTRO SHINOBI</div>
        <h1>Entra a la arena</h1>
        <p class="muted">Usa un apodo único. Si ya existe, continuaremos con tu jugador sin crear un registro duplicado.</p>
        <form>
          <label>Apodo
            <input name="apodo" maxlength="18" autocomplete="nickname" placeholder="Ej: JCMASTER" required />
          </label>
          <button class="btn btn-primary" type="submit">Continuar al mazo →</button>
          <p class="form-message" aria-live="polite"></p>
        </form>
        <div class="auth-note">Mínimo 3 caracteres · letras, números y _</div>
      </section>
    `;
  }

  async submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const apodo = String(form.get('apodo') || '').trim();
    const message = this.querySelector('.form-message');
    const button = this.querySelector('button');

    if (!isValidNickname(apodo)) {
      message.textContent = 'El apodo debe tener 3–18 caracteres y solo puede usar letras, números o _.';
      message.className = 'form-message error';
      return;
    }

    button.disabled = true;
    button.textContent = 'Consultando API...';
    message.textContent = '';

    try {
      const matches = await findPlayerByNickname(apodo);

      if (matches.length > 0) {
        saveCurrentPlayer(matches[0]);
        this.dispatchEvent(new CustomEvent('player-ready', {
          detail: matches[0],
          bubbles: true,
          composed: true
        }));
        return;
      }

      const player = {
        id: `jugador-${crypto.randomUUID().slice(0, 8)}`,
        apodo,
        puntos: 0,
        victorias: 0,
        perdidas: 0,
        juegosJugados: 0,
        createdAt: new Date().toISOString()
      };

      const created = await postPlayer(player);
      saveCurrentPlayer(created);
      this.dispatchEvent(new CustomEvent('player-ready', {
        detail: created,
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      message.textContent = `No se pudo conectar con la API. ${error.message}`;
      message.className = 'form-message error';
      button.disabled = false;
      button.textContent = 'Continuar al mazo →';
    }
  }
}

customElements.define('player-register', PlayerRegister);
