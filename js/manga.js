import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const mangaId = params.get("id");
const mangaTitle = document.getElementById("mangaTitle");
const mangaDescription = document.getElementById("mangaDescription");
const mangaCover = document.getElementById("mangaCover");
const chaptersGrid = document.querySelector(".chapters-grid");

async function loadManga() {
  if (!mangaId) return;

  try {
    // 1. CARGAR DATOS DEL MANGA
    const mangaRef = doc(db, "mangas", mangaId);
    const mangaSnap = await getDoc(mangaRef);

    if (mangaSnap.exists()) {
      const manga = mangaSnap.data();
      mangaTitle.textContent = manga.title;
      mangaDescription.textContent = manga.description;
      mangaCover.src = manga.cover;
    }

    // 2. CARGAR TOMOS
    const q = query(
      collection(db, "tomos"),
      where("mangaId", "==", mangaId),
      orderBy("number", "desc")
    );

    const querySnapshot = await getDocs(q);
    chaptersGrid.innerHTML = ""; 

    querySnapshot.forEach((docSnap) => {
      const tomo = docSnap.data();
      const num = tomo.number;
      const portada = tomo.cover;

      // Creamos la fila compacta
      const filaHtml = `
        <a class="chapter-row" href="reader.html?manga=${mangaId}&number=${num}">
          <div class="row-left">
            <img src="${portada}" class="cap-thumb" alt="Cap ${num}">
            <div class="cap-text">
              <span class="cap-label">CAPÍTULO</span>
              <span class="cap-number">${num}</span>
            </div>
          </div>
          <div class="row-right">
            <span class="read-btn">LEER</span>
          </div>
        </a>`;
      
      chaptersGrid.innerHTML += filaHtml;
    });

  } catch (error) {
    console.error("Error cargando manga:", error);
  }
}

loadManga();
