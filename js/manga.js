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

  const mangaRef = doc(db, "mangas", mangaId);
  const mangaSnap = await getDoc(mangaRef);

  if (mangaSnap.exists()) {
    const manga = mangaSnap.data();
    mangaTitle.textContent = manga.title;
    mangaDescription.textContent = manga.description;
    mangaCover.src = manga.cover;
  }

  const q = query(collection(db, "tomos"), where("mangaId", "==", mangaId));
  const querySnapshot = await getDocs(q);
  
  let chapters = [];
  querySnapshot.forEach((doc) => {
    chapters.push(doc.data());
  });

  // ORDEN INVERSO: El más nuevo arriba
  chapters.sort((a, b) => parseFloat(b.number) - parseFloat(a.number));

  // LIMPIAR Y CAMBIAR CLASE PARA EVITAR CONFLICTOS
  chaptersGrid.innerHTML = "";
  chaptersGrid.className = "chapters-grid-list"; // Cambiamos la clase aquí

  chapters.forEach((tomo) => {
    chaptersGrid.innerHTML += `
      <a href="reader.html?manga=${mangaId}&tomo=${tomo.number}" class="chapter-row-item">
        <div class="chapter-row-left">
          <img src="${tomo.cover}" class="chapter-row-img">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.7rem; color: #ff0055; font-weight: bold;">CAPÍTULO</span>
            <span style="font-size: 1.2rem; font-weight: bold;">${tomo.number}</span>
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
