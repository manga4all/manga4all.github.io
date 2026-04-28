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
const updatesList = document.getElementById("updates-list");

// 1. Lógica de Continuar Leyendo
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

// 2. Lógica de Últimas Actualizaciones (Slider)
async function loadUpdates() {
    if (!updatesList) return;
    try {
        const q = query(collection(db, "tomos"), limit(10));
        const querySnapshot = await getDocs(q);
        updatesList.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const tomo = doc.data();
            updatesList.innerHTML += `
                <a href="reader.html?manga=${tomo.mangaId}&number=${tomo.number}" class="update-item">
                    <div class="update-cover-wrapper">
                        <img src="${tomo.cover}" alt="Capítulo ${tomo.number}">
                    </div>
                    <div class="update-info">
                        <span>Capítulo ${parseFloat(tomo.number)}</span>
                    </div>
                </a>
            `;
        });
    } catch (e) { console.error(e); }
}

// 3. Lógica de Destacados
async function loadMangas() {
    if (!mangaGrid) return;
    try {
        const querySnapshot = await getDocs(collection(db, "mangas"));
        mangaGrid.innerHTML = "";
        querySnapshot.forEach((doc) => {
            const manga = doc.data();
            const cleanDesc = manga.description ? manga.description.replace(/"/g, '&quot;') : "";
            mangaGrid.innerHTML += `
                <div class="manga-card" data-description="${cleanDesc}">
                    <div class="cover-container">
                        <img class="cover" src="${manga.cover}" alt="${manga.title}">
                    </div>
                    <div class="manga-info">
                        <h3>${manga.title}</h3>
                        <a class="btn" href="manga.html?id=${doc.id}">Leer</a>
                    </div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

checkLastRead();
loadUpdates();
loadMangas();
