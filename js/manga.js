import { db } from "./firebase.js";
import {
  doc, getDoc, collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const mangaId = params.get("id");

const mangaTitle = document.getElementById("mangaTitle");
const mangaDescription = document.getElementById("mangaDescription");
const mangaCover = document.getElementById("mangaCover");
const chaptersGrid = document.querySelector(".chapters-grid");

async function loadManga() {
  if (!mangaId) return;

  // 1. CARGAR INFORMACIÓN DEL MANGA
  const mangaRef = doc(db, "mangas", mangaId);
  const mangaSnap = await getDoc(mangaRef);

  if (mangaSnap.exists()) {
    const manga = mangaSnap.data();
    mangaTitle.textContent = manga.title;
    mangaDescription.textContent = manga.description;
    mangaCover.src = manga.cover;
  }

  // 2. CARGAR CAPÍTULOS
  const q = query(collection(db, "tomos"), where("mangaId", "==", mangaId));
  const querySnapshot = await getDocs(q);
  
  let chapters = [];
  querySnapshot.forEach((docItem) => {
    chapters.push(docItem.data());
  });

  // 3. ORDEN INVERSO (Nuevo arriba)
  // Usamos parseFloat para que números como 1.1 o 105 se ordenen correctamente
  chapters.sort((a, b) => parseFloat(b.number) - parseFloat(a.number));

  // 4. APLICAR DISEÑO DE LISTA (Usando las clases de tu CSS v18)
  chaptersGrid.innerHTML = ""; // Limpiamos el "Cargando..."
  chaptersGrid.className = "chapters-grid-list"; // Cambiamos la cuadrícula por la lista

  chapters.forEach((tomo) => {
    chaptersGrid.innerHTML += `
      <a href="reader.html?manga=${mangaId}&tomo=${tomo.number}" class="chapter-row-item">
        <div class="chapter-row-left">
          <img src="${tomo.cover}" class="chapter-row-img">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.75rem; color: #ff0055; font-weight: bold;">CAPÍTULO</span>
            <span style="font-size: 1.2rem; font-weight: bold; color: white;">${tomo.number}</span>
          </div>
        </div>
        <div style="background: #ff0055; color: white; padding: 8px 20px; border-radius: 6px; font-weight: bold; font-size: 0.8rem;">
          LEER
        </div>
      </a>
    `;
  });
}

loadManga();
