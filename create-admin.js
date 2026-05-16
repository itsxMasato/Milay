import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4FfqwgQGzMhYEEAfl_LwpX0lRcNn2e_A",
  authDomain: "milay-beauty.firebaseapp.com",
  projectId: "milay-beauty",
  storageBucket: "milay-beauty.firebasestorage.app",
  messagingSenderId: "536039226279",
  appId: "1:536039226279:web:a6656ef0fdc8b3b0dd5482"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createAdmin = async () => {
  const email = "admin@milaybeauty.com";
  const password = "SuperAdmin123!";
  
  try {
    console.log("Creando usuario en Firebase Auth...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("Guardando rol en Firestore...");
    await setDoc(doc(db, "users", user.uid), {
      name: "Lucía (Super Admin)",
      email: email,
      role: "admin",
      disabled: false,
      createdAt: new Date().toISOString()
    });
    
    console.log("¡Éxito! Super Admin creado correctamente.");
    console.log(`Email: ${email}`);
    console.log(`Contraseña: ${password}`);
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("El usuario ya existe. Puedes iniciar sesión con admin@milaybeauty.com");
    } else {
      console.error("Error creando el usuario:", error.message);
    }
    process.exit(1);
  }
};

createAdmin();
