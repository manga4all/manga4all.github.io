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

// 1. INYECTAR ESTRUCTURA (NAVBAR + MODAL)
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
            <div class="nav-auth-area" id="auth-content"></div>
        </nav>

        <div class="auth-modal-overlay" id="authModal">
            <div class="auth-modal">
                <span class="close-auth-modal" id="closeModal">&times;</span>
                <h2>Ingresar a Manga4All</h2>
                
                <div class="auth-input-group">
                    <label>Correo Electrónico</label>
                    <input type="email" id="emailLogin" placeholder="tu@email.com">
                </div>
                <div class="auth-input-group">
                    <label>Contraseña</label>
                    <input type="password" id="passLogin" placeholder="••••••••">
                </div>
                
                <button class="btn-auth-primary" id="btnEmailLogin">Entrar</button>

                <div class="auth-divider"><span>O CONTINUAR CON</span></div>

                <button class="btn-google-login" id="btnGoogleLogin">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18">
                    Google
                </button>
                <p id="authError" style="color: #ff3333; font-size: 0.8rem; margin-top: 15px;"></p>
            </div>
        </div>
    `;

    // Lógica del buscador
    document.getElementById('globalSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) window.location.href = `results.html?q=${encodeURIComponent(query)}`;
        }
    });

    // Lógica del Modal
    const modal = document.getElementById('authModal');
    window.showLogin = () => modal.style.display = 'flex';
    document.getElementById('closeModal').onclick = () => modal.style.display = 'none';
}

// 2. SINCRONIZAR USUARIO
async function syncUser(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid, displayName: user.displayName || "Usuario",
            email: user.email, photoURL: user.photoURL || "",
            role: "user", createdAt: serverTimestamp(), favorites: [], readingHistory: {}
        });
    }
}

// 3. ESTADO DE SESIÓN
onAuthStateChanged(auth, async (user) => {
    const authContent = document.getElementById('auth-content');
    if (!authContent) return;

    if (user) {
        await syncUser(user);
        document.getElementById('authModal').style.display = 'none';
        authContent.innerHTML = `
            <div class="user-nav-wrapper">
                <div class="user-profile-nav">
                    <img src="${user.photoURL || 'https://via.placeholder.com/150'}" alt="p">
                    <span>${user.displayName ? user.displayName.split(' ')[0] : 'Usuario'}</span>
                </div>
                <button class="btn-logout-minimal" id="navLogout">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                </button>
            </div>
        `;
        document.getElementById('navLogout').onclick = () => signOut(auth);
    } else {
        authContent.innerHTML = `
            <button class="btn-login" onclick="showLogin()">Iniciar sesión</button>
            <button class="btn-register" onclick="showLogin()">Regístrate</button>
        `;
    }
});

// 4. LISTENERS DE BOTONES DE LOGIN
document.getElementById('btnGoogleLogin').onclick = () => {
    signInWithPopup(auth, provider).catch(err => document.getElementById('authError').innerText = "Error con Google");
};

document.getElementById('btnEmailLogin').onclick = () => {
    const email = document.getElementById('emailLogin').value;
    const pass = document.getElementById('passLogin').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => {
        document.getElementById('authError').innerText = "Correo o contraseña incorrectos";
    });
};
