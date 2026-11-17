// Configuracion de Firebase.
// Es seguro commitearlo: estas claves solo sirven para identificar el proyecto;
// la proteccion real vive en las reglas de Firestore (firestore.rules).

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB6NazRnUoCuCkyL5mJmTaozdw2TIwAezE",
  authDomain: "fir-tareas-b3763.firebaseapp.com",
  projectId: "fir-tareas-b3763",
  storageBucket: "fir-tareas-b3763.firebasestorage.app",
  messagingSenderId: "590369763720",
  appId: "1:590369763720:web:8f1f3709bffe5fa6e2ca3d",
  measurementId: "G-19LDG5GPJ2"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
