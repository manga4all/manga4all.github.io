import {
  db
} from "./firebase.js";

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
  // --- CARGAR DATOS DEL MANGA ---
  const mangaRef = doc(db, "mangas", mangaId);
  const mangaSnap = await getDoc(mangaRef);

  if (mangaSnap.exists()) {
    const manga = mangaSnap.data();
    mangaTitle.textContent = manga.title;
    mangaDescription.textContent = manga.description;
    mangaCover.src = manga.cover;
  }

  // --- CARGAR Y ORDENAR CAPÍTULOS ---
  const q = query(
    collection(db, "tomos"),
    where("mangaId", "==", mangaId)
    // Quitamos el orderBy de la consulta para manejarlo manualmente en el array
  );

  const querySnapshot = await getDocs(q);
  let chapters = [];

  querySnapshot.forEach((doc) => {
    chapters.push(doc.data());
  });

  // ORDEN INVERSO: Del más alto (nuevo) al más bajo (viejo)
  chapters.sort((a, b) => parseFloat(b.number) - parseFloat(a.number));

  // --- RENDERIZADO EN FORMATO LISTA ---
  // Forzamos al contenedor a ser una lista vertical sin tocar el CSS externo
  chaptersGrid.style.display = "flex";
  chaptersGrid.style.flexDirection = "column";
  chaptersGrid.style.gap = "10px";
  chaptersGrid.innerHTML = ""; 

  chapters.forEach((tomo) => {
    chaptersGrid.innerHTML += `
      <a 
        href="reader.html?manga=${mangaId}&tomo=${tomo.number}"
        style="display: flex; align-items: center; justify-content: space-between; background: #1a1a1a; padding: 10px 20px; border-radius: 8px; text-decoration: none; color: white; border: 1px solid #333; transition: 0.3s;"
        onmouseover="this.style.borderColor='#ff0055'" 
        onmouseout="this.style.borderColor='#333'"
      >
        <div style="display: flex; align-items: center; gap: 15px;">
          <img 
            src="${tomo.cover}" 
            alt="Tomo ${tomo.number}" 
            style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px;"
          >
          <span style="font-weight: bold; font-size: 1.1rem;">Capítulo ${tomo.number}</span>
        </div>
        
        <div style="background: #ff0055; color: white; padding: 5px 15px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
          LEER
        </div>
      </a>
    `;
  });
}

loadManga();
