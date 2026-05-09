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

// SOLUCIÓN PESTAÑAS: Al guardar o borrar, recordamos dónde estábamos
window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById(`btn-${tabId}`).classList.add('active');
    
    // Guardamos la pestaña actual en la sesión
    sessionStorage.setItem('perfilActiveTab', tabId);
};

// --- FASE 3: CARGAR FAVORITOS ---
async function loadUserFavorites(favIds) {
    const grid = document.getElementById('favsGrid');
    const counter = document.getElementById('favCount');
    
    if (!favIds || favIds.length === 0) {
        grid.innerHTML = '<p class="empty-msg">Aún no tienes favoritos. ¡Explora el directorio!</p>';
        counter.innerText = '0 Mangas';
        return;
    }

    // Actualizamos el contador real
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

// --- FASE 3: CARGAR HISTORIAL CON BORRADO ---
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
                <button class="drop-btn" data-id="${m.id}" title="Borrar historial" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.85); color:#ff0055; border:1px solid #ff0055; border-radius:50%; width:28px; height:28px; cursor:pointer; font-weight:bold; font-size:16px; z-index:10; display:flex; align-items:center; justify-content:center;">×</button>
            </div>
            <h4>${m.title}</h4>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.drop-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();
            const mid = e.target.dataset.id;
            if (confirm("¿Borrar este manga de tu historial?")) {
                // Antes de recargar, nos aseguramos de que la pestaña activa sea 'history'
                sessionStorage.setItem('perfilActiveTab', 'history');
                await updateDoc(doc(db, "users", userId), { [`readingHistory.${mid}`]: deleteField() });
                location.reload();
            }
        };
    });
}

// ESTADO DEL USUARIO
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const d = snap.data();
            
            // CORRECCIÓN: Aseguramos que el nombre se asigne al sidebar y al input
            const nombreFinal = d.displayName || user.displayName || "Usuario";
            document.getElementById('userNameDisplay').innerText = nombreFinal;
            document.getElementById('editName').value = nombreFinal;
            
            document.getElementById('userEmailDisplay').innerText = user.email;
            document.getElementById('profileAvatar').src = d.photoURL || user.photoURL || 'img/default-user.png';
            
            loadUserFavorites(d.favorites || []);
            loadFullHistory(d.readingHistory || {}, user.uid);

            // Al terminar de cargar, verificamos si hay una pestaña guardada
            const savedTab = sessionStorage.getItem('perfilActiveTab');
            if (savedTab) {
                switchTab(savedTab);
                // La limpiamos para que si entra de cero otra vez vaya a "Mis Datos"
                sessionStorage.removeItem('perfilActiveTab');
            }
        }
    } else {
        window.location.href = "index.html";
    }
});

// BOTÓN GUARDAR
const saveBtn = document.getElementById('saveProfileBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const newName = document.getElementById('editName').value.trim();
        if (!newName) return alert("El nombre no puede estar vacío");
        try {
            await updateDoc(doc(db, "users", user.uid), { displayName: newName });
            alert("✅ Perfil actualizado correctamente");
            location.reload();
        } catch (error) { alert("❌ Error al guardar."); }
    };
}
