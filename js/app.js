// scripts
import {
  db,
  collection,
  getDocs
} from "./firebase.js";

const mangaGrid = document.querySelector(".manga-grid");

async function loadMangas(){

  const querySnapshot = await getDocs(
    collection(db, "mangas")
  );

  querySnapshot.forEach((doc) => {

    const manga = doc.data();

    mangaGrid.innerHTML += `

      <div class="manga-card">

        <img src="${manga.cover}" alt="${manga.title}">

        <div class="manga-info">

          <h3>${manga.title}</h3>

          <p>${manga.description}</p>

          <a class="btn" href="#">
            Leer
          </a>

        </div>

      </div>

    `;
  });
}

loadMangas();
