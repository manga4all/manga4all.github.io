import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCWh1P5pyM7nqscPdenQDEHHbSNTduVufo",
    authDomain: "manga4all-f520f.firebaseapp.com",
    projectId: "manga4all-f520f",
    storageBucket: "manga4all-f520f.firebasestorage.app",
    messagingSenderId: "372561836700",
    appId: "1:372561836700:web:cbb295bda656abd2ea0b59"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// NAVEGACIÓN SIMPLE (Sin memoria para que siempre inicie en Datos al volver de otra página)
window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    
    const targetTab = document.getElementById(`tab-${tabId}`);
    const targetBtn = document.getElementById(`btn-${tabId}`);
    if(targetTab) targetTab.classList.add('active');
    if(targetBtn) targetBtn.classList.add('active');
};

// --- CARGAR FAVORITOS ---
async function loadUserFavorites(favIds) {
    const grid = document.getElementById('favsGrid');
    const counter = document.getElementById('favCount');
    
    if (!favIds || favIds.length === 0) {
        grid.innerHTML = '<p class="empty-msg">Aún no tienes favoritos.</p>';
        counter.innerText = '0 Mangas';
        return;
    }

    counter.innerText = `${favIds.length} ${favIds.length === 1 ? 'Manga' : 'Mangas'}`;
    grid.innerHTML = '';

    for (const id of favIds) {
        try {
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
        } catch (e) { console.error(e); }
    }
}

// --- CARGAR HISTORIAL CON BORRADO DINÁMICO (INSTANTÁNEO) ---
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
        card.id = `hist-${m.id}`; // ID para borrarlo sin recargar
        card.innerHTML = `
            <div class="card-img-container">
                <a href="reader.html?manga=${m.id}&number=${m.chapter}&scroll=true">
                    <img src="${m.image}">
                    <div class="chapter-badge">Cap. ${m.chapter}</div>
                </a>
                <button class="drop-btn" data-id="${m.id}" title="Borrar" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.8); color:#ff0055; border:1px solid #ff0055; border-radius:50%; width:26px; height:26px; cursor:pointer; font-weight:bold; z-index:10; display:flex; align-items:center; justify-content:center;">×</button>
            </div>
            <h4>${m.title}</h4>
        `;
        grid.appendChild(card);
    });

    // Lógica de borrado PRO (Sin recarga)
    grid.addEventListener('click', async (e) => {
        if (e.target.classList.contains('drop-btn')) {
            const mid = e.target.dataset.id;
            if (confirm("¿Eliminar del historial?")) {
                try {
                    // 1. Borramos en Firebase
                    await updateDoc(doc(db, "users", userId), {
                        [`readingHistory.${mid}`]: deleteField()
                    });
                    // 2. Borramos la tarjeta visualmente al instante
                    const cardToRemove = document.getElementById(`hist-${mid}`);
                    if (cardToRemove) cardToRemove.remove();
                    
                    // 3. Si ya no quedan tarjetas, mostramos mensaje de vacío
                    if (grid.children.length === 0) {
                        grid.innerHTML = '<p class="empty-msg">No hay historial reciente.</p>';
                    }
                } catch (err) { alert("Error al borrar"); }
            }
        }
    });
}

// ESTADO DEL USUARIO
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const d = snap.data();
            
            // Fix Nombre: Sidebar + Input
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

// GUARDAR CAMBIOS (Aquí sí recargamos para actualizar Navbar y Sidebar)
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
