import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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

// 1. INYECTAR EL HTML (Con el link corregido a directory.html)
const navbarContainer = document.getElementById('main-navbar');

if (navbarContainer) {
    navbarContainer.innerHTML = `
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

            <div class="nav-auth-area" id="auth-content">
                </div>
        </nav>
    `;

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

// 2. FUNCIÓN PARA CREAR USUARIO EN FIRESTORE SI NO EXISTE
async function syncUser(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Es la primera vez que entra, lo registramos
        await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: "user", // Por defecto es usuario normal
            createdAt: serverTimestamp(),
            favorites: [], // Lista de IDs de mangas favoritos vacía
            readingHistory: {} // Para la fase de "Continuar leyendo"
        });
        console.log("Nuevo usuario registrado en Firestore");
    }
}

// 3. LÓGICA DE ESTADO DE USUARIO
onAuthStateChanged(auth, async (user) => {
    const authContent = document.getElementById('auth-content');
    if (!authContent) return;

    if (user) {
        // Sincronizar datos con Firestore
        await syncUser(user);

        // Mostrar Interfaz Logueada
        authContent.innerHTML = `
            <div class="user-nav-wrapper">
                <div class="user-profile-nav">
                    <img src="${user.photoURL || 'https://via.placeholder.com/150'}" alt="perfil">
                    <span>${user.displayName ? user.displayName.split(' ')[0] : 'Usuario'}</span>
                </div>
                <button class="btn-logout-minimal" id="navLogout" title="Cerrar Sesión">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
            </div>
        `;
        document.getElementById('navLogout').onclick = () => signOut(auth);
    } else {
        // Mostrar Botones de Login
        authContent.innerHTML = `
            <button class="btn-login" id="navLogin">Iniciar sesión</button>
            <button class="btn-register" id="navRegister">Regístrate</button>
        `;
        
        const loginAction = (e) => {
            e.preventDefault();
            signInWithPopup(auth, provider).catch(error => console.error("Error al loguear:", error));
        };

        document.getElementById('navLogin').onclick = loginAction;
        document.getElementById('navRegister').onclick = loginAction;
    }
});
