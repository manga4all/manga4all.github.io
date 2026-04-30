import { db } from "./firebase.js";
import { 
    collection, 
    getDocs, 
    query, 
    limit,
    orderBy,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const mangaGrid = document.getElementById("manga-grid");
const continueContainer = document.getElementById("continue-container");
const continueCardPlace = document.getElementById("continue-card-place");
const updatesTrack = document.getElementById("updates-track");

// 1. LÓGICA: CONTINUAR LEYENDO (DESACTIVADA PARA EVITAR CONFLICTOS CON INDEX.HTML)
function checkLastRead() {
    // ... (Tu código actual se mantiene igual)
}

// 2. LÓGICA: ÚLTIMAS ACTUALIZACIONES (CARRUSEL INFINITO - 1 POR SERIE)
async function loadUpdates() {
    if (!updatesTrack) return;
    try {
        // Traemos los últimos 30 tomos para tener margen de filtrado
        const qTomos = query(
            collection(db, "tomos"), 
            orderBy("createdAt", "desc"), 
            limit(30)
        );
        const querySnapshot = await getDocs(qTomos);
        
        let uniqueMangas = new Map();
        
        // Filtramos para quedarnos solo con el último tomo de cada mangaId
        querySnapshot.forEach((doc) => {
            const tomo = doc.data();
            if (!uniqueMangas.has(tomo.mangaId) && uniqueMangas.size < 10) {
                uniqueMangas.set(tomo.mangaId, tomo);
            }
        });

        // Obtenemos los nombres de los mangas para mostrar en la barra
        const mangaDataMap = new Map();
        const mangaPromises = Array.from(uniqueMangas.keys()).map(async (id) => {
            const mangaSnap = await getDoc(doc(db, "mangas", id));
            if (mangaSnap.exists()) {
                mangaDataMap.set(id, mangaSnap.data().title);
            }
        });
        
        await Promise.all(mangaPromises);

        let htmlContent = "";
        uniqueMangas.forEach((tomo, mangaId) => {
            const mangaTitle = mangaDataMap.get(mangaId) || "Manga";
            const num = parseFloat(tomo.number);
            
            htmlContent += `
                <a href="reader.html?manga=${mangaId}&number=${tomo.number}" class="update-item">
                    <div class="update-cover-wrapper">
                        <img src="${tomo.cover}" alt="${mangaTitle}">
                    </div>
                    <div class="update-info">
                        <strong style="display:block; font-size:0.8rem; color:white; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">${mangaTitle}</strong>
                        <span>Capítulo ${num}</span>
                    </div>
                </a>
            `;
        });

        // Duplicamos el contenido para el efecto de scroll infinito
        updatesTrack.innerHTML = htmlContent + htmlContent;

    } catch (e) { 
        console.error("Error cargando actualizaciones:", e); 
    }
}

// 3. LÓGICA: DESTACADOS (LIMITADO A 10)
async function loadMangas() {
    if (!mangaGrid) return;
    try {
        const q = query(collection(db, "mangas"), limit(10));
        const querySnapshot = await getDocs(q);
        
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
loadUpdates();
loadMangas();
