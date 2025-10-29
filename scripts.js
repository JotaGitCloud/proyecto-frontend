document.addEventListener("DOMContentLoaded", () => {
  cargarJuegosDestacados();
});

async function cargarJuegosDestacados() {
  try {
    const response = await fetch("/api/juegos_destacados"); // tu ruta Flask/Django
    const juegos = await response.json();

    const contenedor = document.querySelector(".projects");
    contenedor.innerHTML = ""; 

    juegos.forEach(juego => {
      const card = document.createElement("div");
      card.classList.add("project-card");
      card.innerHTML = `
        <img src="${juego.imagen}" alt="${juego.titulo}">
        <h4>${juego.titulo}</h4>
        <p>${juego.descripcion}</p>
        <a href="/juego/${juego.id}" class="btn-small">Ver más</a>
      `;
      contenedor.appendChild(card);
    });
  } catch (error) {
    console.error("Error al cargar los juegos:", error);
  }
}