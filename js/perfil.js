import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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

let tempAvatarBase64 = null;

window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
};

async function loadUserFavorites(favIds) {
    const grid = document.getElementById('favsGrid');
    const counter = document.getElementById('favCount');
    if (!favIds || favIds.length === 0) {
        grid.innerHTML = '<p class="empty-msg">Aún no tienes favoritos.</p>';
        if(counter) counter.innerText = '0 Mangas';
        return;
    }
    if(counter) counter.innerText = `${favIds.length} ${favIds.length === 1 ? 'Manga' : 'Mangas'}`;
    grid.innerHTML = '';
    for (const id of favIds) {
        const snap = await getDoc(doc(db, "mangas", id));
        if (snap.exists()) {
            const m = snap.data();
            grid.innerHTML += `<div class="manga-card-perfil"><a href="manga.html?id=${id}"><div class="card-img-container"><img src="${m.cover || m.image}"></div><h4>${m.title}</h4></a></div>`;
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
        card.id = `hist-${m.id}`;
        card.innerHTML = `<div class="card-img-container"><a href="reader.html?manga=${m.id}&number=${m.chapter}&scroll=true&savedScroll=${m.scrollPos || 0}"><img src="${m.image}"><div class="chapter-badge">Cap. ${m.chapter}</div></a><button class="drop-btn" data-id="${m.id}" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.8); color:#ff0055; border:1px solid #ff0055; border-radius:50%; width:26px; height:26px; cursor:pointer; font-weight:bold; z-index:10; display:flex; align-items:center; justify-content:center;">×</button></div><h4>${m.title}</h4>`;
        grid.appendChild(card);
    });
    grid.addEventListener('click', async (e) => {
        if (e.target.classList.contains('drop-btn')) {
            const mid = e.target.dataset.id;
            if (confirm("¿Eliminar del historial?")) {
                const card = document.getElementById(`hist-${mid}`);
                if(card) card.remove();
                await updateDoc(doc(db, "users", userId), { [`readingHistory.${mid}`]: deleteField() });
            }
        }
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const d = snap.data();
            document.getElementById('userNameDisplay').innerText = d.displayName || user.displayName || "Usuario";
            document.getElementById('editName').value = d.displayName || user.displayName || "";
            document.getElementById('editCountry').value = d.country || "";
            document.getElementById('userEmailDisplay').innerText = user.email;
            document.getElementById('profileAvatar').src = d.photoURL || user.photoURL || 'img/default-user.png';
            loadUserFavorites(d.favorites || []);
            loadFullHistory(d.readingHistory || {}, user.uid);
        }
    } else {
        window.location.href = "index.html";
    }
});

const avatarInput = document.getElementById('avatarUpload');
if (avatarInput) {
    avatarInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 250 * 1024) return alert("❌ Imagen muy pesada (Límite 250KB)");
        const reader = new FileReader();
        reader.onload = (event) => {
            tempAvatarBase64 = event.target.result;
            document.getElementById('profileAvatar').src = tempAvatarBase64;
        };
        reader.readAsDataURL(file);
    };
}

const saveBtn = document.getElementById('saveProfileBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const newName = document.getElementById('editName').value.trim();
        const newCountry = document.getElementById('editCountry').value;
        try {
            const updateData = { displayName: newName, country: newCountry };
            if (tempAvatarBase64) updateData.photoURL = tempAvatarBase64;
            await updateDoc(doc(db, "users", user.uid), updateData);
            alert("✅ Perfil actualizado correctamente");
            location.reload();
        } catch (e) { alert("Error al guardar"); }
    };
}

// ARREGLO: Lógica para enviar correo de restablecimiento
const sendResetBtn = document.getElementById('sendResetBtn');
if (sendResetBtn) {
    sendResetBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            alert(`✅ ¡Correo enviado a ${user.email}!\n\nRevisa tu bandeja de entrada para crear o cambiar tu contraseña.`);
        } catch (e) {
            alert("Error al enviar el correo: " + e.message);
        }
    };
}
