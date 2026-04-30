import { db, collection, getDocs } from "./firebase.js";

const directoryGrid = document.getElementById("directory-grid");
const genreContainer = document.getElementById("genre-container");

let allMangas = []; // Guardamos localmente para filtrar rápido
let currentGenre = "Todos";

async function initDirectory() {
    try {
        const querySnapshot = await getDocs(collection(db, "mangas"));
        allMangas = [];
        const genresSet = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const manga = { id: doc.id, ...data };
            allMangas.push(manga);
            
            // Recopilar géneros únicos
            if (data.genres) {
                data.genres.forEach(g => genresSet.add(g));
            }
        });

        // Crear botones de género dinámicamente
        renderGenreButtons(Array.from(genresSet).sort());
        
        // Mostrar todos inicialmente (A-Z)
        displayMangas(allMangas.sort((a, b) => a.title.localeCompare(b.title)));

    } catch (error) {
        console.error("Error al cargar directorio:", error);
    }
}

function renderGenreButtons(genres) {
    genres.forEach(genre => {
        const btn = document.createElement("button");
        btn.className = "filter-btn";
        btn.textContent = genre;
        btn.onclick = () => filterByGenre(genre, btn);
        genreContainer.appendChild(btn);
    });
}

// Función global para filtrar
window.filterByGenre = (genre, btnElement) => {
    currentGenre = genre;
    
    // UI: Cambiar botón activo
    document.querySelectorAll("#genre-container .filter-btn").forEach(b => b.classList.remove("active"));
    if(btnElement) btnElement.classList.add("active");
    else document.querySelector("#genre-container .filter-btn").classList.add("active");

    let filtered = allMangas;
    if (genre !== "Todos") {
        filtered = allMangas.filter(m => m.genres && m.genres.includes(genre));
    }
    displayMangas(filtered);
};

// Función global para ordenar
window.sortAlphabetical = (order) => {
    // UI: Cambiar botón activo
    document.querySelectorAll(".filter-group:first-child .filter-btn").forEach(b => b.classList.remove("active"));
    event.target.classList.add("active");

    const sorted = [...allMangas].sort((a, b) => {
        return order === 'asc' 
            ? a.title.localeCompare(b.title) 
            : b.title.localeCompare(a.title);
    });
    
    // Aplicar filtro de género actual sobre el nuevo orden
    let filtered = sorted;
    if (currentGenre !== "Todos") {
        filtered = sorted.filter(m => m.genres && m.genres.includes(currentGenre));
    }
    displayMangas(filtered);
};

function displayMangas(mangaList) {
    directoryGrid.innerHTML = "";
    if (mangaList.length === 0) {
        directoryGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding:50px; color:#555;'>No se encontraron mangas en esta categoría.</p>";
        return;
    }

    mangaList.forEach(manga => {
        // Limpiamos la descripción para que no rompa el HTML
        const cleanDesc = manga.description ? manga.description.replace(/"/g, '&quot;') : "Sin descripción disponible.";
        
        directoryGrid.innerHTML += `
            <div class="manga-card">
                <div class="tooltip">
                    <p>${cleanDesc}</p>
                </div>
                <div class="cover-container">
                    <img class="cover" src="${manga.cover}" alt="${manga.title}">
                </div>
                <div class="manga-info">
                    <h3>${manga.title}</h3>
                    <a class="btn" href="manga.html?id=${manga.id}">Leer</a>
                </div>
            </div>`;
    });
}

initDirectory();
