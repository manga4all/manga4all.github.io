import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCWh1P5pyM7nqscPdenQDEHHbSNTduVufo",
    authDomain: "manga4all-f520f.firebaseapp.com",
    projectId: "manga4all-f520f",
    storageBucket: "manga4all-f520f.firebasestorage.app",
    messagingSenderId: "372561836700",
    appId: "1:372561836700:web:cbb295bda656abd2ea0b59"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Inyectar HTML
const navContainer = document.getElementById('main-navbar');
if (navContainer) {
    navContainer.innerHTML = `
        <nav class="main-navbar">
            <div class="nav-left">
                <a href="index.html" class="nav-logo">MANGA 4 ALL</a>
                <div class="nav-main-links">
                    <a href="index.html">Inicio</a>
                    <a href="directory.html">Directorio</a>
                </div>
            </div>
            <div class="nav-search-container">
                <input type="text" id="globalSearch" placeholder="Buscar manga o autor...">
            </div>
            <div class="nav-auth-area" id="auth-content"></div>
        </nav>

        <div class="auth-modal-overlay" id="authModal">
            <div class="auth-modal">
                <span class="close-modal" id="closeM">&times;</span>
                <h2 style="color:white; margin-bottom:20px;">Bienvenido</h2>
                <div class="auth-input-group">
                    <input type="email" id="logEmail" placeholder="Correo electrónico">
                </div>
                <div class="auth-input-group">
                    <input type="password" id="logPass" placeholder="Contraseña">
                </div>
                <button class="btn-login" id="doEmailLogin" style="width:100%; margin-bottom:15px;">Entrar</button>
                <div style="color:#555; margin-bottom:15px; font-size:0.8rem;">O CONTINUAR CON</div>
                <button id="doGoogleLogin" style="width:100%; padding:10px; border-radius:10px; cursor:pointer; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:10px;">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18"> Google
                </button>
                <p id="errLog" style="color:red; font-size:0.8rem; margin-top:10px;"></p>
            </div>
        </div>
    `;
}

// Funciones de apertura/cierre
window.openAuth = () => document.getElementById('authModal').style.display = 'flex';
document.getElementById('closeM').onclick = () => document.getElementById('authModal').style.display = 'none';

// Logueo Google
document.getElementById('doGoogleLogin').onclick = () => {
    signInWithPopup(auth, provider).catch(() => document.getElementById('errLog').innerText = "Error con Google");
};

// Logueo Email
document.getElementById('doEmailLogin').onclick = () => {
    const e = document.getElementById('logEmail').value;
    const p = document.getElementById('logPass').value;
    signInWithEmailAndPassword(auth, e, p).catch(() => document.getElementById('errLog').innerText = "Datos incorrectos");
};

// Escucha de Búsqueda
document.getElementById('globalSearch').onkeypress = (e) => {
    if(e.key === 'Enter') {
        const q = e.target.value.trim();
        if(q) window.location.href = `results.html?q=${encodeURIComponent(q)}`;
    }
};

// Estado del Usuario
onAuthStateChanged(auth, async (user) => {
    const area = document.getElementById('auth-content');
    if (!area) return;
    if (user) {
        document.getElementById('authModal').style.display = 'none';
        area.innerHTML = `
            <div class="user-capsule">
                <img src="${user.photoURL || 'https://via.placeholder.com/150'}" alt="">
                <span style="font-size:0.85rem; font-weight:bold;">${user.displayName || 'Usuario'}</span>
                <button id="logout" style="background:none; border:none; color:#555; cursor:pointer; font-size:0.7rem; margin-left:5px;">Salir</button>
            </div>
        `;
        document.getElementById('logout').onclick = () => signOut(auth);
    } else {
        area.innerHTML = `<button class="btn-login" onclick="openAuth()">Iniciar sesión</button>`;
    }
});
