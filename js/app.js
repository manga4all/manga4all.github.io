import {
  db,
  collection,
  getDocs
} from "./firebase.js";

const mangaGrid = document.querySelector(".manga-grid");

async function loadMangas(){

  mangaGrid.innerHTML = "";

  const querySnapshot = await getDocs(
    collection(db, "mangas")
  );

  querySnapshot.forEach((doc) => {

    const manga = doc.data();

    mangaGrid.innerHTML += `

      <div class="manga-card">

        <div class="cover-container">

          <img
            class="cover"
            src="${manga.cover}"
            alt="${manga.title}"
          >

        </div>

        <div class="manga-info">

          <h3>${manga.title}</h3>

          <p>${manga.description}</p>

          <a
            class="btn"
            href="manga.html?id=${doc.id}"
          >
            Leer
          </a>

        </div>

      </div>

    `;
  });
}

loadMangas();
