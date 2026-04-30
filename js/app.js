import { db } from "./firebase.js";
import { 
    collection, 
    getDocs, 
    query, 
    limit 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const mangaGrid = document.getElementById("manga-grid");
const continueContainer = document.getElementById("continue-container");
const continueCardPlace = document.getElementById("continue-card-place");
const updatesTrack = document.getElementById("updates-track");

// 1. LÓGICA: CONTINUAR LEYENDO (DESACTIVADA PARA EVITAR CONFLICTOS CON INDEX.HTML)
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

// 2. LÓGICA: ÚLTIMAS ACTUALIZACIONES (CARRUSEL INFINITO)
async function loadUpdates() {
    if (!updatesTrack) return;
    try {
        const q = query(collection(db, "tomos"), limit(10));
        const querySnapshot = await getDocs(q);
        
        let htmlContent = "";

        querySnapshot.forEach((doc) => {
            const tomo = doc.data();
            const num = parseFloat(tomo.number);
            htmlContent += `
                <a href="reader.html?manga=${tomo.mangaId}&number=${tomo.number}" class="update-item">
                    <div class="update-cover-wrapper">
                        <img src="${tomo.cover}" alt="Capítulo ${num}">
                    </div>
                    <div class="update-info">
                        <span>Capítulo ${num}</span>
                    </div>
                </a>
            `;
        });

        updatesTrack.innerHTML = htmlContent + htmlContent;

    } catch (e) { 
        console.error("Error cargando actualizaciones:", e); 
    }
}

// 3. LÓGICA: DESTACADOS (Con Tooltip integrado)
async function loadMangas() {
    if (!mangaGrid) return;
    try {
        const querySnapshot = await getDocs(collection(db, "mangas"));
        mangaGrid.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const manga = doc.data();
            const cleanDesc = manga.description ? manga.description.replace(/"/g, '&quot;') : "Sin descripción disponible.";
            
            mangaGrid.innerHTML += `
                <div class="manga-card">
                    <div class="tooltip">
                        <p>${cleanDesc}</p>
                    </div>
                    <div class="cover-container">
                        <img class="cover" src="${manga.cover}" alt="${manga.title}">
                    </div>
                    <div class="manga-info">
                        <h3>${manga.title}</h3>
                        <a class="btn" href="manga.html?id=${doc.id}">Leer</a>
                    </div>
                </div>`;
        });
    } catch (e) { 
        console.error("Error cargando destacados:", e); 
    }
}

// Ejecución inicial
// checkLastRead(); <-- COMENTADO PARA QUE NO SOBREESCRIBA EL HISTORIAL CORRECTO
loadUpdates();
loadMangas();
