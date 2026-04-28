import { db, collection, getDocs } from "./firebase.js";

const mangaGrid = document.querySelector(".manga-grid");

async function loadMangas() {
  if(!mangaGrid) return;
  mangaGrid.innerHTML = "<div style='text-align:center; width:100%;'>Cargando catálogo...</div>";

  try {
    const querySnapshot = await getDocs(collection(db, "mangas"));
    mangaGrid.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const manga = doc.data();
      
      // Limpiamos la descripción para que las comillas no rompan el tooltip
      const rawDesc = manga.description || "Sin descripción disponible.";
      const cleanDesc = rawDesc.replace(/"/g, '&quot;');

      mangaGrid.innerHTML += `
        <div class="manga-card" data-description="${cleanDesc}">
          <div class="cover-container">
            <img class="cover" src="${manga.cover}" alt="${manga.title}">
          </div>
          <div class="manga-info">
            <h3>${manga.title}</h3>
            <a class="btn" href="manga.html?id=${doc.id}">Leer</a>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error cargando mangas:", error);
  }
}

loadMangas();
