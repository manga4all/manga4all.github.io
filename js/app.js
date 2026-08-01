import { db } from "./firebase.js";
import { 
    collection, 
    getDocs, 
    query, 
    limit,
    orderBy,
    where
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const mangaGrid = document.getElementById("manga-grid");
const updatesTrack = document.getElementById("updates-track");
const newsGrid = document.getElementById("news-grid");

// 1. LÓGICA: ÚLTIMAS ACTUALIZACIONES (1 POR SERIE)
async function loadUpdates() {
    if (!updatesTrack) return;
    try {
        const qMangas = query(collection(db, "mangas"), limit(10));
        const mangasSnap = await getDocs(qMangas);
        
        let htmlContent = "";
        
        const updatePromises = mangasSnap.docs.map(async (mangaDoc) => {
            const mangaData = mangaDoc.data();
            const mangaId = mangaDoc.id;

            const qUltimoTomo = query(
                collection(db, "tomos"),
                where("mangaId", "==", mangaId),
                orderBy("number", "desc"), 
                limit(1)
            );
            
            const tomoSnap = await getDocs(qUltimoTomo);
            
            if (!tomoSnap.empty) {
                const tomo = tomoSnap.docs[0].data();
                const num = parseFloat(tomo.number);
                
                return `
                    <a href="reader.html?manga=${mangaId}&number=${tomo.number}" class="update-item">
                        <div class="update-cover-wrapper">
                            <img src="${tomo.cover}" alt="${mangaData.title}">
                        </div>
                        <div class="update-info">
                            <strong style="display:block; font-size:0.8rem; color:white; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; margin-bottom:2px; text-align:center;">${mangaData.title}</strong>
                            <span>Capítulo ${num}</span>
                        </div>
                    </a>
                `;
            }
            return ""; 
        });

        const results = await Promise.all(updatePromises);
        htmlContent = results.join("");

        if (htmlContent === "") return;

        updatesTrack.innerHTML = htmlContent + htmlContent;

    } catch (e) { 
        console.error("Error cargando actualizaciones:", e); 
    }
}

// 2. LÓGICA: DESTACADOS (LIMITADO A 10)
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

// 3. LÓGICA: NOTICIAS (ACORDEÓN DINÁMICO)
async function loadNews() {
    if (!newsGrid) return;

    try {
        const q = query(collection(db, "noticias"), orderBy("createdAt", "desc"), limit(5));
        const newsSnap = await getDocs(q);

        if (newsSnap.empty) {
            newsGrid.innerHTML = "<p style='color:#666; text-align:center; padding: 20px;'>Próximamente más novedades.</p>";
            return;
        }

        let newsHtml = "";
        
        newsSnap.forEach(doc => {
            const n = doc.data();
            const rawContent = n.content || n.desc || "Sin contenido disponible.";
            const cleanContent = rawContent
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');

            newsHtml += `
                <article class="news-card" onclick="toggleNewsAccordion(this)">
                    <div class="news-header">
                        <div class="news-meta">
                            <span class="news-date">${n.date || 'NOTICIA'}</span>
                            <h3 class="news-title">${n.title}</h3>
                        </div>
                        <div class="news-toggle-icon">▼</div>
                    </div>
                    <div class="news-body-container">
                        <div class="news-body">
                            <p class="news-content">${cleanContent}</p>
                        </div>
                    </div>
                </article>
            `;
        });

        newsGrid.innerHTML = newsHtml;

    } catch (e) {
        console.error("Error al cargar noticias:", e);
        newsGrid.innerHTML = "<p style='color:#888; text-align:center; padding: 20px;'>No se pudieron cargar las noticias.</p>";
    }
}

// Función global para el evento de clic en el acordeón de noticias
window.toggleNewsAccordion = function(element) {
    element.classList.toggle('expanded');
};

// Ejecución inicial
loadUpdates();
loadMangas();
loadNews();
