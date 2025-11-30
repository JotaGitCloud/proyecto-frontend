window.__GV_JUEGOS = null;

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function fetchGamesAndCache() {
  try {
    const res = await fetch("/api/juegos");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const juegos = await res.json();
    window.__GV_JUEGOS = juegos;
  } catch (e) {
    window.__GV_JUEGOS = [];
  }
}

function renderExplorarIfVisible() {
  const cont = document.getElementById("lista-juegos");
  if (!cont || !window.__GV_JUEGOS) return;

  cont.innerHTML = "";
  window.__GV_JUEGOS.forEach(j => {
    const card = document.createElement("div");
    card.className = "juego-card";
    card.innerHTML = `
      <h4>${escapeHtml(j.name || "Sin nombre")}</h4>
      <p>${escapeHtml(j.short_description || "Sin descripción")}</p>
      <p><strong>${escapeHtml(j.price || "Gratis")}</strong></p>
    `;
    cont.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchGamesAndCache();
  activarNavegacion();
});


// ---------------------------------------------------------
//  NAVEGACIÓN SPA — SECCIONES COMPLETAS
// ---------------------------------------------------------

function activarNavegacion() {
  document.querySelectorAll(".nav-links a, .btn[data-seccion]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      cargarSeccion(link.dataset.seccion);
    });
  });

  cargarSeccion("Inicio");
}

function cargarSeccion(seccion) {
  const main = document.getElementById("contenido-principal");

  switch (seccion) {

    case "Inicio":
      main.innerHTML = `
        <section class="hero">
          <h2>Bienvenido a GameVault</h2>
          <p>Descubre y comparte juegos indie creados por la comunidad.</p>
          <a href="#" class="btn" data-seccion="Explorar">Explorar juegos</a>
        </section>
      `;
      break;

    case "Explorar":
      main.innerHTML = `
        <section class="featured">
          <h3>Explorar Juegos</h3>
          <div id="lista-juegos"></div>
        </section>
      `;
      renderExplorarIfVisible();
      break;

    case "Comunidad":
      main.innerHTML = `
        <section class="featured">
          <h3>Comunidad</h3>
          <p style="text-align:center;color:#ccc;">Foros, galerías y eventos próximamente.</p>
        </section>
      `;
      break;

    case "Subir":
      main.innerHTML = `
        <div class="upload-container">
          <h2 class="upload-title">Subir Juego</h2>
          <form id="form-subida" class="upload-form">
            <label class="upload-label">Título</label>
            <input class="upload-input" id="titulo">

            <label class="upload-label">Descripción</label>
            <textarea class="upload-textarea" id="descripcion"></textarea>

            <button class="upload-btn" type="submit">Publicar</button>
          </form>
          <p id="msg-subida" style="margin-top:12px;color:#7f7;"></p>
        </div>
      `;

      document.getElementById("form-subida").addEventListener("submit", subirJuego);
      break;

    case "Perfil":
  main.innerHTML = `
    <section class="featured">
      <h3>Tu Perfil</h3>
      <div id="perfil-datos" style="text-align:center;color:#ccc;">Cargando...</div>
    </section>
  `;

  cargarPerfil();
  break;

  }
}


// ---------------------------------------------------------
//  SUBIR JUEGO — ENVÍO DE INFORMACIÓN A FLASK
// ---------------------------------------------------------

async function subirJuego(e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const msg = document.getElementById("msg-subida");

  if (!titulo || !descripcion) {
    msg.textContent = "Completa todos los campos.";
    msg.style.color = "#f77";
    return;
  }

  const res = await fetch("/api/subir_juego", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({titulo, descripcion})
  });

  const data = await res.json();

  if (data.ok) {
    msg.textContent = "Juego publicado correctamente.";
    msg.style.color = "#7f7";
    document.getElementById("titulo").value = "";
    document.getElementById("descripcion").value = "";
  } else {
    msg.textContent = "Error al publicar.";
    msg.style.color = "#f77";
  }

  async function cargarPerfil() {
  const cont = document.getElementById("perfil-datos");
  if (!cont) return;

  try {
    const res = await fetch("/api/perfil");
    const data = await res.json();

    if (!data.ok) {
      cont.innerHTML = "<p>No se pudo cargar el perfil.</p>";
      return;
    }

    cont.innerHTML = `
      <div class="project-card" style="max-width:400px;margin:0 auto;">
        <h4>Información del usuario</h4>
        <p><strong>Nombre:</strong> ${escapeHtml(data.nombre)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Juegos subidos:</strong> 0 (pronto)</p>
      </div>
    `;

  } catch (e) {
    cont.innerHTML = "<p>Error al cargar perfil.</p>";
  }
}

document.querySelectorAll("[data-seccion]").forEach(btn => {
    btn.addEventListener("click", e => {
        e.preventDefault();
        const seccion = btn.getAttribute("data-seccion");

        fetch(`/${seccion.toLowerCase()}`)
            .then(res => res.text())
            .then(html => {
                document.getElementById("contenido-principal").innerHTML = html;
                window.history.pushState({}, "", "/" + seccion.toLowerCase());
            });
    });
});

}
