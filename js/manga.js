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

  // 1. CARGAR DATOS DEL MANGA
  const mangaRef = doc(db, "mangas", mangaId);
  const mangaSnap = await getDoc(mangaRef);

  if (mangaSnap.exists()) {
    const manga = mangaSnap.data();
    mangaTitle.textContent = manga.title;
    mangaDescription.textContent = manga.description;
    mangaCover.src = manga.cover;
  }

  // 2. CARGAR CAPÍTULOS
  const q = query(
    collection(db, "tomos"),
    where("mangaId", "==", mangaId)
  );

  const querySnapshot = await getDocs(q);
  let chapters = [];

  querySnapshot.forEach((doc) => {
    chapters.push(doc.data());
  });

  // 3. ORDEN INVERSO (EL MÁS NUEVO ARRIBA)
  // Usamos parseFloat para que 1.5 sea mayor que 1.1
  chapters.sort((a, b) => parseFloat(b.number) - parseFloat(a.number));

  // 4. FORZAR DISEÑO DE LISTA (Anulando el CSS de la cuadrícula)
  chaptersGrid.innerHTML = ""; // Limpiamos todo
  chaptersGrid.style.display = "flex";
  chaptersGrid.style.flexDirection = "column";
  chaptersGrid.style.gap = "12px";
  chaptersGrid.style.width = "100%";

  chapters.forEach((tomo) => {
    // Usamos una clase nueva "chapter-list-item" para que no herede lo de "chapter-card"
    chaptersGrid.innerHTML += `
      <a href="reader.html?manga=${mangaId}&tomo=${tomo.number}" 
         style="display: flex; align-items: center; justify-content: space-between; background: #161616; padding: 15px 25px; border-radius: 12px; text-decoration: none; color: white; border: 1px solid #222; transition: 0.3s; width: 100%;">
        
        <div style="display: flex; align-items: center; gap: 20px;">
          <img src="${tomo.cover}" style="width: 50px; height: 70px; object-fit: cover; border-radius: 6px; border: 1px solid #333;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.8rem; color: #ff0055; font-weight: bold; letter-spacing: 1px;">CAPÍTULO</span>
            <span style="font-size: 1.3rem; font-weight: bold;">${tomo.number}</span>
          </div>
        </div>

        <div style="background: #ff0055; color: white; padding: 10px 25px; border-radius: 8px; font-weight: bold; font-size: 0.9rem; letter-spacing: 0.5px;">
          LEER
        </div>
      </a>
    `;
  });
}

loadManga();
