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
              <img src="img/terraria.jpg" alt="Terraria">
              <h4>Proyecto 1: Terraria</h4>
              <p>Juego de exploración y construcción pixel art.</p>
              <a href="#" class="btn-small">Ver más</a>
            </div>
            <div class="project-card">
              <img src="img/rdr2.jpg" alt="Red Dead Redemption 2">
              <h4>Proyecto 2: Red Dead Redemption 2</h4>
              <p>Aventura épica en el salvaje oeste.</p>
              <a href="#" class="btn-small">Ver más</a>
            </div>
            <div class="project-card">
              <img src="img/cs2.jpg" alt="Counter-Strike 2">
              <h4>Proyecto 3: Counter-Strike 2</h4>
              <p>El clásico shooter competitivo con gráficos actualizados.</p>
              <a href="#" class="btn-small">Ver más</a>
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
            <select id="filtro-categoria" class="btn-small">
              <option value="todos">Todas las categorías</option>
              <option value="accion">Acción</option>
              <option value="aventura">Aventura</option>
              <option value="rpg">RPG</option>
              <option value="simulacion">Simulación</option>
            </select>
          </div>

          <div class="projects" id="lista-juegos">
            <div class="project-card" data-cat="accion">
              <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/381210/header.jpg" alt="Dead by Daylight">
              <h4>Dead by Daylight</h4>
              <p>Horror multijugador 4v1.</p>
            </div>
            <div class="project-card" data-cat="rpg">
              <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg" alt="Hollow Knight">
              <h4>Hollow Knight</h4>
              <p>Aventura de acción metroidvania.</p>
            </div>
            <div class="project-card" data-cat="simulacion">
              <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/394360/header.jpg" alt="Hearts of Iron IV">
              <h4>Hearts of Iron IV</h4>
              <p>Simulación de estrategia militar.</p>
            </div>
          </div>
        </section>
      `;
      const filtro = document.getElementById("filtro-categoria");
      filtro.addEventListener("change", e => {
        const valor = e.target.value;
        document.querySelectorAll(".project-card").forEach(card => {
          if (valor === "todos" || card.dataset.cat === valor) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });
      });
      break;

    case "Comunidad":
  main.innerHTML = `
    <section class="featured">
      <h3>Comunidad GameVault — Chats</h3>

      <div class="comunidad-container">
        <div class="chat-list" style="flex:0 0 300px;min-width:260px;">
          <div style="display:flex;gap:8px;margin-bottom:8px;">
            <select id="filtrar-juego" style="flex:1;padding:8px;border-radius:6px;background:#111;color:#fff;">
              <option value="todos">Todos los juegos</option>
            </select>
            <button id="crear-chat-btn" class="btn-small">Crear chat</button>
          </div>
          <div id="lista-chats"></div>
        </div>

        <div class="chat-main" style="flex:1;min-width:320px;">
          <div id="chat-header"></div>
          <div id="mensajes"></div>
          <div class="chat-input">
            <input id="mensaje-input" placeholder="Escribe un mensaje...">
            <button id="enviar-btn">Enviar</button>
          </div>
        </div>

        <div class="chat-sidebar" style="flex:0 0 260px;min-width:220px;">
          <div style="background:rgba(25,25,25,0.6);padding:12px;border-radius:8px;">
            <h4>Chats del juego</h4>
            <div id="chats-por-juego" style="max-height:200px;overflow:auto;"></div>
          </div>
        </div>
      </div>
    </section>
  `;

  const STORAGE_KEY = "gv_chats_v3";
  const CURRENT_USER = localStorage.getItem("usuario") || "Anon";
  let chats = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  let juegosCache = [];
  let chatActivoId = null;

  const listaChatsEl = document.getElementById("lista-chats");
  const chatHeaderEl = document.getElementById("chat-header");
  const mensajesEl = document.getElementById("mensajes");
  const mensajeInput = document.getElementById("mensaje-input");
  const enviarBtn = document.getElementById("enviar-btn");
  const crearChatBtn = document.getElementById("crear-chat-btn");
  const filtrarJuegoSel = document.getElementById("filtrar-juego");
  const chatsPorJuegoEl = document.getElementById("chats-por-juego");

  fetch("/api/juegos").then(r => r.json()).then(d => {
    juegosCache = Array.isArray(d) ? d : [];
    juegosCache.forEach(j => {
      const opt = document.createElement("option");
      opt.value = j.id || j.titulo || j.name || JSON.stringify(j);
      opt.textContent = j.titulo || j.name || ("Juego " + (j.id || ""));
      filtrarJuegoSel.appendChild(opt);
    });
    renderChats();
    renderChatsPorJuego();
  }).catch(()=>{ renderChats(); renderChatsPorJuego(); });

  function guardar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }

  function crearChat({title, juegoId=null, members=[CURRENT_USER]}) {
    const id = "chat_" + Date.now();
    const chat = { id, title, juegoId, members, messages: [] };
    chats.unshift(chat);
    guardar();
    renderChats();
    setActivo(id);
  }

  function renderChats(filterJuego = "todos") {
    listaChatsEl.innerHTML = "";
    const lista = chats.filter(c => filterJuego === "todos" ? true : String(c.juegoId) === String(filterJuego));
    lista.forEach(c => {
      const div = document.createElement("div");
      div.className = "chat-card";
      div.innerHTML = `<strong>${c.title}</strong><div style="color:#aaa;font-size:12px;margin-top:6px;">Mensajes: ${c.messages.length}</div>`;
      div.addEventListener("click", ()=> setActivo(c.id));
      listaChatsEl.appendChild(div);
    });
  }

  function renderChatsPorJuego() {
    chatsPorJuegoEl.innerHTML = "";
    const juegosMap = {};
    chats.forEach(c => {
      if (c.juegoId) {
        juegosMap[c.juegoId] = juegosMap[c.juegoId] || [];
        juegosMap[c.juegoId].push(c);
      }
    });
    Object.entries(juegosMap).forEach(([jid, arr])=>{
      const cont = document.createElement("div");
      const game = juegosCache.find(g=>String(g.id)===String(jid));
      cont.innerHTML = `<div style="font-weight:700;color:#ff4655;margin-bottom:6px;">${game ? (game.titulo||game.name) : ("Juego "+jid)}</div>`;
      arr.forEach(c=>{
        const a = document.createElement("div");
        a.style.fontSize = "13px";
        a.style.cursor = "pointer";
        a.style.padding = "6px 0";
        a.textContent = c.title + " ("+c.messages.length+")";
        a.addEventListener("click", ()=> setActivo(c.id));
        cont.appendChild(a);
      });
      chatsPorJuegoEl.appendChild(cont);
    });
  }

  function setActivo(id) {
    chatActivoId = id;
    const chat = chats.find(c=>c.id===id);
    if (!chat) return;
    chatHeaderEl.textContent = chat.title;
    renderMensajes(chat);
  }

  function renderMensajes(chat) {
    mensajesEl.innerHTML = "";
    chat.messages.forEach(m=>{
      const d = document.createElement("div");
      d.className = "mensaje";
      d.innerHTML = `<strong>${m.sender}</strong> <small>${new Date(m.time).toLocaleTimeString()}</small><div>${m.text}</div>`;
      mensajesEl.appendChild(d);
    });
    mensajesEl.scrollTop = mensajesEl.scrollHeight;
  }

  function enviarMensaje() {
    const text = mensajeInput.value.trim();
    if (!text || !chatActivoId) return;
    const chat = chats.find(c=>c.id===chatActivoId);
    if (!chat) return;
    const msg = { sender: CURRENT_USER, text, time: new Date().toISOString() };
    chat.messages.push(msg);
    guardar();
    renderMensajes(chat);
    mensajeInput.value = "";
    renderChats();
  }

  enviarBtn.addEventListener("click", enviarMensaje);
  mensajeInput.addEventListener("keydown", e=> { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensaje(); } });

  crearChatBtn.addEventListener("click", ()=>{
    const title = prompt("Nombre del chat:");
    if (!title) return;
    crearChat({title});
  });

  if (!chats.length) {
    crearChat({ title: "General", members: [CURRENT_USER] });
    crearChat({ title: "Juegos", members: [CURRENT_USER] });
  } else {
    setActivo(chats[0].id);
  }

  break;

    case "Perfil":
      main.innerHTML = `
        <section class="featured">
        <section class="featured">
        <div class="banner-container">
        <img id="banner-img" 
         src="${localStorage.getItem("bannerImg") || "https://i.imgur.com/BFq0O3Z.jpeg"}" 
         alt="Banner de perfil" 
         class="perfil-banner">
        <div class="banner-overlay">
        <a href="#" class="btn-small" id="editar-banner-btn">Cambiar banner</a>
        <input type="file" id="banner-input" accept="image/*" style="display:none;">
        </div>
        </div>

          <div class="profile-container">
            <div class="profile-left">
              <div class="profile-card">
                <img id="avatar-img" src="${localStorage.getItem("avatarImg") || "https://cdn-icons-png.flaticon.com/512/1077/1077012.png"}" 
                     alt="Avatar perfil" class="perfil-avatar">
                <h4 id="perfil-usuario">Usuario: ${localStorage.getItem("usuario") || "Juan"}</h4>
                <p id="perfil-bio">${localStorage.getItem("bio") || "Jugador apasionado. Escribe aquí una breve biografía."}</p>
                <p id="perfil-detalles">Miembro desde ${localStorage.getItem("miembroDesde") || "2025"}</p>

                <div class="profile-actions">
                  <input type="file" id="file-input" accept="image/*" style="display:none;">
                  <a href="#" class="btn-small" id="editar-btn">Cambiar avatar</a>
                  <a href="#" class="btn-small" id="editar-bio-btn">Editar bio</a>
                </div>
              </div>
            </div>

            <div class="profile-right">
              <h3>Estadísticas de videojuegos</h3>

              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-title">Juegos subidos</div>
                  <div class="stat-value" id="stat-juegos">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-title">Reseñas</div>
                  <div class="stat-value" id="stat-resenas">0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-title">Puntuación media</div>
                  <div class="stat-value" id="stat-media">0.0</div>
                </div>
                <div class="stat-card">
                  <div class="stat-title">Género favorito</div>
                  <div class="stat-value" id="stat-genero">—</div>
                </div>
              </div>

              <h4 style="margin-top:18px;">Juegos recientes</h4>
              <div id="lista-reciente" class="projects" style="margin-top:10px;"></div>
            </div>
          </div>
        </section>
      `;

      const editarBtn = document.getElementById("editar-btn");
      const fileInput = document.getElementById("file-input");
      const avatarImg = document.getElementById("avatar-img");

      editarBtn.addEventListener("click", e => {
        e.preventDefault();
        fileInput.click();
      });

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

      const editarBioBtn = document.getElementById("editar-bio-btn");
      editarBioBtn.addEventListener("click", e => {
        e.preventDefault();
        const current = document.getElementById("perfil-bio").textContent;
        const nuevo = prompt("Escribe tu nueva biografía:", current) || current;
        document.getElementById("perfil-bio").textContent = nuevo;
        localStorage.setItem("bio", nuevo);
      });
       const cargarEstadisticas = () => {
        const juegos = JSON.parse(localStorage.getItem("misJuegos") || "[]");
        const resenas = JSON.parse(localStorage.getItem("misResenas") || "[]");

        document.getElementById("stat-juegos").textContent = juegos.length;
        document.getElementById("stat-resenas").textContent = resenas.length;

        const media = resenas.length
          ? (resenas.reduce((acc, r) => acc + (r.puntuacion || r.rating || 0), 0) / resenas.length).toFixed(1)
          : "0.0";
        document.getElementById("stat-media").textContent = media;

        
        const genero = (() => {
          const counts = {};
          juegos.forEach(j => {
            const g = j.genero || j.category || "Desconocido";
            counts[g] = (counts[g] || 0) + 1;
          });
          const entries = Object.entries(counts);
          if (!entries.length) return "—";
          entries.sort((a, b) => b[1] - a[1]);
          return entries[0][0];
        })();
        document.getElementById("stat-genero").textContent = genero;

        const lista = document.getElementById("lista-reciente");
        lista.innerHTML = "";
        (juegos.slice(-6).reverse() || []).forEach(j => {
          const div = document.createElement("div");
          div.classList.add("project-card");
          div.style.textAlign = "left";
          div.innerHTML = `
            <strong>${j.titulo || j.name || "Juego sin título"}</strong>
            <p style="color:#ccc;margin:6px 0 0;font-size:13px;">${j.descripcion || j.desc || ""}</p>
          `;
          lista.appendChild(div);
        });
      };
const bannerBtn = document.getElementById("editar-banner-btn");
const bannerInput = document.getElementById("banner-input");
const bannerImg = document.getElementById("banner-img");

bannerBtn.addEventListener("click", e => {
  e.preventDefault();
  bannerInput.click();
});

bannerInput.addEventListener("change", event => {
  const archivo = event.target.files[0];
  if (archivo) {
    const lector = new FileReader();
    lector.onload = e => {
      const dataURL = e.target.result;
      bannerImg.src = dataURL;
      localStorage.setItem("bannerImg", dataURL);
    };
    lector.readAsDataURL(archivo);
  }
});

      cargarEstadisticas();
      break;
  }
}
