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

// SOLUCIÓN AL ERROR DE "DUPLICATE APP"
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// SOLUCIÓN AL ERROR DE "switchTab is not defined"
// Al exportarla a 'window', el HTML ya puede verla
window.switchTab = (tabId) => {
    console.log("Cambiando a pestaña:", tabId);
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');
    
    // El botón que llamó a la función
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
};

// LÓGICA DE CARGA DE DATOS
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            document.getElementById('userNameDisplay').innerText = data.displayName || user.displayName || "Usuario";
            document.getElementById('userEmailDisplay').innerText = user.email;
            document.getElementById('editName').value = data.displayName || user.displayName || "";
            
            // Imagen: Prioridad a Firestore, luego Google, luego la de respaldo
            const finalImg = data.photoURL || user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            document.getElementById('profileAvatar').src = finalImg;
        }
    } else {
        // Si no hay sesión, regresamos al index
        window.location.href = "index.html";
    }
});

// LÓGICA DE SUBIDA DE IMAGEN (CON LÍMITE DE KB)
const avatarInput = document.getElementById('avatarUpload');
if (avatarInput) {
    avatarInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const limitKB = 200;
        if (file.size > limitKB * 1024) {
            alert(`❌ Imagen muy pesada. El límite es de ${limitKB}KB.`);
            avatarInput.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            // Actualizamos la vista previa
            document.getElementById('profileAvatar').src = event.target.result;
            console.log("Vista previa actualizada. Listo para la fase de guardado.");
        };
        reader.readAsDataURL(file);
    };
}

// BOTÓN GUARDAR PERFIL
const saveBtn = document.getElementById('saveProfileBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const newName = document.getElementById('editName').value.trim();
        if (!newName) return alert("El nombre no puede estar vacío");

        try {
            await updateDoc(doc(db, "users", user.uid), {
                displayName: newName
            });
            alert("✅ Perfil actualizado correctamente");
            location.reload(); // Recargamos para ver los cambios
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("❌ Error al guardar los cambios.");
        }
    };
}
