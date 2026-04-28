import { db, collection, getDocs } from "./firebase.js";

const mangaGrid = document.querySelector(".manga-grid");
const continueContainer = document.getElementById("continue-container");
const continueCardPlace = document.getElementById("continue-card-place");

// 1. FUNCIÓN PARA REVISAR EL PROGRESO GUARDADO
function checkLastRead() {
    const saved = localStorage.getItem('lastReadM4A');
    
    if (saved) {
        const data = JSON.parse(saved);
        
        // Mostramos el contenedor
        continueContainer.style.display = "block";
        
        // Creamos la tarjeta (usamos la misma clase para que se vea igual de nítido)
        continueCardPlace.innerHTML = `
            <div class="manga-grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
                <div class="manga-card">
                    <div class="cover-container">
                        <img class="cover" src="${data.mangaCover}" alt="${data.mangaTitle}">
                    </div>
                    <div class="manga-info">
                        <h3>${data.mangaTitle}</h3>
                        <p style="font-size: 0.8rem; color: #ff0055; margin-bottom: 10px;">
                            Te quedaste en el Cap. ${data.displayNumber}
                        </p>
                        <a class="btn" href="reader.html?manga=${data.mangaId}&number=${data.chapterNumber}">
                            Reanudar
                        </a>
                    </div>
                </div>
            </div>
            <hr style="border: 0; border-top: 1px solid #222; margin-top: 40px;">
        `;
    }
}

// 2. FUNCIÓN ORIGINAL DE CARGA DE DESTACADOS
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

// Ejecutamos ambas
checkLastRead();
loadMangas();
