import { db, collection, getDocs } from "./firebase.js";

const resultsGrid = document.getElementById("results-grid");
const searchTitle = document.getElementById("search-title");

async function performSearch() {
    // 1. Obtener el término de búsqueda de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const queryTerm = urlParams.get('q');

    if (!queryTerm) {
        searchTitle.innerText = "No se ingresó ningún término de búsqueda";
        return;
    }

    searchTitle.innerText = `Resultados para: "${queryTerm}"`;
    resultsGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Buscando coincidencias...</p>";

    try {
        // 2. Traer todos los mangas (Firebase no permite búsqueda parcial "LIKE" eficiente, así que filtramos en JS)
        const querySnapshot = await getDocs(collection(db, "mangas"));
        const matches = [];

        querySnapshot.forEach((doc) => {
            const manga = doc.data();
            const title = manga.title.toLowerCase();
            const search = queryTerm.toLowerCase();

            // Lógica de coincidencia parcial (Si "Naruto Shippuden" incluye "naruto")
            if (title.includes(search)) {
                matches.push({ id: doc.id, ...manga });
            }
        });

        // 3. Renderizar resultados
        renderResults(matches);

    } catch (error) {
        console.error("Error en la búsqueda:", error);
        resultsGrid.innerHTML = "<p>Error al conectar con la base de datos.</p>";
    }
}

function renderResults(mangaList) {
    resultsGrid.innerHTML = "";

    if (mangaList.length === 0) {
        resultsGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding:50px; color:#555;'>No se encontraron mangas que coincidan con tu búsqueda.</p>";
        return;
    }

    mangaList.forEach(manga => {
        const cleanDesc = manga.description ? manga.description.replace(/"/g, '&quot;') : "";
        resultsGrid.innerHTML += `
            <div class="manga-card" data-description="${cleanDesc}">
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

performSearch();
