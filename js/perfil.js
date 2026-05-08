import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

// PESTAÑAS
window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
};

// --- FASE 3: CARGAR FAVORITOS DESDE FIRESTORE ---
async function loadUserFavorites(favIds) {
    const grid = document.getElementById('favsGrid');
    const countLabel = document.querySelector('.count');
    
    if (!favIds || favIds.length === 0) {
        grid.innerHTML = '<p class="empty-msg">Aún no tienes favoritos. ¡Explora el directorio!</p>';
        countLabel.innerText = '0 Mangas';
        return;
    }

    countLabel.innerText = `${favIds.length} Mangas`;
    grid.innerHTML = ''; // Limpiamos el "Cargando"

    // Buscamos los datos de cada manga favorito
    for (const id of favIds) {
        try {
            const mangaSnap = await getDoc(doc(db, "mangas", id));
            if (mangaSnap.exists()) {
                const manga = mangaSnap.data();
                grid.innerHTML += `
                    <div class="manga-card-perfil">
                        <a href="manga.html?id=${id}">
                            <div class="card-img-container">
                                <img src="${manga.cover || manga.image}" alt="${manga.title}">
                            </div>
                            <h4>${manga.title}</h4>
                        </a>
                    </div>
                `;
            }
        } catch (err) {
            console.error("Error cargando manga favorito:", id, err);
        }
    }
}

// --- FASE 3: CARGAR HISTORIAL (LOCAL POR AHORA) ---
function loadLocalHistory() {
    const grid = document.getElementById('historyGrid');
    const storage = localStorage.getItem("manga_last_seen");

    if (!storage) {
        grid.innerHTML = '<p class="empty-msg">No hay historial reciente.</p>';
        return;
    }

    const data = JSON.parse(storage);
    grid.innerHTML = `
        <div class="manga-card-perfil history-card">
            <a href="reader.html?manga=${data.id}&number=${data.chapter}&scroll=true">
                <div class="card-img-container">
                    <img src="${data.image}" alt="${data.title}">
                    <div class="chapter-badge">Cap. ${data.chapter}</div>
                </div>
                <h4>${data.title}</h4>
                <p style="font-size:0.7rem; color:#555;">Continuar leyendo...</p>
            </a>
        </div>
    `;
}

// ESTADO DEL USUARIO
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            document.getElementById('userNameDisplay').innerText = data.displayName || user.displayName || "Usuario";
            document.getElementById('userEmailDisplay').innerText = user.email;
            document.getElementById('editName').value = data.displayName || user.displayName || "";
            
            const finalImg = data.photoURL || user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            document.getElementById('profileAvatar').src = finalImg;

            // CARGAMOS SUS FAVORITOS
            loadUserFavorites(data.favorites);
            // CARGAMOS SU HISTORIAL
            loadLocalHistory();
        }
    } else {
        window.location.href = "index.html";
    }
});

// SUBIDA DE IMAGEN (VISTA PREVIA)
const avatarInput = document.getElementById('avatarUpload');
if (avatarInput) {
    avatarInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 200 * 1024) {
            alert(`❌ Imagen muy pesada. El límite es de 200KB.`);
            avatarInput.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('profileAvatar').src = event.target.result;
        };
        reader.readAsDataURL(file);
    };
}

// GUARDAR PERFIL
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
        } catch (error) {
            alert("❌ Error al guardar los cambios.");
        }
    };
}
