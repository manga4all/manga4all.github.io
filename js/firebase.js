import { initializeApp }
from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
}
from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyCWh1P5pyM7nqscPdenQDEHHbSNTduVufo",
  authDomain: "manga4all-f520f.firebaseapp.com",
  projectId: "manga4all-f520f",
  storageBucket: "manga4all-f520f.firebasestorage.app",
  messagingSenderId: "372561836700",
  appId: "1:372561836700:web:cbb295bda656abd2ea0b59"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export {
  db,
  collection,
  getDocs
};

  
