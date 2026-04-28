import { db, collection, getDocs, query, limit } from "./firebase.js";

const mangaGrid = document.querySelector(".manga-grid");
const continueContainer = document.getElementById("continue-container");
const continueCardPlace = document.getElementById("continue-card-place");
const updatesList = document.getElementById("updates-list");

// 1. REVISAR PROGRESO GUARDADO
function checkLastRead() {
    const saved = localStorage.getItem('lastReadM4A');
    if (saved && continueContainer && continueCardPlace) {
        const data = JSON.parse(saved);
        continueContainer.style.display = "block";
        continueCardPlace.innerHTML = `
            <div class="manga-grid" style="grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));">
                <div class="manga-card">
                    <div class="cover-container">
                        <img class="cover" src="${data.mangaCover}" alt="${data.mangaTitle}">
                    </div>
                    <div class="manga-info">
                        <h3>${data.mangaTitle}</h3>
                        <p style="font-size: 0.85rem; color: #ff0055; margin-bottom: 12px; font-weight: bold;">
                            Capítulo ${data.displayNumber}
                        </p>
                        <a class="btn" href="reader.html?manga=${data.mangaId}&number=${data.chapterNumber}">
                            Reanudar
                        </a>
                    </div>
                </div>
            </div>
            <hr style="border: 0; border-top: 1px solid #111; margin-top: 40px; margin-bottom: 20px;">
        `;
    }
}

// 2. CARGAR ÚLTIMAS ACTUALIZACIONES (FILA HORIZONTAL)
async function loadUpdates() {
    if (!updatesList) return;
    
    try {
        // Consultamos la colección 'tomos' limitada a 10
        // Si tienes un campo 'createdAt', podrías añadir: orderBy("createdAt", "desc")
        const q = query(collection(db, "tomos"), limit(10));
        const querySnapshot = await getDocs(q);
        
        updatesList.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const tomo = doc.data();
            const num = parseFloat(tomo.number);

            updatesList.innerHTML += `
                <a href="reader.html?manga=${tomo.mangaId}&number=${tomo.number}" class="update-item">
                    <div class="update-cover-wrapper">
                        <img src="${tomo.cover}" alt="Capítulo ${num}" loading="lazy">
                    </div>
                    <div class="update-info">
                        <span>Capítulo ${num}</span>
                    </div>
                </a>
            `;
        });
    } catch (error) {
        console.error("Error cargando actualizaciones:", error);
    }
}

// 3. CARGAR DESTACADOS (GRID)
async function loadMangas() {
  if(!mangaGrid) return;
  mangaGrid.innerHTML = "<div style='text-align:center; width:100%;'>Cargando catálogo...</div>";

  try {
    const querySnapshot = await getDocs(collection(db, "mangas"));
    mangaGrid.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const manga = doc.data();
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

// Ejecutar todo
checkLastRead();
loadUpdates();
loadMangas();
