function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function qs(sel, ctx = document) {
  return ctx.querySelector(sel);
}

function qsa(sel, ctx = document) {
  return Array.from(ctx.querySelectorAll(sel));
}

window.__GV_JUEGOS = null;

async function fetchGamesAndCache() {
  try {
    const res = await fetch("/api/juegos");
    if (!res.ok) throw 0;
    const juegos = await res.json();
    window.__GV_JUEGOS = Array.isArray(juegos) ? juegos : [];
  } catch {
    window.__GV_JUEGOS = [];
  }
}

function buildGameCard(j) {
  const c = document.createElement("article");
  c.className = "game-card";
  const img = j.image ? `/static/uploads/images/${j.image}` : (j.header_image || "https://i.imgur.com/3GvwNBf.png");

  c.innerHTML = `
    <img src="${escapeHtml(img)}" alt="">
    <h4>${escapeHtml(j.name || "Juego")}</h4>
    <p class="desc">${escapeHtml(j.description || j.short_description || "Sin descripción.")}</p>
    <p class="precio">${escapeHtml(j.price || "Gratis")}</p>
    <div class="game-actions">
      <a href="#" class="btn-small ver-detalle" data-id="${escapeHtml(j.id || "")}">Ver</a>
      ${j.file ? `<a class="btn-small" href="/static/uploads/files/${escapeHtml(j.file)}" download>Descargar</a>` : ""}
    </div>
  `;
  return c;
}

function renderExplorarControls(container) {
  container.innerHTML = `
    <div class="explore-controls">
      <input id="explore-search" placeholder="Buscar juegos...">
      <select id="explore-filter">
        <option value="todos">Todos</option>
        <option value="indie">Indie</option>
        <option value="accion">Acción</option>
        <option value="aventura">Aventura</option>
        <option value="deporte">Deporte</option>
      </select>
      <button id="btn-explore" class="btn-small">Filtrar</button>
      <button id="btn-refresh" class="btn-small">Actualizar</button>
    </div>
    <div id="explore-results" class="grid-juegos"></div>
  `;

  qs("#btn-explore").onclick = () => {
    const q = qs("#explore-search").value.toLowerCase();
    const f = qs("#explore-filter").value;
    renderExplorarIfVisible({ query: q, filtro: f });
  };

  qs("#btn-refresh").onclick = async () => {
    await fetchGamesAndCache();
    renderExplorarIfVisible();
  };
}

function renderExplorarIfVisible(opts = {}) {
  const cont = qs("#explore-results");
  if (!cont) return;

  let lista = (window.__GV_JUEGOS || []).slice();
  const q = (opts.query || "").toLowerCase();
  const filtro = opts.filtro || "todos";

  if (q) {
    lista = lista.filter(j =>
      (j.name || "").toLowerCase().includes(q) ||
      (j.description || j.short_description || "").toLowerCase().includes(q)
    );
  }

  if (filtro !== "todos") {
    lista = lista.filter(j =>
      ((j.description || j.short_description || j.name || "") + "")
        .toLowerCase()
        .includes(filtro)
    );
  }

  cont.innerHTML = "";
  if (lista.length === 0) {
    cont.innerHTML = `<p class="no-result">No se encontraron juegos.</p>`;
    return;
  }

  lista.forEach(j => cont.appendChild(buildGameCard(j)));

  qsa(".ver-detalle", cont).forEach(btn => {
    btn.onclick = e => {
      e.preventDefault();
      const id = btn.dataset.id;
      const juego = (window.__GV_JUEGOS || []).find(j => String(j.id) === String(id));
      if (juego) openDetalleJuego(juego);
    };
  });
}

function openDetalleJuego(j) {
  const o = document.createElement("div");
  o.className = "gv-modal-overlay";

  const img = j.image ? `/static/uploads/images/${j.image}` : (j.header_image || "");

  o.innerHTML = `
    <div class="gv-modal">
      <button class="gv-modal-close">Cerrar</button>
      <div class="gv-modal-body">
        <img src="${escapeHtml(img)}">
        <div class="gv-modal-info">
          <h3>${escapeHtml(j.name)}</h3>
          <p>${escapeHtml(j.description || j.short_description || "Sin descripción")}</p>
          <p class="precio">${escapeHtml(j.price || "Gratis")}</p>
          ${j.file ? `<a class="btn-small" href="/static/uploads/files/${escapeHtml(j.file)}" download>Descargar archivo</a>` : ""}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(o);

  o.querySelector(".gv-modal-close").onclick = () => o.remove();
  o.onclick = e => { if (e.target === o) o.remove(); };
}

function renderComunidad() {
  qs("#contenido-principal").innerHTML = `
    <section class="featured">
      <h3>Comunidad</h3>
      <p class="c-sub">Participa en foros, comparte capturas y únete a eventos.</p>
      <div class="community-grid">
        <div class="project-card"><h4>Foros</h4><p>Publica guías y preguntas.</p></div>
        <div class="project-card"><h4>Galería</h4><p>Sube capturas y arte.</p></div>
        <div class="project-card"><h4>Eventos</h4><p>Torneos y retos semanales.</p></div>
      </div>
      <div class="community-feed">
        <h4>Últimas publicaciones</h4>
        <div class="project-card">
          <strong>Bienvenida</strong>
          <p>Comparte lo que quieras en GameVault.</p>
        </div>
      </div>
    </section>
  `;
}

function renderSubirJuego() {
  qs("#contenido-principal").innerHTML = `
    <section class="featured">
      <h3>Subir Juego</h3>
      <p class="c-sub">Aceptamos .zip y .rar</p>
      <div class="upload-box">
        <form id="form-subida-archivo" enctype="multipart/form-data">
          <label>Título</label>
          <input id="titulo" name="titulo" required>

          <label>Descripción</label>
          <textarea id="descripcion" name="descripcion" required></textarea>

          <div class="upload-grid">
            <label class="avatar-btn">Imagen de portada
              <input type="file" id="imagen" name="imagen" accept="image/*">
            </label>
            <label class="avatar-btn">Archivo del juego
              <input type="file" id="archivo" name="archivo" accept=".zip,.rar">
            </label>
          </div>

          <button class="btn" id="btn-publicar" type="submit">Publicar</button>
          <span id="msg-subida"></span>
        </form>
      </div>
    </section>
  `;

  qs("#form-subida-archivo").onsubmit = async e => {
    e.preventDefault();
    handleUploadForm();
  };
}

async function handleUploadForm() {
  const titulo = qs("#titulo").value.trim();
  const descripcion = qs("#descripcion").value.trim();
  const imagen = qs("#imagen").files[0];
  const archivo = qs("#archivo").files[0];
  const msg = qs("#msg-subida");

  if (!titulo || !descripcion) {
    msg.textContent = "Completa todos los campos.";
    msg.style.color = "#f55";
    return;
  }

  const fd = new FormData();
  fd.append("titulo", titulo);
  fd.append("descripcion", descripcion);
  if (imagen) fd.append("imagen", imagen);
  if (archivo) fd.append("archivo", archivo);

  try {
    const res = await fetch("/api/subir_juego", { method: "POST", body: fd });
    const r = await res.json();

    if (r.ok) {
      msg.textContent = "Subido correctamente.";
      msg.style.color = "#7f7";
      qs("#form-subida-archivo").reset();
      await fetchGamesAndCache();
    } else {
      msg.textContent = r.error || "Error al subir.";
      msg.style.color = "#f55";
    }
  } catch {
    msg.textContent = "Error de red.";
    msg.style.color = "#f55";
  }
}

async function cargarPerfil() {
  const cont = qs("#perfil-datos");
  if (!cont) return;

  try {
    const res = await fetch("/api/perfil");
    if (!res.ok) { cont.innerHTML = "No autenticado."; return; }

    const data = await res.json();
    if (!data.ok) { cont.innerHTML = "No se pudo cargar."; return; }

    const avatar = data.avatar ? `/static/avatars/${data.avatar}` : "https://i.imgur.com/MTYgH0j.png";

    cont.innerHTML = `
      <div class="perfil-card">
        <div class="perfil-avatar">
          <img src="${escapeHtml(avatar)}" id="avatar-preview">
          <label class="avatar-btn">Cambiar foto
            <input type="file" id="avatar-input" accept="image/*">
          </label>
        </div>

        <div class="perfil-info">
          <h2>${escapeHtml(data.nombre)}</h2>
          <p>${escapeHtml(data.email)}</p>
          <a href="#" id="btn-ver-juegos" class="btn-small">Mis juegos</a>
          <a href="/logout" class="btn-small">Cerrar sesión</a>
        </div>
      </div>

      <div class="perfil-stats">
        <div class="stat-box">
          <h4>Juegos Subidos</h4>
          <p id="stat-juegos">0</p>
        </div>
        <div class="stat-box">
          <h4>Actividad</h4>
          <p>Pronto</p>
        </div>
        <div class="stat-box">
          <h4>Nivel</h4>
          <p>1</p>
        </div>
      </div>
    `;

    const juegos = window.__GV_JUEGOS || [];
    qs("#stat-juegos").innerText = juegos.filter(j => j.publisher === data.nombre).length;

    qs("#avatar-input").onchange = async () => {
      const file = qs("#avatar-input").files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("avatar", file);
      const r = await fetch("/api/subir_avatar", { method: "POST", body: fd }).then(a => a.json());
      if (r.ok) {
        qs("#avatar-preview").src = `/static/avatars/${r.avatar}`;
      } else alert("Error al subir avatar");
    };

    qs("#btn-ver-juegos").onclick = e => {
      e.preventDefault();
      cargarSeccion("Explorar");
      setTimeout(() => {
        const cont = qs("#explore-results");
        qsa(".game-card", cont).forEach(c => {
          const t = c.querySelector("h4").textContent.toLowerCase();
          const d = c.querySelector(".desc").textContent.toLowerCase();
          if (!d.includes(data.nombre.toLowerCase()) && !t.includes(data.nombre.toLowerCase())) {
            c.style.opacity = "0.35";
          }
        });
      }, 200);
    };

  } catch {
    cont.innerHTML = "Error.";
  }
}

function activarNavegacion() {
  const links = qsa("[data-seccion]");
  links.forEach(l => {
    l.onclick = e => {
      e.preventDefault();
      cargarSeccion(l.dataset.seccion);
      qsa(".nav-links a").forEach(a => a.classList.remove("active"));
      if (l.tagName === "A") l.classList.add("active");
    };
  });

  cargarSeccion("Inicio");
}

function cargarSeccion(sec) {
  const main = qs("#contenido-principal");

  if (sec === "Inicio") {
    main.innerHTML = `
      <section class="hero">
        <h2>Bienvenido a GameVault</h2>
        <p>Tu espacio para descubrir y compartir juegos.</p>
        <a data-seccion="Explorar" class="btn">Explorar</a>
      </section>`;
    activarNavegacion();
    return;
  }

  if (sec === "Explorar") {
    main.innerHTML = `<section class="featured"><h3>Explorar Juegos</h3><div id="explore-area"></div></section>`;
    renderExplorarControls(qs("#explore-area"));
    if (!window.__GV_JUEGOS) fetchGamesAndCache().then(() => renderExplorarIfVisible());
    else renderExplorarIfVisible();
    return;
  }

  if (sec === "Comunidad") {
    renderComunidad();
    return;
  }

  if (sec === "Subir" || sec === "Subir Juego") {
    renderSubirJuego();
    return;
  }

  if (sec === "Perfil") {
    main.innerHTML = `<section class="featured"><h3>Tu Perfil</h3><div id="perfil-datos"></div></section>`;
    if (!window.__GV_JUEGOS) fetchGamesAndCache().then(() => cargarPerfil());
    else cargarPerfil();
    return;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchGamesAndCache();
  activarNavegacion();
  document.onkeydown = e => {
    if (e.key === "Escape") qsa(".gv-modal-overlay").forEach(m => m.remove());
  };
});
