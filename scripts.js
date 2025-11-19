document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-links a");

  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const seccion = e.target.dataset.seccion;
      cargarSeccion(seccion);
      localStorage.setItem("ultimaSeccion", seccion);
    });
  });

  const seccionGuardada = localStorage.getItem("ultimaSeccion") || "Inicio";
  cargarSeccion(seccionGuardada);
});

function cargarSeccion(seccion) {
  const main = document.getElementById("contenido-principal");

  switch (seccion) {
    case "Inicio":
      main.innerHTML = `
        <section class="hero">
          <h2>Bienvenido a GameVault</h2>
          <p>Descubre, comparte y disfruta los mejores juegos indie creados por la comunidad.</p>
          <a href="#" class="btn" id="explorar-btn">Explorar juegos</a>
        </section>

        <section class="featured">
          <h3>Proyectos destacados</h3>
          <div class="projects">
            <div class="project-card">
              <img src="/static/img/terraria.jpg" alt="Terraria">
              <h4>Terraria</h4>
              <p>Juego de exploración y construcción pixel art.</p>
              <a href="#" class="btn-small">Ver más</a>
            </div>
            <div class="project-card">
              <img src="/static/img/rdr2.jpg" alt="Red Dead Redemption 2">
              <h4>Red Dead Redemption 2</h4>
              <p>Aventura épica en el salvaje oeste.</p>
              <a href="#" class="btn-small">Ver más</a>
            </div>
            <div class="project-card">
              <img src="/static/img/cs2.jpg" alt="Counter-Strike 2">
              <h4>Counter-Strike 2</h4>
              <p>Shooter competitivo de alto nivel.</p>
              <a href="#" class="btn-
              small">Ver más</a>
            </div>
          </div>
        </section>
      `;
      break;

    case "Explorar":
  main.innerHTML = `
    <section class="featured">
      <h3>Explorar Juegos</h3>

      <div style="text-align:center;margin-bottom:15px;">
        <button id="btn-cargar-steam" class="btn-small">Cargar Juegos desde Steam</button>
      </div>

      <div class="projects" id="lista-juegos">
        <p id="steam-status" style="text-align:center;color:#aaa;">Haz clic en "Cargar Juegos desde Steam"</p>
      </div>
    </section>
  `;

  const contenedor = document.getElementById("lista-juegos");
  const btn = document.getElementById("btn-cargar-steam");
  const status = document.getElementById("steam-status");

  btn.addEventListener("click", async () => {
    status.textContent = "Cargando juegos…";
    try {
      const res = await fetch("/api/juegos_steam");
      if (!res.ok) {
        throw new Error("Error al obtener datos de Steam: " + res.status);
      }
      const data = await res.json();
      const juegos = data.juegos;

      if (!Array.isArray(juegos) || juegos.length === 0) {
        status.textContent = "No se encontraron juegos de Steam.";
        return;
      }

      contenedor.innerHTML = "";
      juegos.forEach(j => {
        const card = document.createElement("div");
        card.classList.add("project-card");
        card.innerHTML = `
          <img src="${j.imagen}" alt="${j.nombre}" onerror="this.src='/static/img/default.jpg'">
          <h4>${j.nombre}</h4>
          <a href="https://store.steampowered.com/app/${j.id}" target="_blank" class="btn-small">Ver en Steam</a>
        `;
        contenedor.appendChild(card);
      });
    } catch (error) {
      console.error("Error cargando juegos desde Steam:", error);
      status.textContent = "Error cargando juegos. Revisa la consola.";
    }
  });

  break;

    case "Comunidad":
      main.innerHTML = `
        <section class="featured">
          <h3>Comunidad GameVault</h3>
          <p style="text-align:center;color:#ccc;">Publica tus ideas, proyectos o capturas.</p>
          
          <div style="max-width:500px;margin:20px auto;text-align:center;">
            <textarea id="post-text" placeholder="¿Qué estás pensando?" style="width:100%;height:80px;border-radius:8px;padding:10px;"></textarea>
            <br>
            <button id="publicar-btn" class="btn-small">Publicar</button>
          </div>

          <div id="muro-posts" style="max-width:600px;margin:auto;"></div>
        </section>
      `;
      break;

    case "Perfil":
      main.innerHTML = `
        <section class="featured">
          <h3>Tu Perfil</h3>
          <div class="project-card" style="max-width:400px;margin:auto;text-align:center;">
            <img id="avatar-img" src="${localStorage.getItem("avatarImg") || "https://cdn-icons-png.flaticon.com/512/1077/1077012.png"}"
                 alt="Avatar perfil" style="width:120px;height:120px;border-radius:50%;">

            <h4>Usuario: ${localStorage.getItem("usuario") || "Invitado"}</h4>
            <p>Nivel 12 | 34 juegos subidos</p>
            <input type="file" id="file-input" accept="image/*" style="display:none;">
            <a href="#" class="btn-small" id="editar-btn">Editar Perfil</a>
          </div>
        </section>
      `;

      const editarBtn = document.getElementById("editar-btn");
      const fileInput = document.getElementById("file-input");
      const avatarImg = document.getElementById("avatar-img");

      editarBtn.addEventListener("click", e => { e.preventDefault(); fileInput.click(); });

      fileInput.addEventListener("change", event => {
        const archivo = event.target.files[0];
        if (archivo) {
          const lector = new FileReader();
          lector.onload = e => {
            const dataURL = e.target.result;
            avatarImg.src = dataURL;
            localStorage.setItem("avatarImg", dataURL);
          };
          lector.readAsDataURL(archivo);
        }
      });
      break;

    case "Subir":
      main.innerHTML = `
        <section class="upload-container">
          <h2 class="upload-title">Subir un Juego</h2>
          <p class="upload-subtitle">Comparte tu creación con la comunidad</p>

          <div class="upload-form">

            <label class="upload-label">Nombre del juego</label>
            <input type="text" id="juego-nombre" class="upload-input">

            <label class="upload-label">Descripción</label>
            <textarea id="juego-desc" class="upload-textarea"></textarea>

            <label class="upload-label">Imagen de portada</label>
            <input type="file" id="juego-img" class="upload-input" accept="image/*">

            <label class="upload-label">Archivo del juego</label>
            <input type="file" id="juego-archivo" class="upload-input" accept=".zip,.rar">

            <button id="btn-subir-juego" class="upload-btn">Subir Juego</button>
          </div>
        </section>
      `;
      break;
  }
}
