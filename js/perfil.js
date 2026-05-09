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
    const favCountElement = document.getElementById('favCount'); // Seleccionamos el contador

    if (!favIds || favIds.length === 0) {
        grid.innerHTML = '<p class="empty-msg">Aún no tienes favoritos.</p>';
        if (favCountElement) favCountElement.innerText = "0 Mangas"; // Reset si no hay nada
        return;
    }

    // ACTUALIZACIÓN DEL CONTADOR
    if (favCountElement) {
        favCountElement.innerText = `${favIds.length} ${favIds.length === 1 ? 'Manga' : 'Mangas'}`;
    }

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

// --- FASE 3: CARGAR HISTORIAL (CON BORRADO INSTANTÁNEO Y SCROLL PASADO) ---
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
        card.id = `hist-${m.id}`;
        card.style.position = 'relative';
        
        const pos = m.scrollPos || 0;
        
        card.innerHTML = `
            <div class="card-img-container">
                <a href="reader.html?manga=${m.id}&number=${m.chapter}&scroll=true&savedScroll=${pos}">
                    <img src="${m.image}">
                    <div class="chapter-badge">Cap. ${m.chapter}</div>
                </a>
                <button class="drop-btn" data-id="${m.id}" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.8); color:#ff0055; border:1px solid #ff0055; border-radius:50%; width:26px; height:26px; cursor:pointer; font-weight:bold; z-index:10; display:flex; align-items:center; justify-content:center;">×</button>
            </div>
            <h4>${m.title}</h4>
        `;
        grid.appendChild(card);
    });

    // Lógica Borrado Instantáneo
    grid.addEventListener('click', async (e) => {
        if (e.target.classList.contains('drop-btn')) {
            const mid = e.target.dataset.id;
            if (confirm("¿Eliminar del historial?")) {
                try {
                    const card = document.getElementById(`hist-${mid}`);
                    if(card) card.remove();
                    if (grid.children.length === 0) grid.innerHTML = '<p class="empty-msg">Historial vacío.</p>';
                    await updateDoc(doc(db, "users", userId), { [`readingHistory.${mid}`]: deleteField() });
                } catch (err) { alert("Error al borrar"); }
            }
        }
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const d = snap.data();
            const name = d.displayName || user.displayName || "Usuario";
            document.getElementById('userNameDisplay').innerText = name;
            document.getElementById('editName').value = name;
            document.getElementById('userEmailDisplay').innerText = user.email;
            document.getElementById('profileAvatar').src = d.photoURL || user.photoURL || 'img/default-user.png';
            loadUserFavorites(d.favorites || []);
            loadFullHistory(d.readingHistory || {}, user.uid);
        }
    } else {
        window.location.href = "index.html";
    }
});

const saveBtn = document.getElementById('saveProfileBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const newName = document.getElementById('editName').value.trim();
        if (!newName) return alert("Ingresa un nombre");
        try {
            await updateDoc(doc(db, "users", user.uid), { displayName: newName });
            alert("✅ Perfil actualizado");
            location.reload();
        } catch (e) { alert("Error"); }
    };
}
