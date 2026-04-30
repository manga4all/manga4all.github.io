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

async function loadManga(){

  // MANGA

  const mangaRef = doc(db, "mangas", mangaId);

  const mangaSnap = await getDoc(mangaRef);

  if(mangaSnap.exists()){

    const manga = mangaSnap.data();

    mangaTitle.textContent = manga.title;

    mangaDescription.textContent = manga.description;

    mangaCover.src = manga.cover;

  }

  // TOMOS

  const q = query(
    collection(db, "tomos"),
    where("mangaId", "==", mangaId),
    orderBy("number")
  );

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {

    const tomo = doc.data();

    chaptersGrid.innerHTML += `

      <a
        class="chapter-card"
        href="reader.html?manga=${mangaId}&tomo=${tomo.number}"
      >

        <img
          src="${tomo.cover}"
          alt="Tomo ${tomo.number}"
        >

        <div class="chapter-info">

          <h3>
            Tomo ${tomo.number}
          </h3>

        </div>

      </a>

    `;
  });
}

loadManga();
