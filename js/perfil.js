import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCWh1P5pyM7nqscPdenQDEHHbSNTduVufo",
    authDomain: "manga4all-f520f.firebaseapp.com",
    projectId: "manga4all-f520f",
    storageBucket: "manga4all-f520f.firebasestorage.app",
    appId: "1:372561836700:web:cbb295bda656abd2ea0b59"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
};

async function loadUserFavorites(favIds) {
    const grid = document.getElementById('favsGrid');
    if (!favIds || favIds.length === 0) return;
    grid.innerHTML = '';
    for (const id of favIds) {
        const snap = await getDoc(doc(db, "mangas", id));
        if (snap.exists()) {
            const m = snap.data();
            grid.innerHTML += `
                <div class="manga-card-perfil">
                    <a href="manga.html?id=${id}">
                        <div class="card-img-container"><img src="${m.cover || m.image}"></div>
                        <h4>${m.title}</h4>
                    </a>
                </div>`;
        }
    }
}

async function loadFullHistory(historyMap, userId) {
    const grid = document.getElementById('historyGrid');
    if (!historyMap || Object.keys(historyMap).length === 0) {
        grid.innerHTML = '<p class="empty-msg">No has empezado ningún manga aún.</p>';
        return;
    }

    const sorted = Object.values(historyMap).sort((a,b) => b.time - a.time);
    grid.innerHTML = '';

    sorted.forEach(m => {
        const card = document.createElement('div');
        card.className = 'manga-card-perfil';
        card.style.position = 'relative';
        card.innerHTML = `
            <div class="card-img-container">
                <a href="reader.html?manga=${m.id}&number=${m.chapter}&scroll=true">
                    <img src="${m.image}">
                    <div class="chapter-badge">Cap. ${m.chapter}</div>
                </a>
                <button class="drop-btn" data-id="${m.id}" style="position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.8); color:#ff0055; border:1px solid #ff0055; border-radius:50%; width:25px; height:25px; cursor:pointer; font-weight:bold;">×</button>
            </div>
            <h4>${m.title}</h4>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.drop-btn').forEach(btn => {
        btn.onclick = async (e) => {
            const mid = e.target.dataset.id;
            if (confirm("¿Borrar este manga de tu historial?")) {
                await updateDoc(doc(db, "users", userId), { [`readingHistory.${mid}`]: deleteField() });
                location.reload();
            }
        };
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const d = snap.data();
            document.getElementById('userNameDisplay').innerText = d.displayName || user.displayName;
            document.getElementById('userEmailDisplay').innerText = user.email;
            document.getElementById('profileAvatar').src = d.photoURL || user.photoURL || 'img/default-user.png';
            loadUserFavorites(d.favorites);
            loadFullHistory(d.readingHistory, user.uid);
        }
    } else {
        window.location.href = "index.html";
    }
});
