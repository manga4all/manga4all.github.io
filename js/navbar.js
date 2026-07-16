import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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

// 🛠️ DETECCIÓN ESTRUCTURAL DE CARPETA SUBDIRECTORIO
const isInMangaFolder = window.location.pathname.includes('/manga/');
const prefix = isInMangaFolder ? '../' : '';

// Inyectar HTML con prefijos corregidos dinámicamente
const navContainer = document.getElementById('main-navbar');
if (navContainer) {
    navContainer.innerHTML = `
        <nav class="main-navbar">
            <div class="nav-left">
                <a href="${prefix}index.html" class="nav-logo">MANGA 4 ALL</a>
                <div class="nav-main-links">
                    <a href="${prefix}index.html">Inicio</a>
                    <a href="${prefix}directory.html">Directorio</a>
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
                <h2 id="modalTitle" style="color:white; margin-bottom:20px;">Bienvenido</h2>
                
                <div id="regNameField" class="auth-input-group" style="display:none;">
                    <input type="text" id="logName" placeholder="Tu nombre completo">
                </div>
                <div class="auth-input-group">
                    <input type="email" id="logEmail" placeholder="Correo electrónico">
                </div>
                <div class="auth-input-group">
                    <input type="password" id="logPass" placeholder="Contraseña">
                </div>
                
                <button class="btn-login" id="mainAuthBtn" style="width:100%; margin-bottom:15px;">Entrar</button>
                
                <p id="toggleAuthText" style="color:#888; font-size:0.85rem; cursor:pointer; margin-bottom:15px;">
                    ¿No tienes cuenta? <span style="color:#ff0055; font-weight:bold;">Regístrate aquí</span>
                </p>

                <div class="auth-divider"><span>O CONTINUAR CON</span></div>
                
                <button id="doGoogleLogin" class="btn-google-login" style="width:100%; padding:10px; border-radius:10px; cursor:pointer; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:10px; border:none; background:white; color:black;">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18"> Google
                </button>
                <p id="errLog" style="color:red; font-size:0.8rem; margin-top:10px;"></p>
            </div>
        </div>
    `;
}

// Lógica de intercambio entre Login y Registro
let isRegisterMode = false;
const toggleText = document.getElementById('toggleAuthText');
const modalTitle = document.getElementById('modalTitle');
const nameField = document.getElementById('regNameField');
const mainBtn = document.getElementById('mainAuthBtn');

if(toggleText) {
    toggleText.onclick = () => {
        isRegisterMode = !isRegisterMode;
        if (isRegisterMode) {
            modalTitle.innerText = "Crear Cuenta";
            nameField.style.display = "block";
            mainBtn.innerText = "Registrarse";
            toggleText.innerHTML = '¿Ya tienes cuenta? <span style="color:#ff0055; font-weight:bold;">Inicia sesión</span>';
        } else {
            modalTitle.innerText = "Bienvenido";
            nameField.style.display = "none";
            mainBtn.innerText = "Entrar";
            toggleText.innerHTML = '¿No tienes cuenta? <span style="color:#ff0055; font-weight:bold;">Regístrate aquí</span>';
        }
    };
}

window.openAuth = () => document.getElementById('authModal').style.display = 'flex';
const closeBtn = document.getElementById('closeM');
if(closeBtn) closeBtn.onclick = () => document.getElementById('authModal').style.display = 'none';

if (mainBtn) {
    mainBtn.onclick = async () => {
        const email = document.getElementById('logEmail').value.trim();
        const pass = document.getElementById('logPass').value;
        const name = document.getElementById('logName').value.trim();
        const errorEl = document.getElementById('errLog');
        errorEl.innerText = "";

        try {
            if (isRegisterMode) {
                if(!name) throw new Error("Por favor ingresa tu nombre");
                const userCred = await createUserWithEmailAndPassword(auth, email, pass);
                await updateProfile(userCred.user, { displayName: name });
            } else {
                await signInWithEmailAndPassword(auth, email, pass);
            }
        } catch (error) {
            errorEl.innerText = "Error: " + error.message;
        }
    };
}

const googleBtn = document.getElementById('doGoogleLogin');
if (googleBtn) {
    googleBtn.onclick = () => {
        signInWithPopup(auth, provider).catch(() => document.getElementById('errLog').innerText = "Error con Google");
    };
}

function setupLogout() {
    const btn = document.getElementById('logout');
    if(btn) btn.onclick = (e) => {
        e.stopPropagation();
        signOut(auth);
    };
}

async function syncUser(user) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName || "Usuario",
            email: user.email,
            photoURL: user.photoURL || "",
            role: "user",
            createdAt: serverTimestamp(),
            favorites: [],
            readingHistory: {}
        });
    }
}

// ESTADO DEL USUARIO TOTALMENTE SANITIZADO PARA SUBDIRECTORIOS
onAuthStateChanged(auth, async (user) => {
    const area = document.getElementById('auth-content');
    if (!area) return;
    
    if (user) {
        await syncUser(user);
        const modal = document.getElementById('authModal');
        if(modal) modal.style.display = 'none';
        
        // Imagen por defecto absoluta de internet para evitar fallos de carpetas locales
        const absoluteFallback = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        let userImg = absoluteFallback;
        
        try {
            const userSnap = await getDoc(doc(db, "users", user.uid));
            let targetPhoto = null;
            
            if (userSnap.exists()) {
                const userData = userSnap.data();
                targetPhoto = userData.photoURL || user.photoURL;
            } else {
                targetPhoto = user.photoURL;
            }
            
            if (targetPhoto) {
                // Si la imagen es externa (Google/FB) se usa tal cual, si es local se le pone el prefijo limpio
                userImg = targetPhoto.startsWith('http') ? targetPhoto : `${prefix}${targetPhoto.replace(/^\.\.\//, '')}`;
            }
        } catch (e) {
            console.error("Error resolviendo avatar:", e);
            if (user.photoURL) {
                userImg = user.photoURL.startsWith('http') ? user.photoURL : `${prefix}${user.photoURL.replace(/^\.\.\//, '')}`;
            }
        }
        
        area.innerHTML = `
            <div class="user-capsule" id="goToProfile" style="cursor:pointer; display:flex; align-items:center; gap:10px;">
                <img src="${userImg}" alt="Perfil" onerror="this.onerror=null; this.src='${absoluteFallback}';">
                <span style="font-size:0.85rem; font-weight:bold; color:white;">${user.displayName ? user.displayName.split(' ')[0] : 'Usuario'}</span>
                <button id="logout" style="background:none; border:none; color:#555; cursor:pointer; font-size:0.7rem; margin-left:10px; text-decoration:underline;">Salir</button>
            </div>
        `;
        
        document.getElementById('goToProfile').onclick = () => window.location.href = `${prefix}perfil.html`;
        setupLogout();
    } else {
        area.innerHTML = `<button class="btn-login" onclick="openAuth()">Iniciar sesión</button>`;
    }
});

// Búsqueda
const searchBtn = document.getElementById('globalSearch');
if(searchBtn) {
    searchBtn.onkeypress = (e) => {
        if(e.key === 'Enter') {
            const q = e.target.value.trim();
            if(q) window.location.href = `${prefix}results.html?q=${encodeURIComponent(q)}`;
        }
    };
}
