# ⚔ Card Battle Arena — Shinobi Edition

Proyecto Integrador de JavaScript Vanilla para un juego web de cartas de combate inspirado en Naruto.

## 1. Integrantes

- Integrante 1: Diego Parra
- Integrante 2: Alonso Ojeda

## 2. Temática

**Naruto — Shinobi Battle Arena**

Las 20 cartas iniciales son:

1. Hashirama Senju
2. Tsunade Senju
3. Tobirama Senju
4. Madara Uchiha
5. Sasuke Uchiha
6. Itachi Uchiha
7. Minato Namikaze
8. Kakashi Hatake
9. Jiraiya
10. Orochimaru
11. Gaara
12. Rock Lee
13. Neji Hyuga
14. Hinata Hyuga
15. Shikamaru Nara
16. Naruto Uzumaki
17. Sakura Haruno
18. Choji Akimichi
19. Kiba Inuzuka
20. Temari

## 3. Tecnologías

- HTML5
- CSS3
- JavaScript Vanilla
- ES Modules
- Web Components / Custom Elements
- Fetch API
- JSON Server para desarrollo
- Vite
- Git y GitHub
- GitHub Pages para el frontend

No se utiliza React, Angular, Vue, Svelte, Axios ni otro framework frontend.

## 4. Flujo del jugador

### Inicio

- Si no existe un jugador en `sessionStorage`, aparece el registro.
- Si existe un jugador recuperado de la sesión, aparece **Continuar como APODO**.
- También se puede escribir nuevamente un apodo existente.
- El sistema consulta la API antes de crear el jugador.
- Si encuentra el apodo, reutiliza el registro existente.
- Si no existe, hace POST.

### Selector de cartas

- Solo muestra cartas activas.
- Permite buscar por nombre.
- Permite filtrar por clan.
- Muestra el contador 0/5.
- No permite seleccionar más de cinco.
- Permite quitar cartas.
- Permite ordenar con ↑ y ↓.
- La partida solo inicia con exactamente cinco cartas.
- La máquina toma cinco cartas distintas de las restantes.

### Combate

- Cada carta empieza con 250 HP.
- Se sortea aleatoriamente quién empieza.
- Hay cuatro ataques.
- El daño usa un factor aleatorio de 0.85 a 1.15.
- Defensa reduce el siguiente daño recibido en 50%.
- El especial se desbloquea desde el segundo turno propio.
- El especial tiene cooldown de tres turnos propios.
- La máquina elige automáticamente una acción válida.
- Una carta derrotada no regenera a la carta vencedora.
- La siguiente carta entra con 250 HP.
- La batalla termina al perder las cinco cartas.

### Resultado

- Victoria: +50 puntos.
- Derrota: +10 puntos.
- Se incrementan partidas, victorias o derrotas.
- Se guarda un registro en `/batallas`.
- El ranking se ordena por puntos.

## 5. Administración

Ruta: **Administración**

Credenciales académicas:

```text
Usuario: administrador
Contraseña: tarjetas2026
```

El login consulta `/administradores`.

El panel demuestra:

| Método | Acción |
|---|---|
| GET | Listar cartas |
| POST | Crear carta |
| PUT | Reemplazar una carta completa |
| PATCH | Cambiar únicamente `activo` |
| DELETE | Eliminar una carta |

La diferencia entre PUT y PATCH está implementada de forma explícita en `src/api/cardsApi.js`.

## 6. Arquitectura

```text
src/
├── api/
│   ├── apiConfig.js
│   ├── http.js
│   ├── cardsApi.js
│   ├── playersApi.js
│   ├── adminsApi.js
│   └── battlesApi.js
│
├── components/
│   ├── app/
│   │   └── gameApp.js
│   ├── auth/
│   │   ├── playerRegister.js
│   │   └── adminLogin.js
│   ├── cards/
│   │   └── cardTile.js
│   ├── deck/
│   │   └── deckSelector.js
│   ├── battle/
│   │   └── battleView.js
│   ├── leaderboard/
│   │   └── leaderboard.js
│   └── admin/
│       └── adminPanel.js
│
├── data/
│   └── db.json
│
├── utils/
│   ├── battleEngine.js
│   ├── random.js
│   ├── validators.js
│   ├── storage.js
│   └── dom.js
│
├── styles.css
└── app.js
```

## 7. Variables de entorno

`.env.example`:

```text
VITE_API_MODE=development
VITE_API_DEV_URL=http://localhost:3000
VITE_API_PROD_URL=
```

La URL se selecciona mediante `switch` en:

```text
src/api/apiConfig.js
```

### Desarrollo

```text
VITE_API_MODE=development
```

Usa JSON Server local.

### Producción

```text
VITE_API_MODE=production
VITE_API_PROD_URL=https://tu-api-publicada.example.com
```

Para que GitHub Pages conserve jugadores, batallas y cambios administrativos, la API de producción debe estar publicada en un servidor accesible por HTTPS y ser compatible con los endpoints usados por `fetch()`.

## 8. Imágenes

Los placeholders están en:

```text
public/images/cartas/
```

Cada archivo tiene el nombre exacto esperado por `db.json`.

Ejemplo:

```text
HASHIRAMA_SENJU.png
TSUNADE_SENJU.png
MADARA_UCHIHA.png
NARUTO_UZUMAKI.png
```

## 9. Audio

El proyecto incluye sonidos WAV pequeños para demostrar la integración:

```text
public/sounds/attack.wav
public/sounds/defense.wav
public/sounds/special.wav
public/sounds/defeated.wav
public/sounds/victory.wav
public/sounds/defeat.wav
```

Cada carta apunta a los sonidos generales de ataque, defensa, especial y derrota.

## 10. Checklist de requisitos

- [x] HTML5
- [x] CSS3
- [x] JavaScript Vanilla
- [x] ES Modules
- [x] Web Components
- [x] Fetch API
- [x] Registro de jugador
- [x] Validación de apodo duplicado vía API
- [x] Reutilización de jugador existente
- [x] 20 cartas precargadas
- [x] 250 HP
- [x] Cuatro ataques por carta
- [x] Defensa 50%
- [x] Especial desde segundo turno
- [x] Cooldown de tres turnos propios
- [x] Máquina automática
- [x] Selección exacta de cinco cartas
- [x] Orden del mazo
- [x] Máquina con cinco cartas distintas
- [x] Turno inicial aleatorio
- [x] Daño aleatorio 0.85–1.15
- [x] No regeneración de la carta vencedora
- [x] Ranking acumulativo
- [x] Top 3
- [x] Historial de batallas
- [x] Login administrativo
- [x] GET
- [x] POST
- [x] PUT
- [x] PATCH
- [x] DELETE
- [x] Separación API/componentes/utilidades/datos
- [x] `.env`
- [x] `.env.example`
- [x] Responsive
- [x] Estados de carga/error
- [x] Animaciones CSS
- [x] Audio
- [x] README
- [ ] Completar nombres de integrantes
- [ ] Reemplazar imágenes placeholder por las tarjetas finales
- [ ] Configurar API de producción
- [ ] Publicar frontend
- [ ] Agregar URL del repositorio y URL de GitHub Pages
- [ ] Registrar hash del último commit válido

## 11. Credenciales de evaluación

```text
Administrador:
usuario: administrador
contraseña: tarjetas2026
```