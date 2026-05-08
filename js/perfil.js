import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Tu Firebase Config aquí (el mismo que en navbar.js)
const firebaseConfig = { /* ... tu config ... */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 1. CAMBIO DE PESTAÑAS
window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// 2. CONTROL DE SUBIDA DE IMAGEN (Límite KB)
const avatarInput = document.getElementById('avatarUpload');
avatarInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Límite de 200 KB (para no saturar)
    const limitKB = 200;
    if (file.size > limitKB * 1024) {
        alert(`❌ La imagen es muy pesada. Máximo ${limitKB}KB.`);
        avatarInput.value = "";
        return;
    }

    // Aquí iría la lógica para subir a Firebase Storage
    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById('profileAvatar').src = event.target.result;
    };
    reader.readAsDataURL(file);
    console.log("Imagen lista para subir...");
};

// 3. CARGAR DATOS DEL USUARIO
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('userNameDisplay').innerText = user.displayName || "Usuario";
        document.getElementById('userEmailDisplay').innerText = user.email;
        document.getElementById('editName').value = user.displayName || "";
        if (user.photoURL) document.getElementById('profileAvatar').src = user.photoURL;
        
        // Aquí cargaremos los favoritos de Firestore en la Fase 2
    } else {
        window.location.href = "index.html"; // Si no está logueado, fuera
    }
});
