import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

// 1. INYECTAR EL HTML (Modularización)
const navbarContainer = document.getElementById('main-navbar');

if (navbarContainer) {
    navbarContainer.innerHTML = `
        <nav class="main-navbar">
            <a href="index.html" class="nav-logo">MANGA 4 ALL</a>
            
            <div class="nav-search-container">
                <input type="text" id="globalSearch" placeholder="Buscar manga o autor...">
            </div>

            <div class="nav-auth-area" id="auth-content">
                <span style="color:#333">...</span>
            </div>
        </nav>
    `;

    // --- INTEGRACIÓN DE TU LÓGICA DE BÚSQUEDA ---
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query.length > 0) {
                    window.location.href = `results.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }
}

// 2. LÓGICA DE ESTADO DE USUARIO (Firebase)
onAuthStateChanged(auth, (user) => {
    const authContent = document.getElementById('auth-content');
    if (!authContent) return;

    if (user) {
        // Usuario Logueado
        authContent.innerHTML = `
            <div class="user-profile-nav">
                <span style="font-size: 0.85rem; font-weight: bold;">${user.displayName || 'Usuario'}</span>
                <img src="${user.photoURL || 'https://via.placeholder.com/150'}" alt="perfil">
                <button class="btn-logout-nav" id="navLogout">Salir</button>
            </div>
        `;
        document.getElementById('navLogout').onclick = () => signOut(auth);
    } else {
        // Usuario No Logueado
        authContent.innerHTML = `
            <a href="#" class="btn-login" id="navLogin">Entrar</a>
            <a href="#" class="btn-register" id="navRegister">Registrarse</a>
        `;
        
        // Atajos para login con Google (por ahora)
        document.getElementById('navLogin').onclick = (e) => { e.preventDefault(); signInWithPopup(auth, provider); };
        document.getElementById('navRegister').onclick = (e) => { e.preventDefault(); signInWithPopup(auth, provider); };
    }
});
