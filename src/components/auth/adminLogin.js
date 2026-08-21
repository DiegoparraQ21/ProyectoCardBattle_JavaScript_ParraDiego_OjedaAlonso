import { validateAdmin } from '../../api/adminsApi.js';

export class AdminLogin extends HTMLElement {
  connectedCallback() {
    this.render();
    this.querySelector('form').addEventListener('submit', (event) => this.submit(event));
  }

  render() {
    this.innerHTML =/*html*/ `
      <section class="auth-card admin-auth">
        <div class="section-kicker">⚙ PANEL DE ADMINISTRACIÓN</div>
        <h1>Acceso administrativo</h1>
        <p class="muted">Las credenciales se validan consultando <code>/administradores</code>.</p>
        <form>
          <label>Usuario
            <input name="usuario" required autocomplete="username" placeholder="administrador" />
          </label>
          <label>Contraseña
            <input type="password" name="contrasena" required autocomplete="current-password" placeholder="tarjetas2026" />
          </label>
          <button class="btn btn-primary" type="submit">Iniciar sesión</button>
          <p class="form-message" aria-live="polite"></p>
        </form>
        <div class="auth-note">Uso académico. No es autenticación de producción.</div>
      </section>
    `;
  }

  async submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const usuario = String(data.get('usuario') || '');
    const contrasena = String(data.get('contrasena') || '');
    const button = this.querySelector('button');
    const message = this.querySelector('.form-message');

    button.disabled = true;
    button.textContent = 'Validando...';

    try {
      const matches = await validateAdmin(usuario, contrasena);
      if (!matches.length) {
        throw new Error('Usuario o contraseña incorrectos.');
      }

      this.dispatchEvent(new CustomEvent('admin-authenticated', {
        detail: matches[0],
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      message.textContent = error.message;
      message.className = 'form-message error';
      button.disabled = false;
      button.textContent = 'Iniciar sesión';
    }
  }
}

customElements.define('admin-login', AdminLogin);
